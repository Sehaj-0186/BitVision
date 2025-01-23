'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react'; // Import the arrow icon

const Table = () => {
  const [sortBy, setSortBy] = useState('healthScore'); // Default sorting by health score
  const [sortOrder, setSortOrder] = useState('desc'); // Default sorting order

  // Sample data
  const data = [
    { name: 'NFT 1', healthScore: 85, buyers: 10, sellers: 5, washTradeVolume: 100 },
    { name: 'NFT 2', healthScore: 70, buyers: 8, sellers: 3, washTradeVolume: 200 },
    { name: 'NFT 3', healthScore: 90, buyers: 15, sellers: 7, washTradeVolume: 150 },
    { name: 'NFT 4', healthScore: 60, buyers: 5, sellers: 2, washTradeVolume: 50 },
    { name: 'NFT 5', healthScore: 75, buyers: 12, sellers: 4, washTradeVolume: 300 },
    { name: 'NFT 6', healthScore: 80, buyers: 9, sellers: 6, washTradeVolume: 120 },
    { name: 'NFT 7', healthScore: 95, buyers: 20, sellers: 10, washTradeVolume: 400 },
    { name: 'NFT 8', healthScore: 65, buyers: 3, sellers: 1, washTradeVolume: 30 },
    { name: 'NFT 9', healthScore: 88, buyers: 11, sellers: 5, washTradeVolume: 250 },
    { name: 'NFT 10', healthScore: 78, buyers: 7, sellers: 4, washTradeVolume: 90 },
   ];

   // Sorting function
   const sortedData = [...data].sort((a, b) => {
     if (sortOrder === 'asc') {
       return a[sortBy] > b[sortBy] ? 1 : -1;
     } else {
       return a[sortBy] < b[sortBy] ? -1 : 1;
     }
   });

   // Handle sort change
   const handleSortChange = (e) => {
     const value = e.target.value;
     if (value.includes(' ')) {
       const [columnName, order] = value.split(' ');
       setSortBy(columnName);
       setSortOrder(order);
     }
   };

   return (
     <div className='w-[80%] h-screen my-10 mx-auto bg-black rounded-xl overflow-hidden'>
       <div className='flex justify-end h-28 items-end'>
         <div className='relative p-4'>
           <select 
             onChange={handleSortChange} 
             className='bg-zinc-800 text-white rounded-xl p-2 appearance-none pr-8'
           >
             <option value="" disabled selected>Sort by</option> {/* Placeholder */}
             <option value="healthScore desc">Health Score (High to Low)</option>
             <option value="healthScore asc">Health Score (Low to High)</option>
             <option value="buyers desc">Buyers (High to Low)</option>
             <option value="buyers asc">Buyers (Low to High)</option>
             <option value="sellers desc">Sellers (High to Low)</option>
             <option value="sellers asc">Sellers (Low to High)</option>
             <option value="washTradeVolume desc">Wash Trade Volume (High to Low)</option>
             <option value="washTradeVolume asc">Wash Trade Volume (Low to High)</option>
           </select>
           {/* Add the arrow icon */}
           <ChevronDown className="absolute right-6 top-[50%] transform -translate-y-[50%] text-white pointer-events-none" />
         </div>
       </div>
       <div className='overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900'>
         {/* Table Head */}
         <table className='w-[95%] mx-auto bg-black rounded-xl'>
           <thead >
             <tr className='text-center text-gray-300 bg-zinc-900 text-xl font-thin'>
               <th className='p-4'>Name</th>
               <th className='p-4'>Health Score</th>
               <th className='p-4'>Buyers</th>
               <th className='p-4'>Sellers</th>
               <th className='p-4'>Wash Trade Volume</th>
             </tr>
           </thead>
         </table>

         {/* Table Body */}
         <div className="overflow-y-auto max-h-[70vh] bg-zinc-900 rounded-xl">
           <table className='w-[95%] mx-auto bg-black rounded-xl'>
             <tbody className='text-center'>
               {sortedData.map((item) => (
                 <tr key={item.name} className='border-b border-zinc-800 '>
                   <td className='p-4 text-white'>{item.name}</td>
                   <td className='p-4 text-white'>{item.healthScore}</td>
                   <td className='p-4 text-white'>{item.buyers}</td>
                   <td className='p-4 text-white'>{item.sellers}</td>
                   <td className='p-4 text-white'>{item.washTradeVolume}</td>
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
