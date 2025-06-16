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
  market_cap: string;
  market_cap_btc: string;
  total_volume: string;
  total_volume_btc: string;
  sparkline: string;
  content: {
    title: string;
    description: string;
  } | null;
}

interface TrendingCoinItem {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  score: number;
  data: TrendingCoinData;
}

interface TrendingResponse {
  coins: Array<{
    item: TrendingCoinItem;
  }>;
}

// Get coin description by id
export async function getCoinDescription(id: string): Promise<string | null> {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
  const data = await res.json();
  return data?.description?.en || null;
}

// Get coin stats by id
export async function getCoinStats(id: string) {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
  const data = await res.json();
  return {
    marketCap: data?.market_data?.market_cap?.usd,
    marketCapRank: data?.market_cap_rank,
    totalVolume: data?.market_data?.total_volume?.usd,
    sparkline: data?.image?.sparkline,
    score: data?.community_score,
    coinId: data?.id,
  };
}

// Get trending coins with detailed data
export async function fetchTrendingCoins(): Promise<TrendingResponse> {
  const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
  if (!res.ok) {
    throw new Error(`Failed to fetch trending coins: ${res.statusText}`);
  }
  const data: TrendingResponse = await res.json();
  return data;
}

// Get portfolio value (unchanged)
export async function getPortfolioValue(holdings: Record<string, number>) {
  const ids = Object.keys(holdings).join(",");
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
  );
  const data = await res.json();

  return Object.entries(holdings).reduce((total, [id, amount]) => {
    const price = data[id]?.usd || 0;
    return total + price * amount;
  }, 0);
}

// Get current price of a coin by id
export async function fetchCurrentPrice(id: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch price: ${res.statusText}`);
    }
    const data = await res.json();
    return data[id]?.usd || null;
  } catch (error) {
    console.error("Error fetching current price:", error);
    return null;
  }
}

// Get 7-day price chart data for a coin
export async function fetch7DayChart(
  id: string
): Promise<[number, number][] | null> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7&interval=daily`
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch chart data: ${res.statusText}`);
    }
    const data = await res.json();
    return data.prices.map(([timestamp, price]: [number, number]) => [
      timestamp,
      price,
    ]);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return null;
  }
}

export {
  getPrice,
  getMarketCap,
  get24hChange,
  getSparkline,
  get24hVolume,
  listTrending,
};
