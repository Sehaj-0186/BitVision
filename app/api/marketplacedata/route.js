import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";


dotenv.config();
const API_KEY = process.env.API_KEY;
const BATCH_SIZE = 30;
const BLOCKCHAIN = "ethereum";
const BASE_URL = "https://api.unleashnfts.com/api/v2/nft/marketplace";


async function fetchAllData(url, accumulatedData = []) {
  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": API_KEY,
      },
    };

    const response = await axios.get(url, options);
    const newData = response.data.data || [];

   
    const uniqueData = [...accumulatedData, ...newData].filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );

    
    if (newData.length === BATCH_SIZE) {
      const nextOffset = accumulatedData.length + BATCH_SIZE;
      const nextUrl = new URL(url);
      nextUrl.searchParams.set("offset", nextOffset.toString());
      return await fetchAllData(nextUrl.toString(), uniqueData);
    }

    return uniqueData;
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );
    return accumulatedData;
  }
}


function calculateHealthScore(trader, washInfo) {
  try {
   
    const metrics = calculateBaseMetrics(trader, washInfo);

   
    const timeWeight = calculateTimeWeight(trader.activity_duration);
    const volumeSeverity = calculateVolumeSeverity(metrics.totalVolume);

   
    const weightedComponents = calculateWeightedComponents(
      metrics,
      timeWeight,
      volumeSeverity
    );

  
    const riskMultiplier = calculateRiskMultiplier(metrics);

   
    const riskScore = calculateFinalScore(weightedComponents, riskMultiplier);

    return Number(Math.min(Math.max(riskScore, 0), 100).toFixed(2));
  } catch (error) {
    console.error("Health score calculation error:", error);
    return calculateFallbackScore(trader, washInfo);
  }
}

function calculateBaseMetrics(trader, washInfo) {
  const totalTraders = parseInt(trader.traders) || 1;
  const totalVolume = parseFloat(trader.volume) || 1;
  const totalAssets = parseInt(trader.total_assets) || 1;

 
  return {
    suspectSalesRatio: parseFloat(washInfo.washtrade_suspect_sales_ratio) || 0,
    washTradeWalletsRatio: (parseInt(washInfo.washtrade_wallets) || 0) / totalTraders,
    volumeRatio: (parseFloat(washInfo.washtrade_volume) || 0) / totalVolume,
    assetsRatio: (parseInt(washInfo.washtrade_assets) || 0) / totalAssets,
    totalVolume
  };
}

function calculateWeightedComponents(metrics, timeWeight, volumeSeverity) {
 
  return {
    suspectSales: metrics.suspectSalesRatio * 0.35,
    walletRatio: metrics.washTradeWalletsRatio * 0.3,
    volumeRatio: metrics.volumeRatio * 0.25,
    assetsRatio: metrics.assetsRatio * 0.1
  };
}

function calculateTimeWeight(activityDuration) {
  if (!activityDuration) return 1;
  const durationInDays = parseInt(activityDuration);
  return Math.min(1 + Math.log10(durationInDays / 30) / 2, 1.5);
}

function calculateVolumeSeverity(totalVolume) {
  if (!totalVolume) return 1;
  return 1 + Math.log10(totalVolume / 1000000) / 4;
}

function calculateRiskMultiplier(metrics) {
 
  return Math.max(
    metrics.suspectSalesRatio,
    metrics.washTradeWalletsRatio,
    metrics.volumeRatio
  );
}


function calculateFinalScore(components, riskMultiplier) {

  const baseScore = Object.values(components).reduce(
    (sum, value) => sum + value,
    0
  );
  return baseScore * 100;
}

function calculateFallbackScore(trader, washInfo) {
  try {
    const availableMetrics = [
      washInfo.washtrade_suspect_sales_ratio,
      trader.volume,
      washInfo.washtrade_wallets,
    ].filter((metric) => !isNaN(parseFloat(metric)));

    if (availableMetrics.length === 0) return 50;

    const partialScore =
      (availableMetrics.reduce((sum, metric) => sum + parseFloat(metric), 0) /
        availableMetrics.length) *
      50;

    return Math.min(Math.max(partialScore, 0), 100);
  } catch {
    return 50;
  }
}

function getRiskLevel(riskScore) {
  
  if (riskScore >= 75) return "Extreme Risk";
  if (riskScore >= 50) return "Very High Risk";
  if (riskScore >= 25) return "High Risk";
  if (riskScore >= 10) return "Moderate Risk";
  return "Low Risk";
}


export async function GET() {
  try {
   
    const [tradersData, washtradeData] = await Promise.all([
      fetchAllData(
        `${BASE_URL}/traders?blockchain=${BLOCKCHAIN}&time_range=all&sort_by=name&sort_order=desc&offset=0&limit=${BATCH_SIZE}`
      ),
      fetchAllData(
        `${BASE_URL}/washtrade?blockchain=${BLOCKCHAIN}&time_range=all&sort_by=name&sort_order=desc&offset=0&limit=${BATCH_SIZE}`
      ),
    ]);

    if (!tradersData.length && !washtradeData.length) {
      return NextResponse.json({ error: "No data available" }, { status: 404 });
    }

  
    const combinedData = tradersData.map((trader) => {
      const washInfo = washtradeData.find((w) => w.id === trader.id) || {};
      const healthScore = calculateHealthScore(trader, washInfo);
     
      return {
        id: trader.id,
        name: trader.name,
        url: trader.url,
        healthScore: healthScore, 
        riskLevel: getRiskLevel(healthScore),
        buyers: parseInt(trader.traders_buyers) || 0,
        sellers: parseInt(trader.traders_sellers) || 0,
        washTradeVolume: parseFloat(washInfo.washtrade_volume) || 0,
        metrics: {
          suspectSalesRatio:
            parseFloat(washInfo.washtrade_suspect_sales_ratio) || 0,
          washTradeWallets: parseInt(washInfo.washtrade_wallets) || 0,
          totalTraders: parseInt(trader.traders) || 0,
          washTradeAssets: parseInt(washInfo.washtrade_assets) || 0,
        },
      };
    });

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketplace data" },
      { status: 500 }
    );
  }
}
