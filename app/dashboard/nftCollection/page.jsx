import { SidebarDemo } from "../../../components/SidebarDemo";
import Navbar from "./Navbar";
import NftList from "./NftList";

export default function NFT() {
  return (
    <SidebarDemo>
      <div className="bg-black h-screen w-full overflow-hidden ">
        <Navbar />
        <NftList />
      </div>
    </SidebarDemo>
  );
}
