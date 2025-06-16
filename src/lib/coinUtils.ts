export interface CoinData {
  coins: Array<{
    item: {
      id: string;
      symbol: string;
      name: string;
      market_cap_rank: number;
      score: number;
      data: {
        price: number;
        market_cap: string;
        total_volume: string;
        sparkline: string;
        content: {
          title: string;
          description: string;
        } | null;
      };
    };
  }>;
}

export function getPrice(coinData: CoinData, symbol: string) {
  const coin = coinData.coins.find(
    (c) => c.item.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return coin?.item.data.price || null;
}

export function getMarketCap(coinData: CoinData, symbol: string) {
  const coin = coinData.coins.find(
    (c) => c.item.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return coin?.item.data.market_cap
    ? parseFloat(coin.item.data.market_cap)
    : null;
}

export function get24hChange(): number | null {
  // Since 24h change is not available in trending data, we'll return null
  return null;
}

export function getSparkline(coinData: CoinData, symbol: string) {
  const coin = coinData.coins.find(
    (c) => c.item.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return coin?.item.data.sparkline || null;
}

export function get24hVolume(coinData: CoinData, symbol: string) {
  const coin = coinData.coins.find(
    (c) => c.item.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return coin?.item.data.total_volume
    ? parseFloat(coin.item.data.total_volume)
    : null;
}

export function listTrending(coinData: CoinData) {
  return coinData.coins.map((c) => ({
    name: c.item.name,
    symbol: c.item.symbol,
    rank: c.item.market_cap_rank,
  }));
}
