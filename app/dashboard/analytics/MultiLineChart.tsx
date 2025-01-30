'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { CircularProgress } from '@mui/material';
import Binanceimg from "../../../images/pngwing.com.png"
import Ethereumimg from "../../../images/Ethereumimg.png"
import Lineaimg from "../../../images/Linea.png"
import Polygonimg from "../../../images/polygon-matic-logo.png"
import Avalancheimg from "../../../images/avalanche.svg"
import Solanaimg from "../../../images/Solana.jpeg"
import Image from 'next/image';


const metricConfigs = {
  volume: {
    label: 'Volume',
    key: 'volume_trend',
    color: '#8884d8',
  },
  sales: {
    label: 'Sales',
    key: 'sales_trend',
    color: '#82ca9d',
  },
  transactions: {
    label: 'Transactions',
    key: 'transactions_trend',
    color: '#ffc658',
  },
  holders: {
    label: 'Holders',
    key: 'holders_trend',
    color: '#ff7300',
  },
  traders: {
    label: 'Traders',
    key: 'traders_trend',
    color: '#00C49F',
  },
  buyers: {
    label: 'Buyers',
    key: 'traders_buyers_trend',
    color: '#0088FE',
  },
  sellers: {
    label: 'Sellers',
    key: 'traders_sellers_trend',
    color: '#FF8042',
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

export default function MultiLineChart() {
  const [selectedMetrics, setSelectedMetrics] = useState(['volume']);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('24h');
  const [selectedChains, setSelectedChains] = useState(['ethereum']); // Changed to array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const responses = await Promise.all(
        selectedChains.map(chain => 
          fetch(`/api/chartdata?timeFrame=${selectedTimeFrame}&chain=${chain}`)
            .then(res => res.json())
        )
      );

 
      const combinedData = responses.reduce((acc, response, index) => {
        const chainData = response.data.map(item => ({
          ...item,
          chain: selectedChains[index]
        }));
        return [...acc, ...chainData];
      }, []);

      setChartData(combinedData);
      setMetadata(responses[0].metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    fetchChartData();
  }, [selectedTimeFrame, selectedChains]);

  
  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => {
      const newMetrics = prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric];
      
      
      if (selectedChains.length > 1 && newMetrics.length > 1) {
        return [metric];
      }
      return newMetrics;
    });
  };

 
  const toggleChain = (chainValue: string) => {
    setSelectedChains(prev => {
      const newChains = prev.includes(chainValue)
        ? prev.filter(c => c !== chainValue)
        : [...prev, chainValue];
      
      
      if (selectedMetrics.length > 1 && newChains.length > 1) {
        return [chainValue];
      }
      return newChains;
    });
  };

 
  const formattedData = useMemo(() => {
    if (!chartData.length) return [];

   
    const normalizeTimestamp = (dateString: string) => {
      const date = new Date(dateString);
      if (selectedTimeFrame === '24h') {
        date.setMinutes(0, 0, 0);
      }
      return date.getTime();
    };

   
    const groupedByTime = chartData.reduce((acc, dataPoint) => {
      const timestamp = normalizeTimestamp(dataPoint.date);
      if (!acc[timestamp]) {
        acc[timestamp] = {
          date: dataPoint.date,
          originalTimestamp: timestamp
        };
      }
      
      selectedMetrics.forEach(metric => {
        const key = `${metricConfigs[metric].key}_${dataPoint.chain}`;
        acc[timestamp][key] = dataPoint[metricConfigs[metric].key];
      });
      
      return acc;
    }, {});

    return Object.values(groupedByTime)
      .sort((a: any, b: any) => a.originalTimestamp - b.originalTimestamp)
      .map(({ originalTimestamp, ...rest }) => rest);
  }, [chartData, selectedMetrics, selectedTimeFrame]);

  const getYAxisScale = (selectedMetrics) => {
    const scaleTypes = {
      volume: { divisor: 1000000, suffix: 'M' },
      sales: { divisor: 1000, suffix: 'K' },
      holders: { divisor: 1000, suffix: 'K' },
      marketCap: { divisor: 1000000000, suffix: 'B' },
      traders: { divisor: 1000, suffix: 'K' },
      washTrade: { divisor: 1000, suffix: 'K' }
    };

    const primaryMetric = selectedMetrics[0];
    return scaleTypes[primaryMetric] || { divisor: 1, suffix: '' };
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

  
  const formatXAxisTick = (value: string) => {
    try {
      const date = new Date(value);
      if (selectedTimeFrame === '24h') {
        return date.getHours().toString().padStart(2, '0') + ':00';
      }
      switch (selectedTimeFrame) {
        case '7d':
          return date.toLocaleString('en-US', { weekday: 'short' });
        case '30d':
        case '90d':
          return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
        case 'all':
          return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        default:
          return value;
      }
    } catch (error) {
      return value;
    }
  };

  
  const getXAxisInterval = (dataLength: number) => {
    switch (selectedTimeFrame) {
      case '24h':
        return Math.ceil(dataLength / 6); 
      case '7d':
        return Math.ceil(dataLength / 7); 
      case '30d':
        return Math.ceil(dataLength / 10); 
      case '90d':
        return Math.ceil(dataLength / 12); 
      default:
        return Math.ceil(dataLength / 8);
    }
  };

  
  interface TooltipValue {
    value: number;
    metric: string;
    color: string;
    label: string;
  }

  interface TooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    
    const valuesByChain: Record<string, TooltipValue[]> = payload.reduce((acc, entry) => {
      if (!entry || !entry.dataKey) return acc;

      const [metricKey, chain] = entry.dataKey.split('_');
      if (!metricKey || !chain) return acc;

     
      const metricEntry = Object.entries(metricConfigs).find(([_, config]) => 
        config.key === metricKey
      );
      if (!metricEntry) return acc;

      const [metric, config] = metricEntry;
      
      if (!acc[chain]) acc[chain] = [];
      
      acc[chain].push({
        value: entry.value || 0,
        metric,
        color: entry.color || config.color,
        label: config.label
      });
      
      return acc;
    }, {});

    return (
      <div className="bg-black/90 p-4 border border-zinc-800 rounded-lg">
        <p className="text-zinc-400 mb-2">{label}</p>
        {Object.entries(valuesByChain).map(([chain, values]) => {
          const chainConfig = chains.find(c => c.value === chain);
          if (!chainConfig) return null;

          return (
            <div key={chain} className="mb-2">
              <p className="text-zinc-300 font-medium">
                {chainConfig.label}
              </p>
              {values.map(({ value, metric, color, label }) => (
                <div key={metric} className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: color }} 
                  />
                  <span className="text-zinc-400">{label}:</span>
                  <span className="text-white">
                    {formatValue(value, metric)}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  
  const formatValue = (value: number, metric: string) => {
    const { divisor, suffix } = getYAxisScale([metric]);
    return `${(value / divisor).toFixed(2)}${suffix}`;
  };

  
  const renderMetricMenuItem = (key: string, config: any) => (
    <DropdownMenuCheckboxItem
      key={key}
      checked={selectedMetrics.includes(key)}
      onCheckedChange={() => toggleMetric(key)}
      disabled={selectedChains.length > 1 && selectedMetrics.length > 0 && !selectedMetrics.includes(key)}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: config.color }}
          />
          {config.label}
        </div>
        {selectedChains.length > 1 && selectedMetrics.length > 0 && !selectedMetrics.includes(key) && (
          <span className="text-xs text-yellow-500 ml-2">(Single metric only)</span>
        )}
      </div>
    </DropdownMenuCheckboxItem>
  );

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-red-500">
        <div className="text-center">
          <p className="text-xl mb-4">Error loading chart data</p>
          <p className="text-sm">{error}</p>
          <Button 
            variant="outline" 
            onClick={fetchChartData}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-[90%] mx-auto bg-zinc-900 rounded-xl'>
      <div className='w-full flex flex-col bg-zinc-900 rounded-xl'>
        <div className='w-full h-20 bg-zinc-900 flex items-end justify-between px-10 py-3 space-x-4 rounded-xl'>
          <div className='text-3xl text-white mr-5'>Performance Trends</div>
          
        
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
                  interval={getXAxisInterval(formattedData.length)}
                  tickFormatter={formatXAxisTick}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  fontSize={12}
                />
                <YAxis 
                  stroke="#888888"
                  tickLine={false}
                  tickFormatter={(value) => {
                    const { divisor, suffix } = getYAxisScale(selectedMetrics);
                    return `${(value / divisor).toFixed(1)}${suffix}`;
                  }}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                {selectedMetrics.map(metric => (
                  selectedChains.map(chain => (
                    <Line
                      key={`${metric}_${chain}`}
                      type="monotone"
                      dataKey={`${metricConfigs[metric].key}_${chain}`}
                      stroke={selectedChains.length > 1 
                        ? stringToColor(chain) 
                        : metricConfigs[metric].color}
                      name={selectedChains.length > 1 
                        ? `${chains.find(c => c.value === chain)?.label}`
                        : metricConfigs[metric].label}
                      dot={false}
                      strokeWidth={2}
                    />
                  ))
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {metadata && (
          <div className="grid grid-cols-5 gap-4 p-4 bg-zinc-950 mt-4 rounded-xl w-[90%] mx-auto mb-5">
            {Object.entries(metadata.totals).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-gray-400 text-sm">{key}</p>
                <p className="text-white text-lg">{String(value)}</p>
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


function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}
