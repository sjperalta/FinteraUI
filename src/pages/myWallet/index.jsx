import ListTab from "../../component/listTab";
import Wallet from "../../component/wallet";
import AddBalance from "../../component/addBalance/AddBalance";
import SummaryV3 from "../../component/summary/SummaryV3";
import EfficiencyV2 from "../../component/revenueFlow/EfficiencyV2";

function MyWallet() {
  return (
    <main className="w-full xl:px-12 px-6 pb-6 xl:pb-12 sm:pt-[156px] pt-[100px]">
      {/* write your code here */}
      <div className="2xl:flex 2xl:space-x-[48px]">
        <section className="2xl:w-[424px]">
          <AddBalance />
          <Wallet />
        </section>
        <div className="2xl:flex-1">
          <section className="w-full xl:flex xl:space-x-[24px]">
            <SummaryV3 />
            <EfficiencyV2 />
          </section>
          <ListTab />
        </div>
      </div>
    </main>
  );
}

export default MyWallet;
