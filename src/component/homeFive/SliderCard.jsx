import React from "react";
import quotation from "../../assets/images/icon/quotation.svg";
import star from "../../assets/images/icon/star.svg";

function SliderCard({ author, authorLocation, post }) {
  return (
    <div>
      <div className="max-w-full w-full md:w-[530px] h-[430px] border border-solid border-white bg-white px-11 py-[30px] flex flex-col justify-between border-b-[7px]  rounded-xl">
        <div>
          <img src={quotation} alt="quotation" className="pb-10" />
          <span className="text-gray-900 xl:text-2xl text-lg font-normal leading-150">
            {post}
          </span>
        </div>
        <div>
          <div className="w-full flex justify-between items-center">
            <span className="text-gray-900 xl:text-2xl text-lg font-normal leading-150">
              {author}
              <span className="text-stockColor"> {authorLocation}</span>
            </span>
            <img src={star} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SliderCard;
