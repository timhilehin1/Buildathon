import * as SQLite from 'expo-sqlite';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface LocalTransaction {
  id: string;
  amount: number;
  merchant_raw?: string;
  category_id?: number;
  bank_source: string;
  trigger_type: 'SMS' | 'SCREENSHOT' | 'MANUAL' | 'SELF_TRANSFER';
  status: 'PENDING' | 'VERIFIED' | 'DUPLICATE' | 'SELF_TRANSFER';
  timestamp: string;
  updated_at: string;
  synced: boolean;
  sync_result?: string;
  raw_body?: string;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDB(): Promise<void> {
  db = await SQLite.openDatabaseAsync('spent_it.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS local_transactions (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      merchant_raw TEXT,
      category_id INTEGER,
      bank_source TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      timestamp TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0,
      sync_result TEXT,
      raw_body TEXT
    );
  `);
}

function getDB(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}

function rowToTransaction(row: Record<string, unknown>): LocalTransaction {
  return {
    id: row.id as string,
    amount: row.amount as number,
    merchant_raw: row.merchant_raw as string | undefined,
    category_id: row.category_id as number | undefined,
    bank_source: row.bank_source as string,
    trigger_type: row.trigger_type as LocalTransaction['trigger_type'],
    status: row.status as LocalTransaction['status'],
    timestamp: row.timestamp as string,
    updated_at: row.updated_at as string,
    synced: (row.synced as number) === 1,
    sync_result: row.sync_result as string | undefined,
    raw_body: row.raw_body as string | undefined,
  };
}

export async function insertTransaction(
  t: Omit<LocalTransaction, 'id' | 'synced' | 'updated_at'>
): Promise<LocalTransaction> {
  const database = getDB();
  const id = generateUUID();
  const now = new Date().toISOString();
  await database.runAsync(
    `INSERT INTO local_transactions
      (id, amount, merchant_raw, category_id, bank_source, trigger_type, status, timestamp, updated_at, synced, sync_result, raw_body)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?)`,
    [id, t.amount, t.merchant_raw ?? null, t.category_id ?? null, t.bank_source, t.trigger_type, t.status, t.timestamp, now, t.raw_body ?? null]
  );
  return { ...t, id, synced: false, updated_at: now };
}

export async function getUnsyncedTransactions(): Promise<LocalTransaction[]> {
  const database = getDB();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM local_transactions WHERE synced = 0 ORDER BY timestamp ASC LIMIT 100'
  );
  return rows.map(rowToTransaction);
}

export async function markSynced(ids: string[], result: string): Promise<void> {
  if (ids.length === 0) return;
  const database = getDB();
  const placeholders = ids.map(() => '?').join(',');
  await database.runAsync(
    `UPDATE local_transactions SET synced = 1, sync_result = ? WHERE id IN (${placeholders})`,
    [result, ...ids]
  );
}

export async function markSyncError(id: string, error: string): Promise<void> {
  const database = getDB();
  await database.runAsync(
    'UPDATE local_transactions SET sync_result = ? WHERE id = ?',
    [error, id]
  );
}

export async function getTransactionById(id: string): Promise<LocalTransaction | null> {
  const database = getDB();
  const row = await database.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM local_transactions WHERE id = ?',
    [id]
  );
  return row ? rowToTransaction(row) : null;
}

export async function deleteTransaction(id: string): Promise<void> {
  const database = getDB();
  await database.runAsync('DELETE FROM local_transactions WHERE id = ?', [id]);
}

export async function updateTransaction(
  id: string,
  patch: Partial<Pick<LocalTransaction, 'merchant_raw' | 'category_id' | 'status'>>
): Promise<void> {
  const database = getDB();
  const now = new Date().toISOString();
  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (patch.merchant_raw !== undefined) {
    updates.push('merchant_raw = ?');
    values.push(patch.merchant_raw ?? null);
  }
  if (patch.category_id !== undefined) {
    updates.push('category_id = ?');
    values.push(patch.category_id ?? null);
  }
  if (patch.status !== undefined) {
    updates.push('status = ?');
    values.push(patch.status);
  }
  updates.push('updated_at = ?', 'synced = 0');
  values.push(now, id);

  await database.runAsync(
    `UPDATE local_transactions SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
}

export async function getAllLocalTransactions(): Promise<LocalTransaction[]> {
  const database = getDB();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM local_transactions ORDER BY timestamp DESC LIMIT 5'
  );
  return rows.map(rowToTransaction);
}
