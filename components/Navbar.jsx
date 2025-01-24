import React from 'react'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import logo from '../images/logo1.png'
import Image from 'next/image';

const Navbar = () => {
  return (
    <div className="w-full flex justify-between items-center h-[20vh] absolute top-0">
      <div className="flex items-center mx-16">
        <Image src={logo} alt="logo" width={60} height={60} />
        <span className="font-cinzel font-semibold bg-gradient-to-r text-transparent bg-clip-text from-gray-500 via-gray-400 to-gray-500 text-xl">
          BitVision
        </span>
      </div>
      <div className="mx-16">
        <ConnectButton  />
      </div>
    </div>
  );
}

export default Navbar