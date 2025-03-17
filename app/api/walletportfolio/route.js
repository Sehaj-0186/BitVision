import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.API_KEY;
const BASE_URL = "https://api.unleashnfts.com/api/v2/wallet/balance/nft";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  const portfolio = {
    collections: {},
  };
  let offset = 0;
  const LIMIT = 100;

  try {
    let hasNext = true;

    while (hasNext) {
      const response = await axios.get(BASE_URL, {
        headers: {
          accept: "application/json",
          "x-api-key": API_KEY,
        },
        params: {
          wallet,
          blockchain: "ethereum",
          time_range: "all",
          sort_by: "volume",
          offset: offset.toString(),
          limit: LIMIT.toString(),
        },
      });

      // Check if data.data exists and is an array
      const nfts = response.data && response.data.data;
      if (!nfts) break;

      // Handle both array and non-array responses
      if (Array.isArray(nfts)) {
        if (nfts.length === 0) break;

        nfts.forEach((nft) => {
          const { collection, contract_address, token_id } = nft;
          if (!portfolio.collections[collection]) {
            portfolio.collections[collection] = {
              contract_address,
              tokens: [],
              count: 0,
            };
          }
          portfolio.collections[collection].tokens.push(token_id);
          portfolio.collections[collection].count++;
        });
      } else {
        console.log("API response is not an array:", nfts);
        break; // Exit loop if not an array
      }

      hasNext = response.data.pagination?.has_next || false;
      if (hasNext) {
        offset += LIMIT;
      }
    }

    return NextResponse.json({
      ...portfolio,
      pagination: {
        total: Object.keys(portfolio.collections).length,
        hasNext: false,
      },
    });
  } catch (error) {
    console.error("Error Response:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: "Failed to fetch data from API",
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
