import member from "../../assets/images/avatar/members-3.png";
import card1 from "../../assets/images/payments/card-1.svg";
import card2 from "../../assets/images/payments/card-2.svg";
import card3 from "../../assets/images/payments/card-3.svg";
import Slider from "../slider";
import PaymentFilter from "../forms/PaymentFilter";
import PaymentSelect from "../forms/PaymentSelect";
import GreenBtn from "../button/AddMony";

function Wallet() {
  return (
    <div className="mb-6 w-full rounded-lg bg-white px-[42px] py-5 dark:border dark:border-darkblack-400 dark:bg-darkblack-600 lg:mb-0 lg:w-1/2 2xl:mb-6 2xl:w-full">
      <div className="my-wallet mb-8 w-full">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-bgray-900 dark:text-white">
            My Wallet
          </h3>
          <PaymentSelect />
        </div>

        <div className="flex justify-center">
          <div className="card-slider relative w-[280px] md:w-[340px]">
            <Slider
              slidesPerView={1}
              loop={true}
              effect={"fade"}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
            >
              <div className="w-full">
                <img src={card1} alt="card" />
              </div>
              <div className="w-full">
                <img src={card2} alt="card" />
              </div>
              <div className="w-full">
                <img src={card3} alt="card" />
              </div>
            </Slider>
          </div>
        </div>
      </div>
      <div className="w-full">
        <h3 className="mb-4 text-lg font-bold text-bgray-900 dark:text-white">
          Quick Transfer
        </h3>
        <PaymentFilter />
        <div className="flex h-[98px] w-full flex-col justify-between rounded-lg border border-bgray-200 p-4 focus-within:border-success-300 dark:border-darkblack-400">
          <p className="text-sm font-medium text-bgray-600 dark:text-bgray-50">
            Enter amount
          </p>
          <div className="flex h-[35px] w-full items-center justify-between">
            <span className="text-2xl font-bold text-bgray-900 dark:text-white">
              $
            </span>
            <label className="w-full">
              <input
                type="text"
                className="w-full border-none p-0 text-2xl font-bold text-bgray-900 focus:outline-none focus:ring-0 dark:border-darkblack-400 dark:bg-darkblack-600 dark:text-white"
              />
            </label>
            <div>
              <img src={member} alt="members" />
            </div>
          </div>
        </div>
        <GreenBtn text="Send Money" className="mt-7" />
      </div>
    </div>
  );
}

export default Wallet;
