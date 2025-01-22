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
    while (true) {
      const response = await axios.get(BASE_URL, {
        headers: {
          accept: "application/json",
          "x-api-key": API_KEY,
        },
        params: {
          wallet,
          blockchain: "ethereum",
            time_range: "all",
          sort_by:"volume",
          offset: offset.toString(),
          limit: LIMIT.toString(),
        },
      });

   


      const nfts = response.data.data;
      if (!nfts || nfts.length === 0) break;

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

      offset += LIMIT;
    }

    return NextResponse.json(portfolio);
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
