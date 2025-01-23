import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    const options = {
      method: 'GET',
      url: `https://api.unleashnfts.com/api/v2/nft/wallet/profile`,
      params: {
        wallet: wallet,
        offset: 0,
        limit: 30
      },
      headers: {
        accept: 'application/json', 
        'x-api-key': '0385f2a4bef504a96ba79b36343195e5'
      }
    };

    const response = await axios.request(options);
    
    // Extract data from first entry since they're all the same wallet
    const walletData = response.data.data[0];

    // Transform the data to include relevant metrics
    const rewardsData = {
      blur: walletData.nft_marketplace_reward?.blur || 0,
      looks: walletData.nft_marketplace_reward?.looks || 0,
      stats: {
        collection_count: walletData.collection_count || 0,
        nft_count: walletData.nft_count || 0,
        is_shark: walletData.is_shark || false,
        is_whale: walletData.is_whale || false,
        washtrade_nft_count: walletData.washtrade_nft_count || 0
      },
      risk: {
        is_sanctioned: walletData.aml_is_sanctioned || false,
        risk_level: walletData.aml_risk_level || 'low',
        is_custodial: walletData.is_custodial || false,
        is_contract: walletData.is_contract || false
      }
    };

    return NextResponse.json(rewardsData);

  } catch (error) {
    console.error('Marketplace rewards API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch marketplace rewards',
        details: error.message,
        blur: 0,
        looks: 0,
        stats: {
          collection_count: 0,
          nft_count: 0,
          is_shark: false,
          is_whale: false,
          washtrade_nft_count: 0
        },
        risk: {
          is_sanctioned: false,
          risk_level: 'unknown',
          is_custodial: false,
          is_contract: false
        }
      }, 
      { status: 500 }
    );
  }
}
