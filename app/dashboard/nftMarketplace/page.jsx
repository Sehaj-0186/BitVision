import { SidebarDemo } from "../../../components/SidebarDemo";
import Navbar from "./Navbar";
import Table from "./Table";

export default function NFTMarketplace() {
  return (
    <SidebarDemo>
    <div className="bg-black h-screen w-full">
     <Navbar/>
     <Table/>
    </div>
    </SidebarDemo>
  );
}