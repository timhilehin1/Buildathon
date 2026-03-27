import { detectSelfTransfer } from './self-transfer-detector';

export interface ParsedTransaction {
  amount: number;
  bank_source: string;
  merchant_raw?: string;
  timestamp: string;
  trigger_type: 'SMS' | 'SELF_TRANSFER';
  raw_body: string;
}

const DEBIT_KEYWORDS = /debited|deducted|charged|payment of|debit alert|sent|withdrawn/i;
const CREDIT_KEYWORDS = /credited|credit alert|received|deposit|inflow/i;

interface BankPattern {
  name: string;
  senderPatterns: RegExp[];
  amountPattern: RegExp;
  merchantPattern?: RegExp;
  timePattern?: RegExp;
}

const BANK_PATTERNS: BankPattern[] = [
  {
    name: 'GTBank',
    senderPatterns: [/gtbank/i, /gt bank/i, /guaranty/i],
    amountPattern: /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{2})?)/i,
    merchantPattern: /(?:at|to)\s+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\s+on|\s+ref|\.|$)/i,
  },
  {
    name: 'Access Bank',
    senderPatterns: [/access bank/i, /accessbank/i],
    amountPattern: /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{2})?)/i,
    merchantPattern: /(?:at|to)\s+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\s+on|\s+ref|\.|$)/i,
  },
  {
    name: 'Zenith Bank',
    senderPatterns: [/zenith/i],
    amountPattern: /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{2})?)/i,
    merchantPattern: /(?:at|to)\s+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\s+on|\s+ref|\.|$)/i,
  },
  {
    name: 'UBA',
    senderPatterns: [/\buba\b/i, /united bank for africa/i],
    amountPattern: /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{2})?)/i,
    merchantPattern: /(?:at|to)\s+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\s+on|\s+ref|\.|$)/i,
  },
  {
    name: 'First Bank',
    senderPatterns: [/first bank/i, /firstbank/i],
    amountPattern: /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{2})?)/i,
    merchantPattern: /(?:at|to)\s+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\s+on|\s+ref|\.|$)/i,
  },
  {
    name: 'Opay',
    senderPatterns: [/opay/i],
    amountPattern: /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{2})?)/i,
    merchantPattern: /(?:to)\s+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\s+was|\s+on|\.|$)/i,
  },
  {
    name: 'Kuda',
    senderPatterns: [/kuda/i],
    amountPattern: /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{2})?)/i,
    merchantPattern: /(?:to)\s+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\s+was|\s+on|\.|$)/i,
  },
  {
    name: 'Palmpay',
    senderPatterns: [/palmpay/i],
    amountPattern: /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{2})?)/i,
    merchantPattern: /(?:to)\s+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\s+was|\s+on|\.|$)/i,
  },
  {
    name: 'Moniepoint',
    senderPatterns: [/moniepoint/i],
    amountPattern: /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{2})?)/i,
    merchantPattern: /(?:at|to)\s+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\s+on|\s+ref|\.|$)/i,
  },
];

function detectBank(smsBody: string): BankPattern | null {
  for (const pattern of BANK_PATTERNS) {
    for (const re of pattern.senderPatterns) {
      if (re.test(smsBody)) return pattern;
    }
  }
  return null;
}

function parseAmount(smsBody: string, pattern: RegExp): number | null {
  const match = smsBody.match(pattern);
  if (!match?.[1]) return null;
  const num = parseFloat(match[1].replace(/,/g, ''));
  return isNaN(num) || num <= 0 ? null : num;
}

export function parseSMS(smsBody: string): ParsedTransaction | null {
  if (!DEBIT_KEYWORDS.test(smsBody)) return null;
  if (CREDIT_KEYWORDS.test(smsBody) && !DEBIT_KEYWORDS.test(smsBody)) return null;

  const bank = detectBank(smsBody);
  if (!bank) return null;

  const amount = parseAmount(smsBody, bank.amountPattern);
  if (!amount) return null;

  let merchant_raw: string | undefined;
  if (bank.merchantPattern) {
    const match = smsBody.match(bank.merchantPattern);
    if (match?.[1]) {
      merchant_raw = match[1].trim().toUpperCase();
    }
  }

  const isSelfTransfer = detectSelfTransfer(smsBody);

  return {
    amount,
    bank_source: bank.name,
    merchant_raw,
    timestamp: new Date().toISOString(),
    trigger_type: isSelfTransfer ? 'SELF_TRANSFER' : 'SMS',
    raw_body: smsBody,
  };
}
