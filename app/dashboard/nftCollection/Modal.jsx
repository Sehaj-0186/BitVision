import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ShieldCheck, ShieldAlert, Check, Copy } from 'lucide-react';
import "./spinner.css";
import { CircularProgress } from '@mui/material';
import Toast from "../../../components/ui/Toast"
import { useState } from "react";


const LoadingValue = () => (
  <span className="inline-block h-6 w-24 bg-zinc-700 animate-pulse rounded" />
);

function GradientCircularProgress() {
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e01cd5" />
            <stop offset="100%" stopColor="#3052fc" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress size="30px" sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }} />
    </React.Fragment>
  );
}

  const LoadingSpinner = () => {
    return (
      <div className="spinner-container justify-end flex h-20 items-center">
        <GradientCircularProgress/>
      </div>
    );
  };


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow-lg">
        <p className="text-black">{label}</p>
        <p className="text-blue-900">{`Price: $${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const copyAddress = () => {
  if (address) {
    navigator.clipboard.writeText(address);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }
};

const shortenAddress = (address) => {
    if (!address || address.length <= 8) return address; 
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const TransactionChart = ({ transactions }) => {
  if (!transactions?.length) return null;

  const chartData = transactions
    .filter((tx) => tx.price > 0) 
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((tx) => ({
      date: new Date(tx.date).toLocaleDateString(),
      price: tx.price,
      isWashTrade: tx.isWashTrade,
    }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
            dot={({ payload, index }) => (
              <circle
                key={index}
                fill={payload.isWashTrade ? "#ff0000" : "#8884d8"}
                r={4}
              />
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const Modal = ({ isOpen, onClose, nft, isLoading }) => {
  const [showToast, setShowToast] = useState(false);
  
  if (!isOpen || !nft) return null;

  const formatValue = (value) => {
    if (isLoading) return <LoadingValue />;
    return value || "Not Available";
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
    <Toast 
        message="Contract Address Copied Successfully" 
        isVisible={showToast}
      />
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="bg-zinc-950 rounded-lg w-[80vw] h-[80vh] flex relative">
       
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-200 hover:text-gray-400 text-xl font-bold z-50"
        >
          &times;
        </button>

        <div className="w-1/3 p-8 flex flex-col items-center">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-60 h-60 rounded-xl mb-5 object-cover"
          />
          
          <h2 className="text-xl text-white font-bold mb-2">{nft.name}</h2>
          <div className="flex items-center relative">
            <p className="text-gray-300 mb-1 mx-1">Contract Address:</p>
            <button 
              onClick={() => copyToClipboard(nft.contract_address)}
              className="text-white mb-1 flex items-center hover:text-blue-400 transition-colors"
            >
              {formatValue(shortenAddress(nft.contract_address))}
              <span className="ml-2">
                {showToast ? <Check size={16} /> : <Copy size={16} />}
              </span>
            </button>
          </div>
          <div className="flex">
            <p className="text-gray-300 mb-1 mx-1">Token ID:</p>
            <p className="text-white">{formatValue(nft.token_id)}</p>
          </div>
        </div>


        
        <div className="w-2/3 h-[90%] my-auto p-5 overflow-y-auto">
         
          {isLoading && (
            <div className="absolute -top-2 right-5 flex items-center gap-2">
              <LoadingSpinner />
              <span className="animate-pulse text-gray-200">
                Fetching NFT Details...
              </span>
            </div>
          )}

      
          <div className="mb-5">
            <h3 className="text-xl text-white font-semibold mb-2">
              Price Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-zinc-900 p-4 rounded-lg">
              <div>
                <p className="text-gray-300">Current Price:</p>
                <p className="text-white">$ {formatValue(nft.currentPrice)}</p>
              </div>
              <div>
                <p className="text-gray-300">Floor Price:</p>
                <p className="text-white">$ {formatValue(nft.floorPrice)}</p>
              </div>
              <div>
                <p className="text-gray-300">All Time High:</p>
                <p className="text-white">$ {formatValue(nft.allTimeHigh)}</p>
              </div>
              <div>
                <p className="text-gray-300">All Time Low:</p>
                <p className="text-white">$ {formatValue(nft.allTimeLow)}</p>
              </div>
            </div>
          </div>

      
          <div className="mb-5">
            <h3 className="text-xl text-white font-semibold mb-2">
              Trading Activity
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-zinc-900 p-4 rounded-lg">
              <div>
                <p className="text-gray-300">Total Transactions:</p>
                <p className="text-white">
                  {formatValue(nft.totalTransactions)}
                </p>
              </div>
              <div>
                <p className="text-gray-300">Sales:</p>
                <p className="text-white">{formatValue(nft.sales)}</p>
              </div>
              <div>
                <p className="text-gray-300">Total Transfers:</p>
                <p className="text-white">{formatValue(nft.totalTransfers)}</p>
              </div>
              <div>
                <p className="text-gray-300">Volume in $:</p>
                <p className="text-white">$ {formatValue(nft.volume)}</p>
              </div>
            </div>
          </div>

     
          <div className="mb-5">
            <h3 className="text-xl text-white font-semibold mb-2">
              Wash Trade Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-zinc-900 p-4 rounded-lg">
              <div>
                <p className="text-gray-300">Suspected Transactions:</p>
                <p className="text-white">
                  {formatValue(nft.suspectTransactions)}
                </p>
              </div>
              <div>
                <p className="text-gray-300">Connected Wallets:</p>
                <p className="text-white">
                  {formatValue(nft.connectedWallets)}
                </p>
              </div>
              <div>
                <p className="text-gray-300">Wash Trade Volume in $:</p>
                <p className="text-white">
                  $ {formatValue(nft.washTradeVolume)}
                </p>
              </div>

           
              <div
                className={`rounded-lg p-3 flex ${
                  nft.washTradeStatus === "Active"
                    ? "bg-zinc-800 border-red-600 border-[1px]"
                    : "bg-zinc-800 border-green-600 border-[1px]"
                }`}
              >
                <span className="mr-2"> Status:</span>{" "}
                {nft.washTradeStatus === "Active" ? (
                  <> <ShieldAlert color="red"/> {<span>Suspicious</span>}</>
                ) : (
                  <> <ShieldCheck color="green"/> {<span >Clear</span>}</>
                )}
              </div>
            </div>
          </div>

       
          <div className="mb-5">
            <h3 className="text-xl text-white font-semibold mb-2">
              Price Estimation
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-zinc-900 p-4 rounded-lg">
              <div>
                <p className="text-gray-300">Estimated Price (eth):</p>
                <p className="text-white">
                  {`${Number(nft.priceEstimate?.estimate || 0).toFixed(4)}`}
                </p>
              </div>
              <div>
                <p className="text-gray-300">Price Range(eth):</p>
                <p className="text-white">
                  {` ${Number(nft.priceEstimate?.lowerBound || 0).toFixed(
                    4
                  )} - ${Number(nft.priceEstimate?.upperBound || 0).toFixed(
                    4
                  )}`}
                </p>
              </div>
              <div>
                <p className="text-gray-300">Market Percentile:</p>
                <p className="text-white">
                  {`${Number(nft.priceEstimate?.percentile || 0).toFixed(4)}%`}
                </p>
              </div>
              <div>
                <p className="text-gray-300">Collection Impact:</p>
                <p className="text-white">
                  {Number(nft.priceEstimate?.collectionDrivers || 0).toFixed(4)}
                </p>
              </div>
            </div>
          </div>

        
          <div className="mb-5">
            <h3 className="text-xl text-white font-semibold mb-2">
              Transaction History
            </h3>
            <div className="bg-zinc-900 p-4 rounded-lg">
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : nft.transactions?.length ? (
                <TransactionChart transactions={nft.transactions} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No transaction history available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Modal;
