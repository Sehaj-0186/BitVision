'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import { PieChart } from '@mui/x-charts/PieChart';
import { mobileAndDesktopOS, valueFormatter } from './webUsageStats';
import { ShieldCheck, ShieldAlert } from 'lucide-react'; // Import icons

export default function Portfolio() {
  const [radius, setRadius] = React.useState(50);
  const [itemNb, setItemNb] = React.useState(5);
  const [isHidden, setIsHidden] = React.useState(true);

  // Sample data for performance and trading activity
  const portfolioData = {
    realizedProfit: 1500,
    unrealizedProfit: 300,
    totalPL: 1800,
    estimatedPortfolioValue: 5000,
    totalVolume: 10000,
    riskScore: 100,
  };

  const tradingActivityData = {
    nftsBought: 10,
    nftsSold: 5,
    buyVolume: 2000,
    sellVolume: 1500,
  };

  const riskAnalysis = {
    suspiciousActivityDetected: false, // Change to true for testing
    washTradedNFTs: 2,
    washTradedVolume: 500,
  };

  const getRiskScoreColor = (score) => {
    const minScore = 0;
    const maxScore = 100;

    const ratio = (score - minScore) / (maxScore - minScore);

    const r = Math.floor(255 * ratio); 
    const g = Math.floor(255 * (1 - ratio)); 

    return `rgb(${r}, ${g}, 0)`; 
  };

  return (
    <>
      <div className='w-[95%] mx-auto my-4 flex'>
        <div className='flex flex-col w-[30%] my-8  justify-between'>
        <Box className="bg-black h-[50%] w-[400px] flex flex-col justify-center mx-auto">
          <div className="my-5 ml-16 text-2xl text-white">NFTs Distribution</div>
          <PieChart
            height={250}
            series={[
              {
                data: mobileAndDesktopOS.slice(0, itemNb),
                innerRadius: radius,
                arcLabel: (params) => params.label ?? '',
                arcLabelMinAngle: 20,
                valueFormatter,
              },
            ]}
            slotProps={{ legend: { hidden: isHidden } }}
          />
        </Box>
        <div className=' w-full h-[50%] flex flex-col items-center justify-center'>
        <div className='grid grid-cols-2 gap-4 p-2 rounded-xl h-[60%] w-[90%] bg-zinc-950'>
  <div className="col-span-2 "> {/* Make the title span across both columns */}
    <h3 className="text-lg text-white px-4 py-2">NFTs Overview</h3>
  </div>
  <div className='rounded-lg justify-between flex flex-col p-2'>
    <p className='text-gray-300 text-sm'>Minted:</p>
    <p className='text-white text-3xl'>{0}</p>
  </div>
  <div className='rounded-lg justify-between flex flex-col p-2'>
    <p className='text-gray-300 text-sm'>Burnt:</p>
    <p className='text-white text-3xl'>{0}</p>
  </div>
  <div className='rounded-lg justify-between flex flex-col p-2'>
    <p className='text-gray-300 text-sm'>Transferred:</p>
    <p className='text-white text-3xl'>{0}</p>
  </div>
  <div className='rounded-lg justify-between flex flex-col p-2'>
    <p className='text-gray-300 text-sm'>Received:</p>
    <p className='text-white text-3xl'>{0}</p>
  </div>
</div>


  {/* Marketplace Rewards Section */}
  <div className="bg-zinc-950 w-[90%] mx-auto mt-4 p-4 rounded-lg">
  <h3 className="text-lg text-white mx-3">Marketplace Rewards</h3>

  <div className="mt-6 grid grid-cols-2 gap-4">
                <div className=' h-[70px] rounded-lg  justify-between flex flex-col'>
              <span className="text-gray-300 text-sm mt-1 ml-2">Blur:</span> 
              
              <span className="text-white text-3xl mb-1 ml-2">2</span>
              </div> 
                <div className=' h-[70px] rounded-lg  justify-between flex flex-col'>
              <span className="text-gray-300 text-sm mt-1 ml-2">Looks:</span>
                
              <span className="text-white text-3xl mb-1 ml-2">$500</span> 
              </div>
            </div>
  </div>
</div>


        </div>

        <div className='w-[70%] bg-black p-4 rounded-lg'>
          {/* Portfolio Performance */}
          <div className='mb-4 bg-zinc-950 p-6 rounded-2xl'>
            <h3 className='text-lg text-white mb-2 '>Portfolio Performance</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className=' rounded-lg justify-between flex flex-col'>
                <p className='text-gray-300 text-sm mt-1 ml-2'>Realized Profit:</p>
                <p className='text-white text-3xl mb-1 ml-2'>${portfolioData.realizedProfit}</p>
              </div>
              <div className=' rounded-lg justify-between flex flex-col'>
                <p className='text-gray-300 text-sm mt-1 ml-2'>Unrealized Profit:</p>
                <p className='text-white text-3xl mb-1 ml-2'>${portfolioData.unrealizedProfit}</p>
              </div>
              <div className='  rounded-lg justify-between flex flex-col'>
                <p className='text-gray-300 text-sm mt-1 ml-2'>Total P&L:</p>
                <p className='text-white text-3xl mb-1 ml-2'>${portfolioData.totalPL}</p>
              </div>
              <div className='  rounded-lg justify-between flex flex-col'>
                <p className='text-gray-300 text-sm mt-1 ml-2'>Est. Portfolio Value:</p>
                <p className='text-white text-3xl mb-1 ml-2'>${portfolioData.estimatedPortfolioValue}</p>
              </div>
              <div className='  rounded-lg justify-between flex flex-col'>
                <p className='text-gray-300 text-sm mt-1 ml-2'>Total Volume:</p>
                <p className='text-white text-3xl mb-1 ml-2'>${portfolioData.totalVolume}</p>
              </div>
              <div className='  rounded-lg justify-between flex flex-col'>
                <p className='text-gray-300 text-sm mt-1 ml-2'>Risk Score:</p>
                <p style={{ color: getRiskScoreColor(portfolioData.riskScore) }} 
                  className='text-white text-3xl mb-1 ml-2'>
                  {portfolioData.riskScore}/100
                </p>             
             </div>
            </div>
          </div>

          {/* Trading Activity */}
          <div className='mb-4 bg-zinc-950 p-6 rounded-2xl'>
            <h3 className='text-lg text-white mb-2'>Trading Activity</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='  rounded-lg justify-between flex flex-col'>
                <p className='text-gray-300 text-sm mt-1 ml-2'>NFTs Bought:</p>
                <p className='text-white text-3xl mb-1 ml-2'>{tradingActivityData.nftsBought}</p>
              </div>
              <div className='  rounded-lg justify-between flex flex-col'>
                <p className='text-gray-300 text-sm mt-1 ml-2'>NFTs Sold:</p>
                <p className='text-white text-3xl mb-1 ml-2'>{tradingActivityData.nftsSold}</p>
              </div>
              <div className='  rounded-lg justify-between flex flex-col'>
                <p className='text-gray-300 text-sm mt-1 ml-2'>Buy Volume (in $):</p>
                <p className='text-white text-3xl mb-1 ml-2'>${tradingActivityData.buyVolume}</p>
              </div>
              <div className='  rounded-lg justify-between flex flex-col'>
                <p className='text-gray-300 text-sm mt-1 ml-2'>Sell Volume (in $):</p>
                <p className='text-white text-3xl mb-1 ml-2'>${tradingActivityData.sellVolume}</p>
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="mb-4 bg-zinc-950 p-6 rounded-2xl">
            <h3 className="text-lg text-white mb-2">Risk Analysis</h3>
            <div className='flex gap-2 bg-zinc-900 px-6 py-4 rounded-2xl'>
            {riskAnalysis.suspiciousActivityDetected ? (
              <>
                <ShieldCheck color="green" />No Suspicious activity detected.
              </>
            ) : (
              <>
                <ShieldAlert color="red" /> Suspicious activity detected.
              </>
            )}
            </div>
            {/* Wash Trade Information */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className=' h-[70px] rounded-lg  justify-between flex flex-col'>
              <span className="text-gray-300 text-sm mt-1 ml-2">Wash Traded NFTs:</span> 
              
              <span className="text-white text-3xl mb-1 ml-2">{riskAnalysis.washTradedNFTs}</span>
              </div> 
                <div className=' h-[70px] rounded-lg  justify-between flex flex-col'>
              <span className="text-gray-300 text-sm mt-1 ml-2">Wash Traded Volume (in $):</span>
                
              <span className="text-white text-3xl mb-1 ml-2">${riskAnalysis.washTradedVolume}</span> 
              </div>
            </div>
          </div>

        </div> {/* End of right-side container */}
      </div> {/* End of main container */}
    </>
  );
}
