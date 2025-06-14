
// 1. Get current price by id (like 'bitcoin', 'ethereum')
export async function fetchCurrentPrice(id: string) {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
    )
    const data = await res.json()
    return data[id]?.usd
  }
  
  // 2. Get trending coins
  export async function fetchTrendingCoins() {
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending')
    const data = await res.json()
    return data?.coins?.map((coin: any) => ({
      id: coin.item.id,
      symbol: coin.item.symbol,
      name: coin.item.name,
      small: coin.item.small
    }))
  }
  
  // 3. Get Coin Stats (like Market Cap, 24h change, Description) by id
  export async function fetchBasicStats(id: string) {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
    const data = await res.json()
    return {
      marketCap: data?.market_data?.market_cap?.usd,
      change24h: data?.market_data?.price_change_percentage_24h,
      description: data?.description?.en?.split('.')[0] // first sentence
    }
  }
  
  