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

export {
  getPrice,
  getMarketCap,
  get24hChange,
  getSparkline,
  get24hVolume,
  listTrending,
};
