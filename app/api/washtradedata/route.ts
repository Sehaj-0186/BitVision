import { NextResponse } from 'next/server';
import axios from 'axios';

// Directly use the API key since it's already public in the frontend
const API_KEY = '0385f2a4bef504a96ba79b36343195e5';
const BASE_URL = 'https://api.unleashnfts.com/api/v2/nft/market-insights';

async function fetchWashTradeData(chain: string, timeFrame: string) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-api-key': API_KEY  // Use the API key directly
      }
    };

    const response = await axios.get(
      `${BASE_URL}/washtrade?blockchain=${chain}&time_range=${timeFrame}`,
      options
    );
    
    return response.data.data[0];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Wash Trade API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFrame = searchParams.get('timeFrame') || '24h';
    const chain = searchParams.get('chain') || 'ethereum';

    const validTimeFrames = ['24h', '7d', '30d', '90d', 'all'];
    const validChains = ['ethereum', 'binance', 'avalanche', 'linea', 'solana', 'polygon', 'bitcoin'];

    if (!validTimeFrames.includes(timeFrame)) {
      return NextResponse.json({
        error: 'Invalid timeFrame parameter',
        supportedTimeframes: validTimeFrames
      }, { status: 400 });
    }

    if (!validChains.includes(chain)) {
      return NextResponse.json({
        error: 'Invalid chain parameter',
        supportedChains: validChains
      }, { status: 400 });
    }

    const data = await fetchWashTradeData(chain, timeFrame);

    // Format response data
    const formattedData = data.block_dates.map((date: string, index: number) => ({
      date: new Date(date).toISOString(),
      assets: data.washtrade_assets_trend[index] || 0,
      suspectSales: data.washtrade_suspect_sales_trend[index] || 0,
      suspectTransactions: data.washtrade_suspect_transactions_trend[index] || 0,
      volume: data.washtrade_volume_trend[index] || 0,
      wallets: data.washtrade_wallets_trend[index] || 0
    }));

    const response = {
      data: formattedData,
      metadata: {
        timeFrame,
        chain,
        totals: {
          assets: data.washtrade_assets,
          suspectSales: data.washtrade_suspect_sales,
          suspectTransactions: data.washtrade_suspect_transactions,
          volume: data.washtrade_volume,
          wallets: data.washtrade_wallets
        },
        changes: {
          assets_change: data.washtrade_assets_change,
          suspect_sales_change: data.washtrade_suspect_sales_change,
          suspect_transactions_change: data.washtrade_suspect_transactions_change,
          volume_change: data.washtrade_volume_change,
          wallets_change: data.washtrade_wallets_change
        }
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    const errorResponse = {
      error: 'Failed to fetch wash trade data',
      details: error.response?.data?.error || error.message,
      timestamp: new Date().toISOString()
    };

    console.error('API Error:', errorResponse);
    return NextResponse.json(errorResponse, { 
      status: error.response?.status || 500 
    });
  }
}