const unleashnfts = require('@api/unleashnfts');
unleashnfts.auth('19a1634dc850e33607b074bc62da2e19');

async function getAllNFTs() {
    const portfolio = {
        collections: {},
    };
    let offset = 30;
    const LIMIT = 100;
    // let hasNext = true;

    while (offset--) {
        try {
            const response = await unleashnfts.getWalletBalanceNft({
                wallet: '0x7c1958Ba95AB3170f6069DADF4de304B0c00000C',
                blockchain: 'ethereum',
                time_range: 'all',
                offset: offset.toString(),
                limit: LIMIT.toString()
            });

            // console.log('API Response:', JSON.stringify(response, null, 2));

            if (!response || !response.data || !Array.isArray(response.data.data)) {
                console.log('Invalid response structure');
                break;
            }

            const nfts = response.data.data;
            if (nfts.length === 0) break;

            nfts.forEach(nft => {
                const { collection, contract_address, token_id } = nft;
                if (!portfolio.collections[collection]) {
                    portfolio.collections[collection] = {
                        contract_address,
                        tokens: [],
                        count: 0
                    };
                }
                portfolio.collections[collection].tokens.push(token_id);
                portfolio.collections[collection].count++;
            });

            // hasNext = response.data.pagination.has_next;
            offset += LIMIT;
            // console.log(`Processed page ${offset / LIMIT}, hasNext: ${hasNext}`);

        } catch (error) {
            console.error('Error:', error);
            break;
        }
    }
    return portfolio;
}

getAllNFTs().then(console.log);
