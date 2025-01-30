import { NextResponse } from "next/server";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.unleashnfts.com/api/v2/nft/analytics';
const WASH_TRADE_URL = 'https://api.unleashnfts.com/api/v2/nft/washtrade';
const SCORES_URL = 'https://api.unleashnfts.com/api/v2/nft/scores';
const TRANSACTIONS_URL = 'https://api.unleashnfts.com/api/v2/nft/transactions';
const PRICE_ESTIMATE_URL = 'https://api.unleashnfts.com/api/v2/nft/liquify/price_estimate';

export async function GET(request) {
    try {
     
        const { searchParams } = new URL(request.url);
        
      
        const contract_address = searchParams.get('contract_address');
        const token_id = searchParams.get('token_id');
        
        
        const blockchain = searchParams.get('blockchain') || 'ethereum';
        const time_range = searchParams.get('time_range') || 'all';
        const sort_by = searchParams.get('sort_by') || 'sales';
        const sort_order = searchParams.get('sort_order') || 'desc';
        const offset = searchParams.get('offset') || '0';
        const limit = searchParams.get('limit') || '30';

     
        if (!contract_address || !token_id) {
            return NextResponse.json(
                { error: "Missing required parameters: contract_address and token_id" },
                { status: 400 }
            );
        }

       
        let [analyticsResponse, washTradeResponse, scoresResponse, transactionsResponse, priceEstimateResponse] = 
            await Promise.allSettled([
                axios.get(BASE_URL, {
                    params: {
                        contract_address,
                        token_id,
                        blockchain,
                        time_range,
                        sort_by,
                        sort_order,
                        offset,
                        limit
                    },
                    headers: {
                        accept: 'application/json',
                        'x-api-key': API_KEY
                    }
                }),
                axios.get(WASH_TRADE_URL, {
                    params: {
                        contract_address,
                        token_id,
                        blockchain,
                        time_range,
                        sort_by: 'washtrade_volume',
                        sort_order: 'desc',
                        offset: '0',
                        limit: '1'
                    },
                    headers: {
                        accept: 'application/json',
                        'x-api-key': API_KEY
                    }
                }),
                axios.get(SCORES_URL, {
                    params: {
                        contract_address,
                        token_id,
                        blockchain,
                        time_range: 'all',
                        sort_by: 'max_price',
                        sort_order: 'desc',
                        offset: '0',
                        limit: '1'
                    },
                    headers: {
                        accept: 'application/json',
                        'x-api-key': API_KEY
                    }
                }),
                axios.get(TRANSACTIONS_URL, {
                    params: {
                        contract_address,
                        token_id,
                        blockchain,
                        time_range: '90d',
                        offset: '0',
                        limit: '30'
                    },
                    headers: {
                        accept: 'application/json',
                        'x-api-key': API_KEY
                    }
                }),
                axios.get(PRICE_ESTIMATE_URL, {
                    params: {
                        contract_address,
                        token_id,
                        blockchain
                    },
                    headers: {
                        accept: 'application/json',
                        'x-api-key': API_KEY
                    }
                })
            ]);

        
        const analyticsData = analyticsResponse.status === 'fulfilled' ? 
            analyticsResponse.value?.data?.data?.[0] : null;
            
        const washTradeData = washTradeResponse.status === 'fulfilled' ? 
            washTradeResponse.value?.data?.data?.[0] : null;
            
        const scoreData = scoresResponse.status === 'fulfilled' ? 
            scoresResponse.value?.data?.data?.[0] : null;

       
        const transactionList = transactionsResponse.status === 'fulfilled' ? 
            transactionsResponse.value?.data?.data : [];
            
        const priceEstimateData = priceEstimateResponse.status === 'fulfilled' ? 
            priceEstimateResponse.value?.data?.data?.[0] : null;

      
        const transformedData = {
            currentPrice: scoreData?.price?.toFixed(2) ?? "Not Available",
            floorPrice: analyticsData?.floor_price ?? "Not Available",
            allTimeHigh: scoreData?.max_price?.toFixed(2) ?? "Not Available",
            allTimeLow: scoreData?.all_time_low?.toFixed(2) ?? "Not Available",
            totalTransactions: analyticsData?.transactions?.toString() ?? "0",
            sales: analyticsData?.sales?.toString() ?? "0",
            totalTransfers: analyticsData?.transfers?.toString() ?? "0",
            volume: analyticsData?.volume?.toFixed(2) ?? "0",
           
            suspectTransactions: washTradeData?.washtrade_suspect_transactions?.toString() ?? "0",
            connectedWallets: washTradeData?.washtrade_wallets?.toString() ?? "0",
            washTradeVolume: washTradeData?.washtrade_volume?.toFixed(2) ?? "0",
            washTradeStatus: washTradeData?.washtrade_suspect_transactions > 0 ? "Active" : "Clear",

            estimatedPrice: scoreData?.estimated_price?.toFixed(2) ?? "Not Available",
            startPrice: scoreData?.start_price?.toFixed(2) ?? "Not Available",
            rarityRank: scoreData?.rarity_rank?.toString() ?? "Not Available",
            rarityScore: scoreData?.rarity_score?.toString() ?? "Not Available",
         
            transactions: Array.isArray(transactionList)
                ? transactionList.map(tx => ({
                    date: tx.timestamp,
                    price: tx.sale_price_usd,
                    type: tx.transaction_type,
                    isWashTrade: tx.is_washtrade === 'Washtrade',
                    marketplace: tx.marketplace
                }))
                : [],
            priceEstimate: {
                estimate: priceEstimateData?.price_estimate || "Not Available",
                lowerBound: priceEstimateData?.price_estimate_lower_bound || "Not Available",
                upperBound: priceEstimateData?.price_estimate_upper_bound || "Not Available",
                percentile: priceEstimateData?.prediction_percentile || "Not Available",
                collectionDrivers: priceEstimateData?.collection_drivers || "Not Available",
                salesDrivers: priceEstimateData?.nft_sales_drivers || "Not Available",
                rarityDrivers: priceEstimateData?.nft_rarity_drivers || "Not Available"
            }
        };

        return NextResponse.json(transformedData);
        
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        
        
        if (error.response?.status === 404) {
            return NextResponse.json(
                { error: "NFT data not found" },
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
                error: "Failed to fetch NFT analytics",
                details: error.response?.data || error.message
            },
            { status: error.response?.status || 500 }
        );
    }
}
