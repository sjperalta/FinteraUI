import ProtoTypes from "prop-types";
import square from "../../assets/images/shapes/square.svg";
import vline from "../../assets/images/shapes/vline.svg";
import dotted from "../../assets/images/shapes/dotted.svg";

function LoginPromo({ img }) {
  return (
    <div className="">
      <img src={img} alt="" />
    </div>
  );
}

LoginPromo.propTypes = {
  img: ProtoTypes.string,
};

export default LoginPromo;