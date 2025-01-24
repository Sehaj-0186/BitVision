import { NextResponse } from 'next/server';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.API_KEY;
const BATCH_SIZE = 30;

async function fetchAllData(url, accumulatedData = []) {
  try {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': API_KEY }
    };

    const response = await axios.get(url, options);
    const newData = response.data.data || []; // Access the data array from response

    // Remove duplicates based on id
    const uniqueData = [...accumulatedData, ...newData].filter((v, i, a) => 
      a.findIndex(t => t.id === v.id) === i
    );
    
    // If we received a full batch, fetch next page
    if (newData.length === BATCH_SIZE) {
      const nextOffset = accumulatedData.length + BATCH_SIZE;
      const nextUrl = new URL(url);
      nextUrl.searchParams.set('offset', nextOffset.toString());
      return await fetchAllData(nextUrl.toString(), uniqueData);
    }
    return uniqueData;
  } catch (error) {
    console.error('Error fetching data:', error.response?.data || error.message);
    return accumulatedData; // Return what we have so far instead of throwing
  }
}

export async function GET() {
  try {
    const baseUrl = 'https://api.unleashnfts.com/api/v2/nft/marketplace';
    const [tradersData, washtradeData] = await Promise.all([
      fetchAllData(`${baseUrl}/traders?blockchain=ethereum&time_range=all&sort_by=name&sort_order=desc&offset=0&limit=${BATCH_SIZE}`),
      fetchAllData(`${baseUrl}/washtrade?blockchain=ethereum&time_range=all&sort_by=name&sort_order=desc&offset=0&limit=${BATCH_SIZE}`)
    ]);

    if (!tradersData.length && !washtradeData.length) {
      return NextResponse.json({ error: 'No data available' }, { status: 404 });
    }

    // Combine the data
    const combinedData = tradersData.map(trader => {
      const washInfo = washtradeData.find(w => w.id === trader.id) || {};
      const healthScore = calculateHealthScore(trader, washInfo);
      
      return {
        name: trader.name,
        healthScore,
        riskLevel: getRiskLevel(100 - healthScore), // Add risk level
        buyers: parseInt(trader.traders_buyers) || 0,
        sellers: parseInt(trader.traders_sellers) || 0,
        washTradeVolume: parseFloat(washInfo.washtrade_volume) || 0,
        id: trader.id,
        // Add additional metrics for transparency
        metrics: {
          suspectSalesRatio: parseFloat(washInfo.washtrade_suspect_sales_ratio) || 0,
          washTradeWallets: parseInt(washInfo.washtrade_wallets) || 0,
          totalTraders: parseInt(trader.traders) || 0,
          washTradeAssets: parseInt(washInfo.washtrade_assets) || 0
        }
      };
    });

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketplace data' }, 
      { status: 500 }
    );
  }
}

function calculateHealthScore(trader, washInfo) {
  try {
    // Calculate component ratios
    const suspectSalesRatio = parseFloat(washInfo.washtrade_suspect_sales_ratio) || 0;
    const totalTraders = parseInt(trader.traders) || 1;
    const washTradeWallets = parseInt(washInfo.washtrade_wallets) || 0;
    const washTradeWalletsRatio = washTradeWallets / totalTraders;
    
    // For volume ratio, we need to handle the case where total volume might be 0
    const washTradeVolume = parseFloat(washInfo.washtrade_volume) || 0;
    const totalVolume = parseFloat(trader.volume) || 1; // Assuming there's a volume field, fallback to 1
    const volumeRatio = washTradeVolume / totalVolume;

    // For assets ratio
    const washTradeAssets = parseInt(washInfo.washtrade_assets) || 0;
    const totalAssets = parseInt(trader.total_assets) || 1; // Assuming there's a total_assets field
    const assetsRatio = washTradeAssets / totalAssets;

    // Calculate risk score using the weighted formula
    const riskScore = (
      (suspectSalesRatio * 0.4) +
      (washTradeWalletsRatio * 0.3) +
      (volumeRatio * 0.2) +
      (assetsRatio * 0.1)
    ) * 100;

    // Ensure the score is between 0 and 100
    const normalizedScore = Math.min(Math.max(riskScore, 0), 100);

    // Return health score (inverse of risk score)
    return 100 - Math.round(normalizedScore);
  } catch (error) {
    console.error('Health score calculation error:', error);
    return 50; // Default score in case of calculation errors
  }
}

// Helper function to get risk level description
function getRiskLevel(riskScore) {
  if (riskScore <= 20) return 'Low Risk';
  if (riskScore <= 40) return 'Moderate Risk';
  if (riskScore <= 60) return 'High Risk';
  if (riskScore <= 80) return 'Very High Risk';
  return 'Extreme Risk';
}
