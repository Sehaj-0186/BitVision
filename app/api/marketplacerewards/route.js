import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");

    // Validate wallet parameter
    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const options = {
      method: "GET",
      url: `https://api.unleashnfts.com/api/v2/nft/wallet/profile`,
      params: {
        wallet: wallet,
        offset: 0,
        limit: 30,
      },
      headers: {
        accept: "application/json",
        "x-api-key": process.env.API_KEY,
      },
    };

    const response = await axios.request(options);

    // Check if response data exists and has the expected structure
    if (
      !response.data ||
      !response.data.data ||
      !Array.isArray(response.data.data) ||
      response.data.data.length === 0
    ) {
      console.log("API returned no data for wallet:", wallet);
      return NextResponse.json(
        {
          blur: 0,
          looks: 0,
          stats: {
            collection_count: 0,
            nft_count: 0,
            is_shark: false,
            is_whale: false,
            washtrade_nft_count: 0,
          },
          risk: {
            is_sanctioned: false,
            risk_level: "unknown",
            is_custodial: false,
            is_contract: false,
          },
          message: "No data found for the provided wallet address",
        },
        { status: 200 }
      );
    }

    const walletData = response.data.data[0];

    const rewardsData = {
      blur: walletData.nft_marketplace_reward?.blur || 0,
      looks: walletData.nft_marketplace_reward?.looks || 0,
      stats: {
        collection_count: walletData.collection_count || 0,
        nft_count: walletData.nft_count || 0,
        is_shark: walletData.is_shark || false,
        is_whale: walletData.is_whale || false,
        washtrade_nft_count: walletData.washtrade_nft_count || 0,
      },
      risk: {
        is_sanctioned: walletData.aml_is_sanctioned || false,
        risk_level: walletData.aml_risk_level || "low",
        is_custodial: walletData.is_custodial || false,
        is_contract: walletData.is_contract || false,
      },
    };

    return NextResponse.json(rewardsData);
  } catch (error) {
    console.error("Marketplace rewards API error:", error);

    // Enhanced error logging
    if (axios.isAxiosError(error)) {
      console.error("API Response details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        params: error.config?.params,
      });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch marketplace rewards",
        details: error.response?.data?.error || error.message,
        blur: 0,
        looks: 0,
        stats: {
          collection_count: 0,
          nft_count: 0,
          is_shark: false,
          is_whale: false,
          washtrade_nft_count: 0,
        },
        risk: {
          is_sanctioned: false,
          risk_level: "unknown",
          is_custodial: false,
          is_contract: false,
        },
      },
      { status: error.response?.status || 500 }
    );
  }
}
