import Lots from "../../../component/listTab/lots";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../../context/AuthContext";

function LotsList() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const { user } = useContext(AuthContext);

  const handleNewLot = () => {
    if (!projectId) return;
    navigate(`/projects/${projectId}/lots/create`);
  };

  return (
    <main className="w-full px-6 pb-6 pt-[100px] sm:pt-[156px] xl:px-[48px] xl:pb-[48px] dark:bg-darkblack-700">
      {/* write your code here */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-bgray-900 dark:text-white">Lotes</h2>
        {user?.role === 'admin' && (
          <button
            type="button"
            onClick={handleNewLot}
            className="bg-success-300 hover:bg-success-400 text-white text-sm font-medium px-3 py-2 rounded"
          >
            Nuevo Lote
          </button>
        )}
      </div>

      <div className="2xl:flex 2xl:space-x-[48px]">
        <section className="mb-6 2xl:mb-0 2xl:flex-1">
          <Lots />
        </section>
      </div>
    </main>
  );
}

export default LotsList;