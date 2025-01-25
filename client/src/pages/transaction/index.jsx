import Payments from "../../component/listTab/payments";

function Transaction() {
  return (
    <main className="w-full px-6 pb-6 pt-[100px] sm:pt-[156px] xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      {/* write your code here */}
      <div className="2xl:flex 2xl:space-x-[48px]">
        <section className="mb-6 2xl:mb-0 2xl:flex-1">
          <Payments />
        </section>
      </div>
    </main>
  );
}

export default Transaction;

