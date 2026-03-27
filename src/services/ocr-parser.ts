import { detectSelfTransfer } from './self-transfer-detector';

export interface ParsedTransaction {
  amount: number;
  bank_source: string;
  merchant_raw?: string;
  timestamp: string;
  trigger_type: 'SCREENSHOT' | 'SELF_TRANSFER';
  raw_body: string;
}

const AMOUNT_PATTERNS = [
  /(?:NGN|N|₦)\s*([\d,]+(?:\.\d{2})?)/i,
  /(?:amount|total|sum)[:\s]+(?:NGN|N|₦)?\s*([\d,]+(?:\.\d{2})?)/i,
  /([\d,]+\.\d{2})\s*(?:NGN|N|₦)?/,
];

const BANK_NAMES = [
  'GTBank', 'Access Bank', 'Zenith Bank', 'UBA', 'First Bank',
  'Opay', 'Kuda', 'Palmpay', 'Moniepoint', 'Stanbic', 'Fidelity',
  'Polaris', 'Sterling', 'Wema', 'Union Bank', 'Ecobank',
];

function detectBankFromText(text: string): string {
  const lower = text.toLowerCase();
  for (const bank of BANK_NAMES) {
    if (lower.includes(bank.toLowerCase())) return bank;
  }
  return 'Unknown Bank';
}

function parseAmount(text: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const num = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return null;
}

function extractMerchant(text: string): string | undefined {
  const patterns = [
    /(?:at|merchant|payee|paid to)[:\s]+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\n|$)/i,
    /(?:description|narration)[:\s]+([A-Z][A-Z0-9\s&'\-\.]+?)(?:\n|$)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim().toUpperCase();
  }
  return undefined;
}

export function parseOCRText(text: string): ParsedTransaction | null {
  const amount = parseAmount(text);
  if (!amount) return null;

  const bank_source = detectBankFromText(text);
  const merchant_raw = extractMerchant(text);
  const isSelfTransfer = detectSelfTransfer(text);

  return {
    amount,
    bank_source,
    merchant_raw,
    timestamp: new Date().toISOString(),
    trigger_type: isSelfTransfer ? 'SELF_TRANSFER' : 'SCREENSHOT',
    raw_body: text,
  };
}
