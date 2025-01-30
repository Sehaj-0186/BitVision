import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY;

async function fetchPaginatedData(url, params) {
  let allData = [];
  let offset = 0;
  const limit = 30;
  let hasNext = true;

  while (hasNext) {
    const response = await axios.get(url, {
      headers: { 
        accept: "application/json",
        "x-api-key": API_KEY 
      },
      params: { 
        ...params,
        offset,
        limit
      }
    });

    const responseData = response.data;
    if (responseData.data && Array.isArray(responseData.data)) {
      allData = [...allData, ...responseData.data];
    }

    hasNext = responseData.pagination?.has_next || false;
    if (hasNext) offset += limit;
  }

  return allData;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const blockchain = searchParams.get("blockchain") || "ethereum";
  const contract_address = searchParams.get("contract_address");
  const time_range = searchParams.get("time_range") || "24h";

  if (!contract_address) {
    return NextResponse.json(
      { error: "Contract address is required" },
      { status: 400 }
    );
  }

  try {
    const [analytics, scores, traders, washTrade] = await Promise.all([
  
      fetchPaginatedData(
        "https://api.unleashnfts.com/api/v2/nft/collection/analytics",
        {
          blockchain,
          contract_address,
          time_range,
          sort_by: "sales",
          sort_order: "desc"
        }
      ),
     
      fetchPaginatedData(
        "https://api.unleashnfts.com/api/v2/nft/collection/scores",
        {
          blockchain,
          contract_address,
          time_range,
          sort_by: "market_cap",
          sort_order: "desc"
        }
      ),
    
      fetchPaginatedData(
        "https://api.unleashnfts.com/api/v2/nft/collection/traders",
        {
          blockchain,
          contract_address,
          time_range,
          sort_by: "traders",
          sort_order: "desc"
        }
      ),
     
      fetchPaginatedData(
        "https://api.unleashnfts.com/api/v2/nft/collection/washtrade",
        {
          blockchain,
          contract_address,
          time_range,
          sort_by: "washtrade_assets",
          sort_order: "desc"
        }
      )
    ]);

    
    const formattedData = {
      assets: analytics[0]?.assets || 0,
      floor_price: analytics[0]?.floor_price || 0,
      sales: analytics[0]?.sales || 0,
      transactions: analytics[0]?.transactions || 0,
      volume: analytics[0]?.volume || 0,
      royalty_price: scores[0]?.royalty_price || 0,
      minting_revenue: scores[0]?.minting_revenue || 0,
      traders_count: traders[0]?.traders || 0,
      washtrade_volume: washTrade[0]?.washtrade_volume || 0
    };

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error("Prediction data error:", {
      status: error.response?.status,
      error: error.response?.data || error.message,
      params: { blockchain, contract_address, time_range }
    });

    return NextResponse.json(
      {
        error: "Failed to fetch prediction data",
        details: error.response?.data || error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}
