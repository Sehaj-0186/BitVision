import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LoadingValue = () => (
  <span className="inline-block h-6 w-24 bg-zinc-700 animate-pulse rounded" />
);

const LoadingSpinner = () => (
  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
);

const TransactionChart = ({ transactions }) => {
  if (!transactions?.length) return null;

  const chartData = transactions
    .filter(tx => tx.price > 0) // Only show transactions with price
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(tx => ({
      date: new Date(tx.date).toLocaleDateString(),
      price: tx.price,
      isWashTrade: tx.isWashTrade
    }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
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
  if (!isOpen || !nft) return null;

  const formatValue = (value) => {
    if (isLoading) return <LoadingValue />;
    return value || 'Not Available';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-zinc-950 rounded-lg w-[80vw] h-[80vh] flex relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-200 hover:text-gray-400 text-xl font-bold"
        >
          &times;
        </button>

        {/* Left Section */}
        <div className="w-1/3 p-5 flex flex-col items-center">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-50 h-50 rounded-xl mb-5 object-cover"
          />
          <h2 className="text-xl text-white font-bold mb-2">{nft.name}</h2>
          <p className="text-gray-300 mb-1">Collection:</p>
          <div className="text-white mb-3">{formatValue(nft.collection)}</div>
          <p className="text-gray-300 mb-1">Token ID:</p>
          <p className="text-white">{formatValue(nft.token_id)}</p>
        </div>

        {/* Right Section with Loading State */}
        <div className="w-2/3 p-5 overflow-y-auto">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute top-4 right-4">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-orange-500">Loading data...</span>
            </div>
          )}

          {/* Price Analysis */}
          <div className="mb-5">
            <h3 className="text-lg text-white font-semibold mb-2">
              Price Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-zinc-800 p-4 rounded-lg">
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

          {/* Trading Activity */}
          <div className="mb-5">
            <h3 className="text-lg text-white font-semibold mb-2">
              Trading Activity
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-zinc-800 p-4 rounded-lg">
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

          {/* Wash Trade Analysis */}
          <div>
            <h3 className="text-lg text-white font-semibold mb-2">
              Wash Trade Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-zinc-800 p-4 rounded-lg">
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

              {/* Status with conditional styling */}
              <div
                className={`rounded-lg p-3 ${
                  nft.washTradeStatus === "Active"
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              >
                <span>Status:</span>{" "}
                {nft.washTradeStatus === "Active" ? (
                  <> 🚩 {<span>Suspicious</span>}</>
                ) : (
                  <> ✅ {<span>Clear</span>}</>
                )}
              </div>
            </div>
          </div>

          {/* Price Estimate Section */}
          <div className="mb-5">
            <h3 className="text-lg text-white font-semibold mb-2">
              Price Estimation
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-zinc-800 p-4 rounded-lg">
              <div>
                <p className="text-gray-300">Estimated Price:</p>
                <p className="text-white">
                  {`eth ${Number(nft.priceEstimate?.estimate || 0).toFixed(4)}`}
                </p>
              </div>
              <div>
                <p className="text-gray-300">Price Range:</p>
                <p className="text-white">
                  {`eth ${Number(nft.priceEstimate?.lowerBound || 0).toFixed(4)} - eth ${Number(nft.priceEstimate?.upperBound || 0).toFixed(4)}`}
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

          {/* Transaction History Chart */}
          <div className="mb-5">
            <h3 className="text-lg text-white font-semibold mb-2">
              Transaction History
            </h3>
            <div className="bg-zinc-800 p-4 rounded-lg">
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <TransactionChart transactions={nft.transactions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;