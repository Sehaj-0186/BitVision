import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config()
const API_KEY = process.env.API_KEY;
export async function GET(request) {
    const blockchain = 1;
    const contract_address = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
    const token_id = "1";
    const currency = "usd";
    const BASE_URL = `https://api.unleashnfts.com/api/v1/nft/${blockchain}/${contract_address}/${token_id}?currency=${currency}&include_washtrade=true`;
    try {
        const response = await axios.get(BASE_URL, {
            headers: {
                accept: "application/json",
                "x-api-key": API_KEY,
            },
        });
        return NextResponse.json(response.data.token_image_url);
    } catch (error) {
        console.error("Error Response:", error.response?.data || error.message);
        return NextResponse.json(
            {
                error: "Failed to fetch NFT data",
                details: error.response?.data || error.message,
            },
            { status: error.response?.status || 500 }
        );
    }
}