import img from "../../assets/images/illustration/404.svg";
import { Link } from "react-router-dom";

function Error() {
  return (
    <section className="dark:bg-notfound-dark bg-no-repeat bg-cover bg-notfound-light">
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-2xl mx-auto">
          <img src={img} alt="" />
          <div className="flex justify-center mt-10">
            <Link
              to="/"
              className="bg-success-300 text-sm font-bold text-white rounded-lg px-10 py-3"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Error;
