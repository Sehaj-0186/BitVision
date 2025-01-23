import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const blockchain = searchParams.get('blockchain') || 'ethereum';
    const timeRange = searchParams.get('time_range') || '24h';
    const sortBy = searchParams.get('sort_by') || 'volume';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const LIMIT = 30;

    const BASE_URL = 'https://api.unleashnfts.com/api/v2/nft/wallet/analytics';
    let offset = 0;
    let allData = [];

    try {
        while (true) {
            const response = await axios.get(BASE_URL, {
                params: {
                    wallet,
                    blockchain,
                    time_range: timeRange,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                    offset: offset.toString(),
                    limit: LIMIT.toString()
                },
                headers: {
                    accept: 'application/json',
                    'x-api-key': API_KEY
                }
            });

            const currentData = response.data.data;
            if (!currentData || currentData.length === 0) break;

            allData = [...allData, ...currentData];
            offset += LIMIT;

            if (currentData.length < LIMIT) break;
        }

        return NextResponse.json({
            data: allData,
            pagination: {
                total_items: allData.length,
                limit: LIMIT,
                offset: 0
            }
        });
    } catch (error) {
        console.error("Error Response:", error.response?.data || error.message);
        return NextResponse.json(
            {
                error: "Failed to fetch wallet analysis",
                details: error.response?.data || error.message
            },
            { status: error.response?.status || 500 }
        );
    }
}
