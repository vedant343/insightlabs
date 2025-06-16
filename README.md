# Conversational Crypto Web-Chat

It provides a clean chat UI where you can:

- Query current prices of cryptocurrencies
- View trending coins
- Display 7-Day price charts
- Check portfolio holdings
- Get basic stats
- Support text and voice responses

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **UI:** [React](https://react.dev/) with [Tailwind CSS](https://tailwindcss.com/)
- **Chart:** [Chart.js](https://www.chartjs.org/)
- **API:** [ CoinGecko API ](https://api.coingecko.com/api/v3/search/trending)

## Live Link

[View live application here](https://insightlabs-z8kn.vercel.app/)

## Features

- Clean, mobile-friendly UI
- Chat-like messages with smooth scroll
- API Integration: CoinGecko
- Trending coins, price charts, portfolio holdings
- Voice output for responses
- “Thinking...” Indicator while loading
- Rate limit fallback messages

## Installation and Run instructions (Local)

1. Clone this repository:

```bash
git clone https://github.com/vedant343/insightlabs.git
cd insightlabs
```

2. Install the required packages:

```bash
npm install
```

or

```bash
yarn install
```

3. Start the development server:

```bash
npm run dev
```

or

```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API

- **Trending:**
  ```
  https://api.coingecko.com/api/v3/search/trending
  ```
- CoinGecko's API is used to retrieve prices, charts, and portfolio data.  
  See [https://www.coingecko.com/en/api/documentation](https://www.coingecko.com/en/api/documentation) for more details.
