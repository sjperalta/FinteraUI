import { useContext } from "react"
import { useParams } from "react-router-dom";
import resetPass from "../../../assets/images/illustration/reset-password.svg";
import PasswordChange from "../../../component/forms/PasswordChange";
import AuthContext from "../../../context/AuthContext";

function Security() {
  const { token } = useContext(AuthContext); // Ensure AuthContext provides the token
  const { userId } = useParams()

  return (
    <div id="tab6" className="tab-pane active">
      <div className="flex flex-col gap-10 xl:flex-row xl:items-center">
        <div className="grow max-w-[614px]">
          <h3 className="text-2xl font-bold text-bgray-900 dark:text-white mb-3">
            Password
          </h3>
          <p className="text-sm fotn-medium text-bgray-500 dark:text-bgray-50">
            Change or view your password.
          </p>
          { token ? <PasswordChange token={token} userId={userId} /> : "Loading ..." }
        </div>
        <div className="mx-auto pt-10 hidden xl:block">
          <img src={resetPass} alt="" />
        </div>
      </div>
    </div>
  );
}

export default Security;
