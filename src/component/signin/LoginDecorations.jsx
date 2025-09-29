import square from "../../assets/images/shapes/square.svg";
import vline from "../../assets/images/shapes/vline.svg";
import dotted from "../../assets/images/shapes/dotted.svg";

function LoginDecorations() {
  return (
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
  );
}

export default LoginDecorations;