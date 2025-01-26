"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/Sidebar";
import {
  IconArrowLeft,
  IconLibrary,
  IconUserBolt,
  IconBuildingStore,
  IconBrandGithub,
  IconCircleArrowRight,
  IconBrandInstagram,
  IconBrandX,
  IconBrandFacebook,
  IconBrandDiscord,
  IconChartHistogram
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "../lib/utils";
import SiteLogo from "../images/logo1.png";

export function SidebarDemo({ children }) {
  const links = [
    {
      label: "Wallet Overview",
      href: "/dashboard/overview",
      icon: (
        <IconLibrary className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "My NFTs",
      href: "/dashboard/nftCollection",
      icon: (
        <IconUserBolt className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "NFT Marketplace",
      href: "/dashboard/nftMarketplace",
      icon: (
        <IconBuildingStore className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    ,
    {
      label: "Market Analytics",
      href: "/dashboard/analytics",
      icon: (
        <IconChartHistogram className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Home",
      href: "/",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-black w-full flex-1 max-w-full mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen} className="rounded-md">
        <SidebarBody className="justify-between gap-10 rounded-2xl">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden rounded-xl">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            {open ? (
              <>
                <div>Visit Us :)</div>
                <div className="flex gap-1">
                  <SidebarLink
                    link={{
                      href: "https://github.com/Sehaj-0186/BitVision",
                      icon: (
                        <IconBrandGithub className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0 hover:text-white" />
                      ),
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }}
                  />
                  <SidebarLink
                    link={{
                      href: "https://github.com/Sehaj-0186/Bitvison",
                      icon: (
                        <IconBrandInstagram className="text-neutral-700 dark:text-neutral-200 hover:text-white h-6 w-6 flex-shrink-0 " />
                      ),
                    }}
                  />
                  <SidebarLink
                    link={{
                      href: "https://github.com/Sehaj-0186/Bitvison",
                      icon: (
                        <IconBrandX className="text-neutral-700 dark:text-neutral-200 hover:text-white h-6 w-6 flex-shrink-0" />
                      ),
                    }}
                  />
                  <SidebarLink
                    link={{
                      href: "https://github.com/Sehaj-0186/Bitvison",
                      icon: (
                        <IconBrandFacebook className="text-neutral-700 dark:text-neutral-200 hover:text-white h-6 w-6 flex-shrink-0" />
                      ),
                    }}
                  />
                  <SidebarLink
                    link={{
                      href: "https://github.com/Sehaj-0186/Bitvison",
                      icon: (
                        <IconBrandDiscord className="text-neutral-700 dark:text-neutral-200 hover:text-white h-6 w-6 flex-shrink-0" />
                      ),
                    }}
                  />
                </div>
              </>
            ) : (
              <SidebarLink
                link={{
                  href: "#",
                  icon: (
                    <IconCircleArrowRight className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
                  ),
                }}
              />
            )}
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-auto">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <Image src={SiteLogo} alt="logo" className="h-8 w-9 flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre font-cinzel"
      >
        BitVision
      </motion.span>
    </div>
  );
};
export const LogoIcon = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <Image src={SiteLogo} alt="logo" className="h-6 w-7 flex-shrink-0" />
    </div>
  );
};
