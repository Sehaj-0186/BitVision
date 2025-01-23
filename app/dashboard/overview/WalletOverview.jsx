'use client';
import React, { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { 
  Wallet, 
  CreditCard, 
  Copy, 
  AlertTriangle, 
  Layers,
  Landmark 
} from 'lucide-react';
import Toast from '@/components/Toast'; 

const WalletOverview = () => {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  
  const [showToast, setShowToast] = useState(false); 

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setShowToast(true); 
      setTimeout(() => setShowToast(false), 3000); 
    }
  };

  return (
    <div className='w-[95%] mx-auto rounded-xl bg-zinc-950 h-40 my-8 flex'>
      {showToast && <Toast message="Wallet Address Copied!" onClose={() => setShowToast(false)} />} 

      <div className='w-1/2 p-4 flex items-center'>
        <div className='flex items-center space-x-4'>
          {isConnected ? (
            <Landmark className="w-16 h-16 text-blue-500" />
          ) : (
            <AlertTriangle className="w-16 h-16 text-yellow-500" />
          )}
          <div>
            <div className='text-white flex items-center space-x-2'>
              <span>{isConnected ? address : 'Connect your wallet first'}</span>
              {isConnected && (
                <Copy 
                  onClick={copyAddress} 
                  className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" 
                />
              )}
            </div>
            <div className='text-gray-400'>
              {isConnected 
                ? `Balance: $${balanceData?.formatted || '0'}`
                : 'Balance: $0'}
            </div>
          </div>
        </div>
      </div>

      <div className='w-1/2 flex space-x-4 p-4'>
        <div className='flex-1 bg-zinc-900 rounded-lg p-4 flex flex-col justify-between'>
          <div className='flex justify-between items-center'>
            <CreditCard className="w-6 h-6 text-white" />
            <span className='text-white font-thin'>NFT Value</span>
          </div>
          <div className='text-right text-4xl text-white'>
            {isConnected ? `$${balanceData?.formatted || '0'}` : '$0'}
          </div>
        </div>

        <div className='flex-1 bg-zinc-900 rounded-lg p-4 flex flex-col justify-between'>
          <div className='flex justify-between items-center'>
            <Layers className="w-6 h-6 text-white" />
            <span className='text-white font-thin'>NFTs Held</span>
          </div>
          <div className='text-right text-4xl text-white'>
            0
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletOverview;
