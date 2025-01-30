import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";
import { getChainName } from "../../../utils/chainMapping";
dotenv.config();

const API_KEY = process.env.API_KEY;
const BASE_URL = "https://api.unleashnfts.com/api/v2/nft/liquify/price_estimate";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const blockchainId = searchParams.get("blockchain");
  const contract_address = searchParams.get("contract_address");
  const token_id = searchParams.get("token_id");
  const currency = searchParams.get("currency") || "usd";

  
  if (!blockchainId || !contract_address || !token_id) {
    return NextResponse.json({
      error: "Missing required parameters",
      required: {
        blockchain: "string (required)",
        contract_address: "string (required)",
        token_id: "string (required)",
        currency: "string (optional)"
      },
      provided: {
        blockchain: blockchainId,
        contract_address,
        token_id,
        currency
      }
    }, { status: 400 });
  }

  // Convert blockchain ID to name
  const blockchain = getChainName(Number(blockchainId));

  try {
    const response = await axios.get(BASE_URL, {
      headers: { "x-api-key": API_KEY },
      params: {
        blockchain,
        contract_address,
        token_id,
        currency: currency.toLowerCase(),
        limit: 1
      }
    });

    let imageUrl = null;
    if (response.data?.data?.[0]?.token_image_url) {
      imageUrl = response.data.data[0].token_image_url;
    } else {
      imageUrl = "/—Pngtree—illustration of a flat vector_12324408.png";
    }

    return NextResponse.json({ imageUrl: imageUrl || "NA" });

  } catch (error) {
    console.error("Token image error:", {
      status: error.response?.status,
      error: error.response?.data || error.message,
      params: { blockchain, contract_address, token_id, currency }
    });

    return NextResponse.json({
      error: "Failed to fetch NFT image",
      details: error.response?.data || error.message,
      required: {
        blockchain: "string (required)",
        contract_address: "string (required)",
        token_id: "string (required)"
      }
    }, { status: error.response?.status || 500 });
  }
}