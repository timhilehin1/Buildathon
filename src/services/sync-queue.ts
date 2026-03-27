import { getUnsyncedTransactions, markSynced, markSyncError } from '@/src/db/local-db';
import { syncApi, SyncResultCode } from '@/src/api/sync';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

let isFlushing = false;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function flushQueue(): Promise<void> {
  if (isFlushing) return;
  isFlushing = true;

  try {
    const unsynced = await getUnsyncedTransactions();
    if (unsynced.length === 0) return;

    const batch = unsynced.slice(0, 100);

    let retries = 0;
    let delay = BASE_DELAY_MS;

    while (retries <= MAX_RETRIES) {
      try {
        const response = await syncApi.push(
          batch.map((t) => ({
            id: t.id,
            amount: t.amount,
            bank_source: t.bank_source,
            trigger_type: t.trigger_type,
            status: t.status,
            timestamp: t.timestamp,
            updated_at: t.updated_at,
            merchant_raw: t.merchant_raw,
            category_id: t.category_id,
          }))
        );

        const syncedIds: string[] = [];
        const errorIds: { id: string; code: SyncResultCode }[] = [];

        for (const result of response.results) {
          const terminal: SyncResultCode[] = [
            'SYNCED',
            'DUPLICATE_SKIPPED',
            'MERGE_CANDIDATE',
            'SELF_TRANSFER_SKIPPED',
            'TIMESTAMP_OUT_OF_RANGE',
            'ZERO_IMAGE_POLICY_VIOLATION',
          ];
          if (terminal.includes(result.result)) {
            syncedIds.push(result.id);
          } else {
            errorIds.push({ id: result.id, code: result.result });
          }
        }

        if (syncedIds.length > 0) {
          await markSynced(syncedIds, 'SYNCED');
        }
        for (const { id, code } of errorIds) {
          await markSyncError(id, code);
        }

        break;
      } catch (err) {
        if (retries === MAX_RETRIES) {
          console.warn('[SyncQueue] Max retries reached, giving up.');
          break;
        }
        retries++;
        await sleep(Math.min(delay, MAX_DELAY_MS));
        delay *= 2;
      }
    }
  } finally {
    isFlushing = false;
  }
}
