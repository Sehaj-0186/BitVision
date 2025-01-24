"use client";
import React, { useState } from "react";
import { useAppContext } from "@/components/context";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

const Hero = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { setIsClicked } = useAppContext();
  const router = useRouter();
  const { isConnected } = useAccount();

  const handleClick = () => {
    if (!isConnected) {
      return; // Early return if wallet not connected
    }
    setIsClicked(true);
    router.push("/dashboard/overview");
  };

  return (
    <div className="flex flex-col absolute top-32 w-full h-[60vh] items-center justify-evenly">
      <div>
        <span className="inline-flex animate-background-shine bg-[linear-gradient(110deg,#939393,45%,#1e293b,55%,#939393)] bg-[length:250%_100%] bg-clip-text text-[7vw] text-9xl text-transparent font-cinzel font-thin">
          BitVision
        </span>
      </div>
      <div className="text-center font-light text-gray-300">
        <span>"Your Guide to Smarter NFT Investments."</span>
        <br />
        <span>
          Track collection health, detect wash trades, and analyze holder
          loyalty in one place.
        </span>
        <br />
        <span>Make smarter decisions with real-time insights.</span>
      </div>
      <div className="mt-4 relative">
        <div
          className={`absolute bottom-[120%] text-center w-64 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-800 text-gray-200 text-sm rounded opacity-0 pointer-events-none transition-opacity duration-500 ${
            isHovered ? "opacity-100" : ""
          }`}
        >
          {!isConnected
            ? "Please connect your wallet using the button above"
            : "Click to get started!"}
        </div>
        <button
          className={`bg-transparent border-[1px] border-gray-600 rounded-md px-6 py-2 text-gray-300 transition-all duration-300 ${
            !isConnected
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-800 hover:border-gray-400"
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          disabled={!isConnected}
        >
          {!isConnected ? "Connect Wallet First" : "Get Started!"}
        </button>
      </div>
    </div>
  );
};

export default Hero;
