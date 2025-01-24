'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, Info } from 'lucide-react';

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
  const [selectedSort, setSelectedSort] = useState(''); // Add new state for select value

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

  const sortedData = [...data].sort((a, b) => {
    // Convert values to numbers for numeric comparisons
    const aValue = sortBy === 'healthScore' ? Number(a[sortBy]) : a[sortBy];
    const bValue = sortBy === 'healthScore' ? Number(b[sortBy]) : b[sortBy];
    
    // Handle numeric sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle string sorting
    return sortOrder === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSelectedSort(value); // Update selected value
    if (value) {
      const [columnName, order] = value.split(' ');
      setSortBy(columnName);
      setSortOrder(order);
    }
  };

  const sortOptions = [
    { value: "healthScore desc", label: "Health Score (High to Low)", field: "healthScore" },
    { value: "healthScore asc", label: "Health Score (Low to High)", field: "healthScore" },
    { value: "buyers desc", label: "Most Buyers" },
    { value: "buyers asc", label: "Least Buyers" },
    { value: "sellers desc", label: "Most Sellers" },
    { value: "sellers asc", label: "Least Sellers" },
    { value: "washTradeVolume desc", label: "Highest Wash Trade Volume" },
    { value: "washTradeVolume asc", label: "Lowest Wash Trade Volume" },
  ];

  if (loading) {
    return (
      <div className='w-[80%] h-screen my-10 mx-auto bg-black rounded-xl overflow-hidden flex items-center justify-center'>
        <div className='text-white text-xl'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-[80%] h-screen my-10 mx-auto bg-black rounded-xl overflow-hidden flex items-center justify-center'>
        <div className='text-red-500 text-xl'>Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      className="w-[90%] mx-auto my-10 bg-black rounded-xl overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div className="flex justify-end items-center px-6 py-2 ">
        <div className="relative">
          <select
            value={selectedSort}
            onChange={handleSortChange}
            className="bg-zinc-800 text-white rounded-xl p-2.5 pr-10 appearance-none border border-zinc-700 hover:border-zinc-600 transition-colors"
          >
            <option value="">Sort by</option>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl bg-zinc-950 mb-6">
        <div className="h-full overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-zinc-900">
              <tr className="text-center text-zinc-400 bg-zinc-900 text-[23px] font-light border-b border-zinc-500">
                <th className="p-4 pl-6 text-center">Collection Name</th>

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
            
            <tbody className="divide-y divide-zinc-800">
              {sortedData.map((item) => (
                
                <tr
                  key={item.id}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="p-4 pl-6 text-white text-center">{item.name}</td>

                  <td className="p-4 text-center text-white">
                    {item.buyers?.toLocaleString()}
                  </td>
                  <td className="p-4 text-center text-white">
                    {item.sellers?.toLocaleString()}
                  </td>
                  <td className="p-4 pr-6  text-center text-white">
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
