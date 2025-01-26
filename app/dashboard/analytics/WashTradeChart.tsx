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

// Update chains and timeframes to match MultiLineChart
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
    supportedTimeframes: ['24h', '7d', '30d', '90d'] // excluding 'all'
  },
  { 
    label: 'Binance', 
    value: 'binance',
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  },
  { 
    label: 'Avalanche', 
    value: 'avalanche',
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  },
  { 
    label: 'Linea', 
    value: 'linea',
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  },
  { 
    label: 'Solana', 
    value: 'solana',
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  },
  { 
    label: 'Polygon', 
    value: 'polygon',
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  },
  { 
    label: 'Bitcoin', 
    value: 'bitcoin',
    supportedTimeframes: ['24h', '7d', '30d', '90d', 'all']
  }
];

export default function WashTradeChart() {
  const [selectedMetrics, setSelectedMetrics] = useState(['volume', 'suspectSales']);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('24h');
  const [selectedChains, setSelectedChains] = useState(['ethereum']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [metadata, setMetadata] = useState(null);

  // Fetch data function
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

      // Combine and normalize data
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

  // Format data for chart
  const formattedData = useMemo(() => {
    if (!chartData.length) return [];

    const timestampMap = new Map();
    
    // Group by timestamp
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

  // Custom tooltip
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

  // Toggle functions
  // Update toggleMetric to enforce single metric when multiple chains are selected
  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => {
      if (selectedChains.length > 1) {
        // If multiple chains are selected, only allow one metric
        return [metric];
      }
      // Otherwise, handle normal toggle behavior
      return prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric];
    });
  };

  // Update toggleChain to enforce single metric when selecting multiple chains
  const toggleChain = (chainValue) => {
    setSelectedChains(prev => {
      const newChains = prev.includes(chainValue)
        ? prev.filter(c => c !== chainValue)
        : [...prev, chainValue];
      
      // If selecting multiple chains, force single metric
      if (newChains.length > 1 && selectedMetrics.length > 1) {
        setSelectedMetrics([selectedMetrics[0]]);
      }
      
      return newChains;
    });
  };

  // Get available timeframes for selected chain
  const availableTimeframes = useMemo(() => {
    const selectedChainConfig = chains.find(c => c.value === selectedChains[0]);
    return timeFrames.filter(tf => 
      selectedChainConfig?.supportedTimeframes.includes(tf.value)
    );
  }, [selectedChains]);

  // Reset timeframe if not supported by new chain
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
      <div className='w-full flex flex-col'>
        <div className='w-full bg-zinc-900 flex items-center justify-between px-6 py-4'>
          <h2 className='text-2xl text-white'>Wash Trade Analytics</h2>
          
          <div className='flex items-center gap-4'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Metrics ({selectedMetrics.length})
                  {selectedChains.length > 1 && (
                    <span className="ml-2 text-xs text-yellow-500">(Single metric only)</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Wash Trade Metrics</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(metricConfigs).map(([key, config]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={selectedMetrics.includes(key)}
                    onCheckedChange={() => toggleMetric(key)}
                    disabled={selectedChains.length > 1 && !selectedMetrics.includes(key) && selectedMetrics.length > 0}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: config.color }}
                        />
                        {config.label}
                      </div>
                      {selectedChains.length > 1 && !selectedMetrics.includes(key) && selectedMetrics.length > 0 && (
                        <span className="text-xs text-yellow-500 ml-2">Locked</span>
                      )}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Time Frame Selection */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {timeFrames.find(t => t.value === selectedTimeFrame)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {availableTimeframes.map(timeFrame => (
                  <DropdownMenuCheckboxItem
                    key={timeFrame.value}
                    checked={selectedTimeFrame === timeFrame.value}
                    onCheckedChange={() => setSelectedTimeFrame(timeFrame.value)}
                  >
                    {timeFrame.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Chain Selection */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {selectedChains.length === 1 
                    ? chains.find(c => c.value === selectedChains[0])?.label 
                    : `${selectedChains.length} Chains`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {chains.map(chain => (
                  <DropdownMenuCheckboxItem
                    key={chain.value}
                    checked={selectedChains.includes(chain.value)}
                    onCheckedChange={() => toggleChain(chain.value)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{chain.label}</span>
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
              <CircularProgress />
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
          <div className="grid grid-cols-5 gap-4 p-4 bg-zinc-900 mt-4">
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
