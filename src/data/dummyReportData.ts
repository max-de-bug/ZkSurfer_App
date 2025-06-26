// dummyReportData.ts

import { ReportData } from '@/types/types';

export const dummyReportData: ReportData = {
  predictionAccuracy: 87,
  predictionSeries: [
    { label: '1D', btc: 90000, eth: 6000, sol: 140 },
    { label: '3D', btc: 92000, eth: 6200, sol: 145 },
    { label: '7D', btc: 91000, eth: 6100, sol: 142 },
    { label: 'SOL', btc: 95000, eth: 6500, sol: 150 },
  ],
  priceStats: [
    { symbol: 'BTC', value: '$95,007', change: '+0.02%', sentiment: 'bullish' },
    { symbol: 'SOL', value: '$164', sentiment: 'bullish' },
  ],
  marketSentiment: 'bearish',
  avoidTokens: ['DOGE'],
  newsImpact: [
    { title: 'SOL Price Surges', sentiment: 'bullish' },
  ],
  volatility: 'moderate',
  liquidity: 'high',
  trendingNews: [
    {
      title: 'Ethereum Sharding Triples Network Throughput',
      excerpt: 'Ethereum’s major sharding implementation has dramatically increased transaction capacity to 100,000+ TPS, surpassing traditional payment systems. DeFi protocols are already experiencing faster, cheaper transactions.',
      impact: 'bullish',
    },
    {
      title: 'Ethereum Sharding Triples Network Throughput',
      excerpt: 'Ethereum’s major sharding implementation has dramatically increased transaction capacity to 100,000+ TPS, surpassing traditional payment systems. DeFi protocols are already experiencing faster, cheaper transactions.',
      impact: 'mixed',
    },
    {
      title: 'Ethereum Sharding Triples Network Throughput',
      excerpt: 'Ethereum’s major sharding implementation has dramatically increased transaction capacity to 100,000+ TPS, surpassing traditional payment systems. DeFi protocols are already experiencing faster, cheaper transactions.',
      impact: 'bearish',
    },
    {
      title: 'Ethereum Sharding Triples Network Throughput',
      excerpt: 'Ethereum’s major sharding implementation has dramatically increased transaction capacity to 100,000+ TPS, surpassing traditional payment systems. DeFi protocols are already experiencing faster, cheaper transactions.',
      impact: 'bullish',
    },
    {
      title: 'Ethereum Sharding Triples Network Throughput',
      excerpt: 'Ethereum’s major sharding implementation has dramatically increased transaction capacity to 100,000+ TPS, surpassing traditional payment systems. DeFi protocols are already experiencing faster, cheaper transactions.',
      impact: 'bearish',
    },
  ],
  whatsNew: [
    // { text: 'New token: MoonCat (MOON) launched – Airdrop ongoing' },
    // { text: 'Ethereum consensus upgrade scheduled June 15' },
    // { text: 'Solana mobile beta live' },
  ],
  recommendations: [
    // {
    //   label: 'STRONG BUY',
    //   items: [
    //     { symbol: 'BTC', target: '$110K' },
    //     { symbol: 'ETH', target: '$7K' },
    //     { symbol: 'SOL', target: '$250' },
    //   ],
    //   borderClass: 'border-green-500',
    //   textClass: 'text-green-500',
    //   dotClass: 'bg-green-500',
    // },
    // {
    //   label: 'SELL/AVOID',
    //   items: [
    //     { symbol: 'SOL', target: '$120' },
    //   ],
    //   borderClass: 'border-red-500',
    //   textClass: 'text-red-500',
    //   dotClass: 'bg-red-500',
    // },
    // {
    //   label: 'HOLD',
    //   items: [
    //     { symbol: 'BTC', target: '$100K' },
    //     { symbol: 'SOL', target: '$200' },
    //   ],
    //   borderClass: 'border-yellow-500',
    //   textClass: 'text-yellow-500',
    //   dotClass: 'bg-yellow-500',
    // },
  ],
};
