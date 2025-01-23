import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config()

const API_KEY = process.env.API_KEY;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const blockchain = searchParams.get('blockchain');
    const contract_address = searchParams.get('contract_address');
    const token_id = searchParams.get('token_id');
    const currency = searchParams.get('currency');

    const BASE_URL = `https://api.unleashnfts.com/api/v1/nft/${blockchain}/${contract_address}/${token_id}?currency=${currency}&include_washtrade=true`;

    try {
        const response = await axios.get(BASE_URL, {
            headers: {
                accept: "application/json",
                "x-api-key": API_KEY,
            },
        });
        return NextResponse.json({ imageUrl: response.data.token_image_url });
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