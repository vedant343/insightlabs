interface CoinData {
  coins: Array<{
    item: {
      symbol: string;
      data: {
        price: number;
        market_cap: number;
        price_change_percentage_24h: Record<string, number>;
        sparkline: string;
        total_volume: number;
      };
      name: string;
      market_cap_rank: number;
    };
  }>;
}

export function getPrice(coinData: CoinData, symbol: string) {
  const coin = coinData.coins.find(
    (c) => c.item.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return coin ? coin.item.data.price : null;
}

export function getMarketCap(coinData: CoinData, symbol: string) {
  const coin = coinData.coins.find(
    (c) => c.item.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return coin ? coin.item.data.market_cap : null;
}

export function get24hChange(
  coinData: CoinData,
  symbol: string,
  currency: string
) {
  const coin = coinData.coins.find(
    (c) => c.item.symbol.toLowerCase() === symbol.toLowerCase()
  );
  if (!coin) return null;
  const change =
    coin.item.data.price_change_percentage_24h[currency.toLowerCase()];
  return change !== undefined ? change : null;
}

export function getSparkline(coinData: CoinData, symbol: string) {
  const coin = coinData.coins.find(
    (c) => c.item.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return coin ? coin.item.data.sparkline : null;
}

export function get24hVolume(coinData: CoinData, symbol: string) {
  const coin = coinData.coins.find(
    (c) => c.item.symbol.toLowerCase() === symbol.toLowerCase()
  );
  return coin ? coin.item.data.total_volume : null;
}

export function listTrending(coinData: CoinData) {
  return coinData.coins.map((c) => ({
    name: c.item.name,
    symbol: c.item.symbol,
    rank: c.item.market_cap_rank,
  }));
}
