import { Line } from "react-chartjs-2";
import { Chart, Filler } from "chart.js";
Chart.register(Filler);

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import PropTypes from "prop-types";

function AreaChart({ options, data, plugins, refer }) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
  );

  const defaultOptions = {
    maintainAspectRatio: false,
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
            weight: '500',
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          borderDash: [5, 5],
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
          },
          callback: function(value) {
            return new Intl.NumberFormat('es-HN', {
              style: 'currency',
              currency: 'HNL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'rgb(17, 24, 39)',
        bodyColor: 'rgb(75, 85, 99)',
        borderColor: 'rgba(229, 231, 235, 1)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        usePointStyle: true,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const value = new Intl.NumberFormat('es-HN', {
              style: 'currency',
              currency: 'HNL',
            }).format(context.parsed.y);
            return `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        borderWidth: 3,
        hoverBorderWidth: 4,
      },
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return <Line options={mergedOptions} data={data} plugins={plugins} ref={refer} />;
}

AreaChart.propTypes = {
  options: PropTypes.object,
  data: PropTypes.object.isRequired,
  plugins: PropTypes.array,
  refer: PropTypes.object,
};

export default AreaChart;