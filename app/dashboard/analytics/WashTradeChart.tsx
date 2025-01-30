'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "../../../components/ui/button";
import { CircularProgress } from '@mui/material';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import Binanceimg from "../../../images/pngwing.com.png"
import Ethereumimg from "../../../images/Ethereumimg.png"
import Lineaimg from "../../../images/Linea.png"
import Polygonimg from "../../../images/polygon-matic-logo.png"
import Avalancheimg from "../../../images/avalanche.svg"
import Solanaimg from "../../../images/Solana.jpeg"
import Image from 'next/image';

const metricConfigs = {
  assets: {
    label: 'Wash Trade Assets',
    key: 'assets',
    color: '#8884d8',
    scale: { divisor: 1, suffix: '' }
  },
  suspectSales: {
    label: 'Suspect Sales',
    key: 'suspectSales',
    color: '#82ca9d',
    scale: { divisor: 1000, suffix: 'K' }
  },
  suspectTransactions: {
    label: 'Suspect Transactions',
    key: 'suspectTransactions',
    color: '#ffc658',
    scale: { divisor: 1000, suffix: 'K' }
  },
  volume: {
    label: 'Wash Trade Volume',
    key: 'volume',
    color: '#ff7300',
    scale: { divisor: 1000000, suffix: 'M' }
  },
  wallets: {
    label: 'Wash Trade Wallets',
    key: 'wallets',
    color: '#00C49F',
    scale: { divisor: 1, suffix: '' }
  }
};


const timeFrames = [
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'All Time', value: 'all' }
];

const chains = [
  { 
    label: 'Ethereum', 
    value: 'ethereum',
    image: Ethereumimg,
    supportedTimeframes: ['24h', '7d', '30d', '90d']
  },
  { 
    label: 'Binance', 
    value: 'binance',
    image: Binanceimg,
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  },
  { 
    label: 'Avalanche', 
    value: 'avalanche',
    image: Avalancheimg,
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  },
  { 
    label: 'Linea', 
    value: 'linea',
    image: Lineaimg,
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  },
  { 
    label: 'Solana', 
    value: 'solana',
    image: Solanaimg,
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  },
  { 
    label: 'Polygon', 
    value: 'polygon',
    image: Polygonimg,
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  },
];

export default function WashTradeChart() {
  const [selectedMetrics, setSelectedMetrics] = useState(['volume', 'suspectSales']);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('24h');
  const [selectedChains, setSelectedChains] = useState(['ethereum']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [metadata, setMetadata] = useState(null);


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

  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const responses = await Promise.all(
        selectedChains.map(chain => 
          fetch(`/api/washtradedata?timeFrame=${selectedTimeFrame}&chain=${chain}`)
            .then(res => res.json())
        )
      );

     
      const combinedData = responses.reduce((acc, response, index) => {
        if (response.error) throw new Error(response.error);
        
        const chainData = response.data.map(item => ({
          ...item,
          chain: selectedChains[index]
        }));
        return [...acc, ...chainData];
      }, []);

      setChartData(combinedData);
      setMetadata(responses[0].metadata);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTimeFrame, selectedChains]);

  
  const formattedData = useMemo(() => {
    if (!chartData.length) return [];

    const timestampMap = new Map();
    
   
    chartData.forEach(dataPoint => {
      const timestamp = new Date(dataPoint.date).getTime();
      if (!timestampMap.has(timestamp)) {
        timestampMap.set(timestamp, {
          date: dataPoint.date,
          timestamp
        });
      }

      selectedMetrics.forEach(metric => {
        const key = `${metricConfigs[metric].key}_${dataPoint.chain}`;
        timestampMap.get(timestamp)[key] = dataPoint[metricConfigs[metric].key];
      });
    });

    return Array.from(timestampMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ timestamp, ...rest }) => rest);
  }, [chartData, selectedMetrics]);

 
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const timestampDate = new Date(label);
    const formattedDate = timestampDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: selectedTimeFrame === '24h' ? 'numeric' : undefined,
      minute: selectedTimeFrame === '24h' ? 'numeric' : undefined,
      hour12: true
    });

    return (
      <div className="bg-black/90 p-4 border border-zinc-800 rounded-lg">
        <p className="text-zinc-400 mb-2">{formattedDate}</p>
        {payload.map((entry) => {
          const [metricKey, chain] = entry.dataKey.split('_');
          const metric = metricKey.split('.')[0];
          const { scale } = metricConfigs[metric];
          const value = (entry.value / scale.divisor).toFixed(2);

          return (
            <div key={entry.dataKey} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-zinc-400">
                {chain ? `${chains.find(c => c.value === chain)?.label} - ` : ''}
                {metricConfigs[metric].label}:
              </span>
              <span className="text-white">{`${value}${scale.suffix}`}</span>
            </div>
          );
        })}
      </div>
    );
  };

  
  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => {
      if (selectedChains.length > 1) {
      
        return [metric];
      }
     
      return prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric];
    });
  };

 
  const toggleChain = (chainValue) => {
    setSelectedChains(prev => {
      const newChains = prev.includes(chainValue)
        ? prev.filter(c => c !== chainValue)
        : [...prev, chainValue];
      
     
      if (newChains.length > 1 && selectedMetrics.length > 1) {
        setSelectedMetrics([selectedMetrics[0]]);
      }
      
      return newChains;
    });
  };


  const availableTimeframes = useMemo(() => {
    const selectedChainConfig = chains.find(c => c.value === selectedChains[0]);
    return timeFrames.filter(tf => 
      selectedChainConfig?.supportedTimeframes.includes(tf.value)
    );
  }, [selectedChains]);

 
  useEffect(() => {
    const isTimeframeSupported = availableTimeframes.some(
      tf => tf.value === selectedTimeFrame
    );
    if (!isTimeframeSupported) {
      setSelectedTimeFrame('24h');
    }
  }, [selectedChains, availableTimeframes]);

  if (error) {
    return (
      <div className="w-full flex items-center justify-center bg-zinc-900 text-red-500 p-4 rounded-lg">
        <div className="text-center">
          <p className="text-xl mb-4">Error loading wash trade data</p>
          <p className="text-sm">{error}</p>
          <Button variant="outline" onClick={fetchData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-[90%] mx-auto bg-zinc-950 rounded-lg overflow-hidden'>
      <div className='w-full flex flex-col bg-zinc-900 mb-8 rounded-lg'>
        <div className='w-full h-20 bg-zinc-900 flex items-end justify-between px-10 py-3 space-x-4 rounded-lg'>
                  <div className='text-3xl text-white mr-5'>WashTrade Analytics</div>
                  
            
                  <div className='w-[400px] flex justify-evenly items-center'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <span>Metrics</span>
                          <span className="bg-zinc-800 px-2 py-0.5 rounded-md text-sm">
                            {selectedMetrics.length}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[200px] bg-zinc-950 border border-zinc-800">
                      <DropdownMenuLabel className="text-zinc-400 bg-zinc-950">Available Metrics</DropdownMenuLabel>
                      <DropdownMenuSeparator  />
                      {Object.entries(metricConfigs).map(([key, config]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          checked={selectedMetrics.includes(key)}
                          onCheckedChange={() => toggleMetric(key)}
                          disabled={selectedChains.length > 1 && selectedMetrics.length > 0 && !selectedMetrics.includes(key)}
                          className="transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer hover:bg-zinc-800"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: config.color }}
                              />
                              <span className="text-zinc-200">{config.label}</span>
                            </div>
                            {selectedChains.length > 1 && selectedMetrics.length > 0 && !selectedMetrics.includes(key) && (
                              <span className="text-xs text-yellow-500 ml-2">(Single metric only)</span>
                            )}
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
        
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <span>{timeFrames.find(t => t.value === selectedTimeFrame)?.label || 'Time Frame'}</span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[200px] bg-zinc-950 border border-zinc-800">
                      <DropdownMenuLabel className="text-zinc-400 bg-zinc-950">Select Timeframe</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {availableTimeframes.map(timeFrame => (
                        <DropdownMenuCheckboxItem
                          key={timeFrame.value}
                          checked={selectedTimeFrame === timeFrame.value}
                          onCheckedChange={() => setSelectedTimeFrame(timeFrame.value)}
                          className="transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer hover:bg-zinc-800"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-200">{timeFrame.label}</span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
        
               
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="min-w-[100px]">
                        {selectedChains.length === 1 ? (
                          <div className="flex items-center gap-2">
                            <Image
                              src={chains.find(c => c.value === selectedChains[0])?.image}
                              alt={selectedChains[0]}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span>{chains.find(c => c.value === selectedChains[0])?.label}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Chains</span>
                            <span className="bg-zinc-800 px-2 py-0.5 rounded-md text-sm">
                              {selectedChains.length}
                            </span>
                          </div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[200px] bg-zinc-950 border border-zinc-800">
                      <DropdownMenuLabel className="text-zinc-400 bg-zinc-950">Select Chains</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {chains.map(chain => (
                        <DropdownMenuCheckboxItem
                          key={chain.value}
                          checked={selectedChains.includes(chain.value)}
                          onCheckedChange={() => toggleChain(chain.value)}
                          disabled={selectedMetrics.length > 1 && !selectedChains.includes(chain.value)}
                          className="transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer group hover:bg-zinc-800"
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-2">
                              <div className="relative w-5 h-5 transition-transform duration-300 ease-in-out group-hover:scale-110">
                                <Image
                                  src={chain.image}
                                  alt={chain.label}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                              <span className="text-zinc-200">{chain.label}</span>
                            </div>
                            {chain.value === 'ethereum' && selectedTimeFrame === 'all' && (
                              <span className="text-xs text-yellow-500 ml-2">(All time not available)</span>
                            )}
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </div>

        <div className='w-full h-[50vh] bg-zinc-900 p-4 relative'>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm">
              <GradientCircularProgress />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#888888"
                  tickLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return selectedTimeFrame === '24h'
                      ? date.getHours() + ':00'
                      : date.toLocaleDateString();
                  }}
                />
                <YAxis 
                  stroke="#888888"
                  tickLine={false}
                  tickFormatter={(value) => {
                    const primaryMetric = selectedMetrics[0];
                    const { scale } = metricConfigs[primaryMetric];
                    return `${(value / scale.divisor).toFixed(1)}${scale.suffix}`;
                  }}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                {selectedMetrics.map(metric => 
                  selectedChains.map(chain => (
                    <Line
                      key={`${metric}_${chain}`}
                      type="monotone"
                      dataKey={`${metricConfigs[metric].key}_${chain}`}
                      stroke={selectedChains.length > 1 
                        ? `${metricConfigs[metric].color}${chain === selectedChains[0] ? 'FF' : '80'}`
                        : metricConfigs[metric].color}
                      name={selectedChains.length > 1 
                        ? `${chains.find(c => c.value === chain)?.label} - ${metricConfigs[metric].label}`
                        : metricConfigs[metric].label}
                      dot={false}
                      strokeWidth={2}
                    />
                  ))
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {metadata && (
          <div className="grid grid-cols-5 gap-4 p-4 bg-zinc-950 mt-4 rounded-lg mb-5 w-[90%] mx-auto">
            {Object.entries(metadata.totals).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-gray-400 text-sm">
                  {metricConfigs[key]?.label || key}
                </p>
                <p className="text-white text-lg">
                  {typeof value === 'number' 
                    ? value.toLocaleString() 
                    : String(value)}
                </p>
                <p className={`text-xs ${
                  metadata.changes[`${key}_change`] > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {(metadata.changes[`${key}_change`] * 100).toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
