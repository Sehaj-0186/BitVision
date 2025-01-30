import React from 'react'
import { SidebarDemo } from '../../../components/SidebarDemo'
import Navbar from './Navbar'
import MultiLineChart from './MultiLineChart'
import WashTradeChart from './WashTradeChart';

const page = () => {
  return (
    <SidebarDemo>
      <div className='bg-black h-screen w-full '>
        <Navbar/>
        <div className='space-y-4'>
          <MultiLineChart />
          <WashTradeChart />
        </div>
      </div>
    </SidebarDemo>
  )
}

export default page