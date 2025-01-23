import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY;
const WALLET_SCORES_URL = 'https://api.unleashnfts.com/api/v2/nft/wallet/scores';

export async function GET(request) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        
        // Required parameters
        const wallet = searchParams.get('wallet');
        
        // Optional parameters with defaults
        const blockchain = searchParams.get('blockchain') || 'ethereum';
        const sort_by = searchParams.get('sort_by') || 'portfolio_value';
        const sort_order = searchParams.get('sort_order') || 'desc';
        const time_range = searchParams.get('time_range') || 'all';
        const offset = searchParams.get('offset') || '0';
        const limit = searchParams.get('limit') || '30';

        // Validate required parameters
        if (!wallet) {
            return NextResponse.json(
                { error: "Missing required parameter: wallet" },
                { status: 400 }
            );
        }

        // Fetch wallet scores
        const response = await axios.get(WALLET_SCORES_URL, {
            params: {
                wallet,
                blockchain,
                sort_by,
                sort_order,
                time_range,
                offset,
                limit
            },
            headers: {
                accept: 'application/json',
                'x-api-key': API_KEY
            }
        });

        // Return the response data
        return NextResponse.json(response.data);

    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        
        // Handle different types of errors
        if (error.response?.status === 404) {
            return NextResponse.json(
                { error: "Wallet data not found" },
                { status: 404 }
            );
        }
        
        if (error.response?.status === 429) {
            return NextResponse.json(
                { error: "Rate limit exceeded" },
                { status: 429 }
            );
        }

        if (error.response?.status === 401) {
            return NextResponse.json(
                { error: "API key invalid or missing" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                error: "Failed to fetch wallet scores",
                details: error.response?.data || error.message
            },
            { status: error.response?.status || 500 }
        );
    }
}
