import React from 'react'
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  return (
    <>
   <div className="w-[95%] mx-auto my-4 h-fit flex justify-between items-end relative rounded-xl  border-b-[1px] border-b-gradient-to-r from-[#fc30e1] to-[#3052fc]">
  <div className=" text-4xl lg:text-5xl md:text-5xl sm:text-4xl font-light mt-5 mb-2 ml-2 text-white text-nowrap font-[Clash Grotesk]">
    Wallet Overview
  </div>
  <div className="mr-2 mb-2">
    <ConnectButton />
  </div>
</div>

    </>
    
  )
}

export default Navbar