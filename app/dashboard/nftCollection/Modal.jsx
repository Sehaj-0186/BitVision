import React from 'react';

const Modal = ({ isOpen, onClose, nft }) => {
  if (!isOpen) return null;

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
            className="w-50 h-50 rounded-xl mb-5"
          />
          <h2 className="text-xl text-white font-bold mb-2">{nft.name}</h2>
          <p className="text-gray-300 mb-1">Wallet Address:</p>
          <p className="text-white mb-3">{nft.walletAddress}</p>
          <p className="text-gray-300 mb-1">Token ID:</p>
          <p className="text-white">{nft.tokenId}</p>
        </div>

        {/* Right Section (Scrollable) */}
        <div className="w-2/3 p-5 overflow-y-auto">
          {/* Price Analysis */}
          <div className="mb-5">
            <h3 className="text-lg text-white font-semibold mb-2">
              Price Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-zinc-800 p-4 rounded-lg">
              <div>
                <p className="text-gray-300">Current Price:</p>
                <p className="text-white">$ {nft.currentPrice}</p>
              </div>
              <div>
                <p className="text-gray-300">Floor Price:</p>
                <p className="text-white">$ {nft.floorPrice}</p>
              </div>
              <div>
                <p className="text-gray-300">All Time High:</p>
                <p className="text-white">$ {nft.allTimeHigh}</p>
              </div>
              <div>
                <p className="text-gray-300">All Time Low:</p>
                <p className="text-white">$ {nft.allTimeLow}</p>
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
                <p className="text-white">{nft.totalTransactions}</p>
              </div>
              <div>
                <p className="text-gray-300">Sales:</p>
                <p className="text-white">{nft.sales}</p>
              </div>
              <div>
                <p className="text-gray-300">Total Transfers:</p>
                <p className="text-white">{nft.totalTransfers}</p>
              </div>
              <div>
                <p className="text-gray-300">Volume in $:</p>
                <p className="text-white">$ {nft.volume}</p>
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
                <p className="text-white">{nft.suspectTransactions}</p>
              </div>
              <div>
                <p className="text-gray-300">Connected Wallets:</p>
                <p className="text-white">{nft.connectedWallets}</p>
              </div>
              <div>
                <p className="text-gray-300">Wash Trade Volume in $:</p>
                <p className="text-white">$ {nft.washTradeVolume}</p>
              </div>

              {/* Status with conditional styling */}
              <div
                className={`rounded-lg p-3 ${
                  nft.washTradeStatus === 'Active'
                    ? 'bg-red-600'
                    : 'bg-green-600'
                }`}
              >
                <span>Status:</span>{' '}
                {nft.washTradeStatus === 'Active' ? (
                  <>
                    {' '}
                    🚩{' '}
                    {<span>Suspicious</span>}
                  </>
                ) : (
                  <>
                    {' '}
                    ✅{' '}
                    {<span>Clear</span>}
                  </>
                )}
              </div>

            </div> 
          </div>

        </div> 
      </div> 
    </div> 
  );
};

export default Modal;
