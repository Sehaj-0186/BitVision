"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function page() {
  const [walletDataList, setWalletDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const params = {
          blockchain: 1,
          contract_address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
          token_id: "1",
          currency: "usd",
        };
        const response = await axios.get("/api/tokenimage", { params });
        console.log(response.data.imageUrl);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    }

    async function fetchWalletAnalysis() {
      setIsLoading(true);
      try {
        const params = {
          wallet: "0x7c1958Ba95AB3170f6069DADF4de304B0c00000C",
          blockchain: "ethereum",
          time_range: "24h",
          sort_by: "volume",
          sort_order: "desc"
        };
        const response = await axios.get("/api/walletanalysis", { params });
        
        // Updated to handle the new response structure
        const processedData = response.data.data.map(item => ({
          blockchain: item.blockchain,
          buy_volume: item.buy_volume || 0,
          minted_value: item.minted_value || 0,
          nft_bought: item.nft_bought || 0,
          nft_burn: item.nft_burn || 0,
          nft_mint: item.nft_mint || 0,
          nft_sold: item.nft_sold || 0,
          nft_transfer: item.nft_transfer || 0,
          sales: item.sales || 0,
          sell_volume: item.sell_volume || 0,
          transactions: item.transactions || 0,
          transfers: item.transfers || 0,
        }));
        
        setWalletDataList(processedData);
      } catch (error) {
        console.error("Error fetching wallet analysis:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPortfolio();
    fetchWalletAnalysis();
  }, []);

  return (
    <div>
      <h1>Wallet Analysis</h1>
      {isLoading ? (
        <p>Loading wallet data...</p>
      ) : (
        walletDataList.map((walletData, index) => (
          <div key={index} className="wallet-data-container">
            <h2>Wallet Data Set {index + 1}</h2>
            <div>
              <p>Blockchain: {walletData.blockchain}</p>
              <p>Buy Volume: {walletData.buy_volume.toFixed(2)}</p>
              <p>Minted Value: {walletData.minted_value}</p>
              <p>NFTs Bought: {walletData.nft_bought}</p>
              <p>NFTs Burned: {walletData.nft_burn}</p>
              <p>NFTs Minted: {walletData.nft_mint}</p>
              <p>NFTs Sold: {walletData.nft_sold}</p>
              <p>NFT Transfers: {walletData.nft_transfer}</p>
              <p>Total Sales: {walletData.sales}</p>
              <p>Sell Volume: {walletData.sell_volume.toFixed(2)}</p>
              <p>Transactions: {walletData.transactions}</p>
              <p>Transfers: {walletData.transfers}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
