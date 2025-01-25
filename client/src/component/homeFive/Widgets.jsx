import React from "react";
import bg from "../../assets/images/cards/bg.png";
import vector from "../../assets/images/cards/vector.png";
import revenue from "../../assets/images/cards/revenue.png";
import earning from "../../assets/images/cards/earning.png";
import efficiency from "../../assets/images/cards/efficiency.png";
import offer from "../../assets/images/cards/offer.png";
import dashboard from "../../assets/images/cards/dashboard.jpg";
import check from "../../assets/images/icon/check.svg";

function Widgets() {
  return (
    <section className="w-full flex justify-center items-center 2xl:mt-[138px] mt-[50px] xl:px-[5%] 2xl:p-0">
      <div
        className="w-[90%] xl:w-full max-w-[1320px] relative flex gap-40 flex-wrap xl:flex-nowrap 2xl:flex-wrap pt-[125px] pb-[137px] px-[5%] xl:px-0 bg-cover"
        style={{ background: `url(${bg})` }}
      >
        <div className="2xl:w-[505px] xl:w-6/12 w-11/12 z-0 h-full rounded-20 flex justify-center items-center relative">
          <div className="bg-alertsWarningLight xl:w-[505px] w-full h-full rounded-20 flex justify-center items-center relative z-0">
            {/* <!-- Bg start  --> */}
            <img
              src={vector}
              alt=""
              className="absolute"
              style={{ zIndex: -1 }}
            />

            <img
              src={revenue}
              className="absolute top-[5%] left-[3%]"
              alt=""
              style={{ zIndex: 1 }}
            />
            <img
              src={earning}
              className="absolute bottom-[2%] -left-[4%] z-20 xl:max-w-[163px] sm:max-w-[130px] max-w-[100px]"
              alt=""
            />
            <img
              src={efficiency}
              className="absolute top-[8%] -right-[12%] z-20 w-32 sm:w-fit"
              alt=""
            />
            <img
              src={offer}
              className="absolute -bottom-[10%] -right-[12%] z-20 w-32 sm:w-fit"
              alt=""
            />

            {/* <!-- Bg end  --> */}
            <img
              src={dashboard}
              className="xl:pt-28 pt-14 px-6 xl:px-11 z-10 w-full"
              alt="dashboard"
              data-aos="fade-right"
              data-aos-easing="fade-left"
            />
          </div>
        </div>
        <div
          className="w-10/12 xl:w-5/12 2xl:max-w-[514px] xl:ml-16 relative"
          data-aos="fade-left"
          data-aos-easing="fade-right"
        >
          <span className="text-black font-poppins 2xl:text-5xl xl:text-4xl text-3xl font-bold leading-big-loose z-10">
            120+ Widgets &<br />
            UI Cards in BankCo
          </span>
          <br />
          <span className="text-gray-500 xl:text-xl text-lg font-medium leading-160 mt-[14px] z-10">
            Design dashboards quickly with 400+ Widgets &<br />
            Cards world-class standards out-of-the-box
          </span>
          <div className="flex flex-col text-gray-600 xl:text-xl text-base font-normal leading-220 z-10">
            <div className="flex gap-[10px] mt-3">
              <img src={check} alt="" />
              <span>Up to 5 staff members</span>
            </div>
            <div className="flex gap-[10px] mt-3">
              <img src={check} alt="" />
              <span>Fraud analysis</span>
            </div>
            <div className="flex gap-[10px] mt-3">
              <img src={check} alt="" />
              <span>Professional reports</span>
            </div>
            <a
              href="#"
              className="inline-flex max-w-[190px] mt-5 h-[60px] py-2.5 px-9 justify-center items-center gap-3 shrink-0 rounded-xl border-[2.333px] border-primary z-40 transition-all group relative overflow-hidden"
            >
              <div className="w-full h-full bg-primary absolute right-0 bottom-0 group-hover:w-0 group-hover:h-0 z-0 transition-all"></div>
              <span className="text-center text-xl font-semibold leading-8 text-white z-10 group-hover:text-primary">
                Live Preview
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Widgets;
