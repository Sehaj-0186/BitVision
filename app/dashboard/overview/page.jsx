import { SidebarDemo } from "@/components/SidebarDemo";
import WalletOverview from "./WalletOverview";
import Navbar from "./Navbar";

export default function Overview() {
  return (
    <SidebarDemo>
    <div className="bg-zinc-950 h-screen w-full">
      <Navbar/>
     <WalletOverview/>
    </div>
    </SidebarDemo>
  );
}