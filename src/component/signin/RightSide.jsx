import ProtoTypes from "prop-types";
import square from "../../assets/images/shapes/square.svg";
import vline from "../../assets/images/shapes/vline.svg";
import dotted from "../../assets/images/shapes/dotted.svg";

function RightSide({ img }) {
  return (
    <div className="lg:w-1/2 lg:block hidden bg-[#F6FAFF] dark:bg-darkblack-600 p-10 relative min-h-screen ">
      <ul>
        <li className="absolute top-10 left-8">
          <img src={square} alt="" />
        </li>
        <li className="absolute right-12 top-14">
          <img src={vline} alt="" />
        </li>
        <li className="absolute bottom-1 left-8">
          <img src={dotted} alt="" />
        </li>
      </ul>
      <div className="">
        <img src={img} alt="" />
      </div>
      <div>
        <div className="text-center max-w-lg px-1.5 m-auto">
          <h3 className="text-bgray-900 dark:text-white font-semibold font-popins text-4xl mb-4">
            Speady, Easy and Fast
          </h3>
          <p className="text-bgray-600 dark:text-bgray-50 text-sm font-medium">
            Fintera. Ayuda a administrar tus pagos de tus financiamientos.
          </p>
        </div>
      </div>
    </div>
  );
}

RightSide.propTypes = {
  img: ProtoTypes.string,
};

export default RightSide;
