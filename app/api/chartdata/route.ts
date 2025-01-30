import { NextResponse } from 'next/server';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.unleashnfts.com/api/v2/nft/market-insights';

async function fetchMarketData(chain: string, timeFrame: string) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': API_KEY
      }
    };

   
    const normalizeTimestamps = (data: any) => {
      if (chain === 'bitcoin') {
       
        const normalizedDates = data.block_dates.map((date: string) => {
          const timestamp = new Date(date);
          
          if (timeFrame === '24h') {
            timestamp.setMinutes(0, 0, 0);
          }
          return timestamp.toISOString();
        });
        return { ...data, block_dates: normalizedDates };
      }
      return data;
    };

    const analyticsResponse = await axios.get(`${BASE_URL}/analytics?blockchain=${chain}&time_range=${timeFrame}`, options);
    const holdersResponse = await axios.get(`${BASE_URL}/holders?blockchain=${chain}&time_range=${timeFrame}`, options);
    const tradersResponse = await axios.get(`${BASE_URL}/traders?blockchain=${chain}&time_range=${timeFrame}`, options);

    return {
      analytics: normalizeTimestamps(analyticsResponse.data.data[0]),
      holders: normalizeTimestamps(holdersResponse.data.data[0]),
      traders: normalizeTimestamps(tradersResponse.data.data[0])
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers
      });
    }
    throw error;
  }
}

export async function GET(request: Request) {
  let timeFrame: string;
  let chain: string;
  try {
    const { searchParams } = new URL(request.url);
    timeFrame = searchParams.get('timeFrame') || '24h';
    chain = searchParams.get('chain') || 'ethereum';

   
    const validTimeFrames = ['24h', '7d', '30d', '90d', 'all'];
    const validChains = ['ethereum', 'binance', 'avalanche', 'linea', 'solana', 'polygon', 'bitcoin'];

    if (!validTimeFrames.includes(timeFrame)) {
      return NextResponse.json(
        { 
          error: 'Invalid timeFrame parameter. Supported values are: 24h, 7d, 30d, 90d, all',
          supportedTimeframes: validTimeFrames 
        },
        { status: 400 }
      );
    }

    if (!validChains.includes(chain)) {
      return NextResponse.json(
        { 
          error: 'Invalid chain parameter',
          supportedChains: validChains
        },
        { status: 400 }
      );
    }

    
    if (chain === 'ethereum' && timeFrame === 'all') {
      return NextResponse.json(
        { error: 'All time frame not supported for Ethereum' },
        { status: 400 }
      );
    }

    // console.log('Fetching data for:', { chain, timeFrame });
    const data = await fetchMarketData(chain, timeFrame);

  
    if (!data.analytics?.block_dates || !data.holders?.holders_trend || !data.traders?.traders_trend) {
      console.error('Invalid data structure received:', data);
      return NextResponse.json(
        { error: 'Invalid data structure received from API' },
        { status: 500 }
      );
    }

  
    const formattedData = data.analytics.block_dates.map((date: string, index: number) => ({
      date: new Date(date).toLocaleString(),
      volume_trend: data.analytics.volume_trend?.[index] || 0,
      sales_trend: data.analytics.sales_trend?.[index] || 0,
      transactions_trend: data.analytics.transactions_trend?.[index] || 0,
      holders_trend: data.holders.holders_trend?.[index] || 0,
      traders_trend: data.traders.traders_trend?.[index] || 0,
      traders_buyers_trend: data.traders.traders_buyers_trend?.[index] || 0,
      traders_sellers_trend: data.traders.traders_sellers_trend?.[index] || 0,
    }));

    const response = {
      data: formattedData,
      metadata: {
        timeFrame,
        chain,
        totals: {
          volume: data.analytics.volume || 0,
          sales: data.analytics.sales || 0,
          transactions: data.analytics.transactions || 0,
          holders: data.holders.holders || 0,
          traders: data.traders.traders || 0
        },
        changes: {
          volume_change: data.analytics.volume_change || 0,
          sales_change: data.analytics.sales_change || 0,
          transactions_change: data.analytics.transactions_change || 0,
          holders_change: data.holders.holders_change || 0,
          traders_change: data.traders.traders_change || 0
        }
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    
    const errorResponse = {
      error: 'Failed to fetch market data',
      details: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString(),
      params: { timeFrame, chain }
    };

    console.error('API Error:', errorResponse);
    return NextResponse.json(errorResponse, { status: error.response?.status || 500 });
  }
}
