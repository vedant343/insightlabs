import {
  getPrice,
  getMarketCap,
  get24hChange,
  getSparkline,
  get24hVolume,
  listTrending,
} from "./coinUtils";

interface TrendingCoinData {
  price: number;
  price_btc: string;
  price_change_percentage_24h: Record<string, number>;
  market_cap: string;
  market_cap_btc: string;
  total_volume: string;
  total_volume_btc: string;
  sparkline: string;
  content: string | null;
}

interface TrendingCoinItem {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
  data: TrendingCoinData;
}

interface TrendingResponse {
  coins: Array<{
    item: TrendingCoinItem;
  }>;
}

// 1. Get current price by id (like 'bitcoin', 'ethereum')
export async function fetchCurrentPrice(id: string) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
  );
  const data = await res.json();
  return data[id]?.usd;
}

// 2. Get trending coins with detailed data
export async function fetchTrendingCoins(): Promise<TrendingResponse> {
  const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
  if (!res.ok) {
    throw new Error(`Failed to fetch trending coins: ${res.statusText}`);
  }
  const data: TrendingResponse = await res.json();
  return data;
}

// 3. Get Coin Stats (like Market Cap, 24h change, Description) by id
export async function fetchBasicStats(id: string) {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
  const data = await res.json();
  return {
    marketCap: data?.market_data?.market_cap?.usd,
    change24h: data?.market_data?.price_change_percentage_24h,
    description: data?.description?.en?.split(".")[0], // first sentence
  };
}

// 4. Get 7-day price chart data
export async function fetch7DayChart(id: string) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`
  );
  const data = await res.json();
  return data.prices; // [ [timestamp, price], ... ]
}

export {
  getPrice,
  getMarketCap,
  get24hChange,
  getSparkline,
  get24hVolume,
  listTrending,
};
