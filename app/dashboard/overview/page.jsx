import { SidebarDemo } from "../../../components/SidebarDemo";
import WalletOverview from "./WalletOverview";
import Navbar from "./Navbar";
import Portfolio from "./Portfolio";
export default function Overview() {
  return (
    <SidebarDemo>
    <div className="bg-black h-screen w-full">
      <Navbar/>
     <WalletOverview/>
   <Portfolio/>
    </div>
    </SidebarDemo>
  );
}