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

// Available metrics configuration
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

// Update timeFrames to match API's supported values
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

      // Combine data from all chains
      const combinedData = responses.reduce((acc, response, index) => {
        const chainData = response.data.map(item => ({
          ...item,
          chain: selectedChains[index] // Add chain identifier to each data point
        }));
        return [...acc, ...chainData];
      }, []);

      setChartData(combinedData);
      setMetadata(responses[0].metadata); // Use first chain's metadata for now
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedTimeFrame, selectedChains]);

  // Update toggleMetric to allow multiple metrics with single chain
  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => {
      const newMetrics = prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric];
      
      // If we have multiple chains selected, only allow one metric
      if (selectedChains.length > 1 && newMetrics.length > 1) {
        return [metric];
      }
      return newMetrics;
    });
  };

  // Update toggleChain to handle metric restrictions
  const toggleChain = (chainValue: string) => {
    setSelectedChains(prev => {
      const newChains = prev.includes(chainValue)
        ? prev.filter(c => c !== chainValue)
        : [...prev, chainValue];
      
      // If multiple metrics are selected, only allow one chain
      if (selectedMetrics.length > 1 && newChains.length > 1) {
        return [chainValue];
      }
      return newChains;
    });
  };

  // Update formattedData to handle timestamp alignment
  const formattedData = useMemo(() => {
    if (!chartData.length) return [];

    // Normalize timestamps for comparison
    const normalizeTimestamp = (dateString: string) => {
      const date = new Date(dateString);
      if (selectedTimeFrame === '24h') {
        date.setMinutes(0, 0, 0);
      }
      return date.getTime();
    };

    // Group data points by normalized timestamp
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
      setSelectedTimeFrame('24h'); // Default to 24h if current timeframe not supported
    }
  }, [selectedChains, availableTimeframes]);

  // Add new function to format dates based on timeframe
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

  // Calculate appropriate interval based on data length and timeframe
  const getXAxisInterval = (dataLength: number) => {
    switch (selectedTimeFrame) {
      case '24h':
        return Math.ceil(dataLength / 6); // Show ~6 ticks for 24h
      case '7d':
        return Math.ceil(dataLength / 7); // Show one tick per day
      case '30d':
        return Math.ceil(dataLength / 10); // Show ~10 ticks
      case '90d':
        return Math.ceil(dataLength / 12); // Show ~12 ticks
      default:
        return Math.ceil(dataLength / 8); // Default to 8 ticks
    }
  };

  // Update CustomTooltip component with better error handling
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

    // Group values by chain with error handling
    const valuesByChain: Record<string, TooltipValue[]> = payload.reduce((acc, entry) => {
      if (!entry || !entry.dataKey) return acc;

      const [metricKey, chain] = entry.dataKey.split('_');
      if (!metricKey || !chain) return acc;

      // Find metric config
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

  // Helper function to format values based on metric type
  const formatValue = (value: number, metric: string) => {
    const { divisor, suffix } = getYAxisScale([metric]);
    return `${(value / divisor).toFixed(2)}${suffix}`;
  };

  // Update dropdown menu items to show restrictions
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
    <div className='w-[90%] mx-auto h-full bg-zinc-950'>
      <div className='w-full h-full flex flex-col'>
        <div className='w-full h-20 bg-zinc-900 flex items-end justify-end px-10 py-3 space-x-4'>
          {/* <div className='text-5xl text-white mr-5'>Market Analytics</div> */}
          
          {/* Metrics Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Metrics ({selectedMetrics.length})</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Available Metrics</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(metricConfigs).map(([key, config]) => renderMetricMenuItem(key, config))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Time Frame Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {timeFrames.find(t => t.value === selectedTimeFrame)?.label || 'Time Frame'}
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

          {/* Chain Selection - Modified for multi-select */}
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
                  disabled={selectedMetrics.length > 1 && !selectedChains.includes(chain.value)}
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
                        ? stringToColor(chain) // Add function to generate colors for chains
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
          <div className="grid grid-cols-5 gap-4 p-4 bg-zinc-900 mt-4">
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

// Add helper function to generate colors for chains
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
