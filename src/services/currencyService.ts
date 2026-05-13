export interface ExchangeRates {
  [key: string]: number;
}

// Mock rates as a baseline, but structured for real API integration
const MOCK_RATES: Record<string, ExchangeRates> = {
  USD: { EUR: 0.92, UGX: 3750, GBP: 0.79, KES: 130 },
  EUR: { USD: 1.09, UGX: 4050, GBP: 0.86, KES: 141 },
  UGX: { USD: 0.00027, EUR: 0.00025, GBP: 0.00021, KES: 0.035 },
};

export async function getExchangeRates(baseCurrency: string): Promise<ExchangeRates> {
  // In a real app, you'd fetch from an API like:
  // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
  // return (await response.json()).rates;
  
  // For now, we return our mock data with a slight delay to simulate network
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_RATES[baseCurrency] || { [baseCurrency]: 1 });
    }, 500);
  });
}

export function convertCurrency(amount: number, from: string, to: string, rates: ExchangeRates): number {
  if (from === to) return amount;
  const rate = rates[to];
  if (!rate) return amount; // Fallback if rate not found
  return amount * rate;
}
