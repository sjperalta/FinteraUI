import ListTab from "../../component/listTab";
import TeamChat from "../../component/teamChat";
import EfficiencyV2 from "../../component/revenueFlow/EfficiencyV2";
import SummaryV3 from "../../component/summary/SummaryV3";

function Analytics() {
  return (
    <main className="w-full xl:px-12 px-6 pb-6 xl:pb-12 sm:pt-[156px] pt-[100px]">
      <div className="2xl:flex 2xl:space-x-[48px]">
        <section className="2xl:w-70 w-full 2xl:mb-0 mb-6">
          <SummaryV3 />
          <ListTab />
        </section>
        <section className="2xl:flex-1 w-full">
          <EfficiencyV2 />
          <TeamChat />
        </section>
      </div>
    </main>
  );
}

export default Analytics;
