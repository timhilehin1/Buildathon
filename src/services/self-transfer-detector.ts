const SELF_TRANSFER_PHRASES = [
  'transfer to your',
  'self transfer',
  'own account',
  'personal account',
  'fund your',
  'top up',
  'wallet funding',
  'topup',
];

const WALLET_PROVIDERS = ['opay', 'kuda', 'palmpay', 'moniepoint', 'paga', 'carbon'];

export function detectSelfTransfer(text: string): boolean {
  const lower = text.toLowerCase();
  for (const phrase of SELF_TRANSFER_PHRASES) {
    if (lower.includes(phrase)) return true;
  }
  for (const provider of WALLET_PROVIDERS) {
    if (lower.includes(provider)) return true;
  }
  return false;
}
