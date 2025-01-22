"use client";
import React, { useEffect } from 'react'
import axios from "axios";


// Usage


const dashboard = () => {
  const walletAddress = "0x7c1958Ba95AB3170f6069DADF4de304B0c00000C";
  useEffect(() => {
    async function fetchPortfolio(walletAddress) {
      try {
        const response = await axios.get("/api/walletportfolio", {
          params: { wallet: walletAddress },
        });
       console.log(response.data);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
       
      }
    }
    fetchPortfolio(walletAddress);
  },[]) 
    
  return (
    <div>dashboard</div>
  )
}

export default dashboard