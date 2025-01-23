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
