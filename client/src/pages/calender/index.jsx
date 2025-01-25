import Wallet from "../../component/wallet";
import CalenderSm from "../../component/calender";
import CalenderFull from "../../component/calender/CalenderFull";

function Calender() {
  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px]">
      <div className="2xl:flex 2xl:space-x-[48px]">
        <CalenderFull />
        <section className="2xl:w-[400px] w-full flex flex-col lg:flex-row 2xl:space-x-0 2xl:flex-col lg:space-x-6 space-x-0">
          <Wallet />
          <CalenderSm />
        </section>
      </div>
    </main>
  );
}

export default Calender;
