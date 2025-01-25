import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import ProtoTypes from "prop-types";

function BarChart({ options, data }) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  return <Bar options={options} data={data} />;
}

BarChart.propTypes = {
  options: ProtoTypes.object,
  data: ProtoTypes.object,
};

export default BarChart;
