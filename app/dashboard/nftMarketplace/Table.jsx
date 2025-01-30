'use client';
import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { CircularProgress } from '@mui/material';
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "../../../components/ui/dropdown-menu";

const getHealthScoreColor = (score) => {
  if (score >= 80) return 'text-green-500 bg-green-500/10';
  if (score >= 60) return 'text-blue-500 bg-blue-500/10';
  if (score >= 40) return 'text-yellow-500 bg-yellow-500/10';
  if (score >= 20) return 'text-orange-500 bg-orange-500/10';
  return 'text-red-500 bg-red-500/10';
};

const getRiskText = (score) => {
  if (score >= 80) return 'Low Risk';
  if (score >= 60) return 'Moderate Risk';
  if (score >= 40) return 'High Risk';
  if (score >= 20) return 'Very High Risk';
  return 'Extreme Risk';
};

const Table = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('healthScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSort, setSelectedSort] = useState('healthScore desc');

  const sortOptions = [
    { value: "healthScore desc", label: "Health Score (High to Low)" },
    { value: "healthScore asc", label: "Health Score (Low to High)" },
    { value: "buyers desc", label: "Most Buyers" },
    { value: "buyers asc", label: "Least Buyers" },
    { value: "sellers desc", label: "Most Sellers" },
    { value: "sellers asc", label: "Least Sellers" },
    { value: "washTradeVolume desc", label: "Highest Wash Trade Volume" },
    { value: "washTradeVolume asc", label: "Lowest Wash Trade Volume" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/marketplacedata');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }
      const result = await response.json();
      if (!result.length) {
        setError('No data available');
        return;
      }
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (value) => {
    setSelectedSort(value);
    const [columnName, order] = value.split(' ');
    setSortBy(columnName);
    setSortOrder(order);
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = sortBy === 'healthScore' ? Number(a[sortBy]) : a[sortBy];
    const bValue = sortBy === 'healthScore' ? Number(b[sortBy]) : b[sortBy];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return sortOrder === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

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

  if (loading) {
    return (
      <div className="w-[80%] h-screen my-10 mx-auto bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center">
        <GradientCircularProgress />
        <div className="text-white text-xl ml-2">Loading Marketplaces...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[80%] h-screen my-10 mx-auto bg-black rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      className="w-[90%] mx-auto my-10 bg-black rounded-xl overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div className="flex justify-end items-center px-6 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600">
              Sort by: {sortOptions.find(opt => opt.value === selectedSort)?.label || 'Select'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-700">
            <DropdownMenuLabel className='bg-zinc-900'>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuRadioGroup value={selectedSort} onValueChange={handleSortChange}>
              {sortOptions.map((option) => (
                <DropdownMenuRadioItem
                  key={option.value}
                  value={option.value}
                  className="text-white hover:bg-zinc-800 cursor-pointer"
                >
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl bg-zinc-900 mb-6">
        <div className="h-full overflow-auto">
          <table className="w-[90%] mx-auto font-light">
            <thead className="sticky top-0 z-10 bg-zinc-900">
              <tr className="text-center text-zinc-300 bg-zinc-900 text-[23px] font-thin">
                <th className="p-4 pl-6 text-center">Marketplace Name</th>
                <th className="p-4 text-center">Buyers</th>
                <th className="p-4 text-center">Sellers</th>
                <th className="p-4 text-center pr-6">Wash Trade Volume(ETH)</th>
                <th className="p-4 relative group text-center">
                  Health Score
                  <Info className="inline-block ml-1 w-4 h-4 opacity-50 group-hover:opacity-100" />
                  <div className="absolute hidden group-hover:block bg-zinc-800 text-xs p-2 rounded -bottom-12 left-4 w-48">
                    Higher score indicates lower risk of wash trading
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-black">
              {sortedData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="p-4 pl-6 text-white text-center">
                  {item.url ? (
    <a
      href={item.url} 
       target="_blank"
      rel="noopener noreferrer"
      className="text-white hover:text-blue-400 transition-colors cursor-pointer"
    >
      {item.name}
    </a>
  ) : (
    <span className="text-white">{item.name}</span>
  )}
                  </td>
                  <td className="p-4 text-center text-white">
                    {item.buyers?.toLocaleString()}
                  </td>
                  <td className="p-4 text-center text-white">
                    {item.sellers?.toLocaleString()}
                  </td>
                  <td className="p-4 pr-6 text-center text-white">
                    {item.washTradeVolume?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-4 text-center">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full ${getHealthScoreColor(
                        item.healthScore
                      )}`}
                    >
                      <span className="font-medium">
                        {item.healthScore?.toFixed(0) || "N/A"}
                      </span>
                      <span className="ml-2 text-xs opacity-75">
                        {getRiskText(item.healthScore)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;