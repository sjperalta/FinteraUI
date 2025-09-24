import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import PropTypes from "prop-types";

ChartJS.register(ArcElement, Tooltip, Legend);

function RevenuePieChart({ data, options, theme }) {
  const defaultData = {
    labels: ["Reserva", "Prima", "Cuotas"],
    datasets: [
      {
        label: "Distribución de Ingresos",
        data: [25, 35, 40],
        backgroundColor: [
          "rgba(250, 204, 21, 0.8)",   // Warning/Yellow for Reserva
          "rgba(74, 222, 128, 0.8)",   // Success/Green for Prima
          "rgba(255, 120, 75, 0.8)",   // Orange for Cuotas
        ],
        borderColor: [
          "rgba(250, 204, 21, 1)",
          "rgba(74, 222, 128, 1)",
          "rgba(255, 120, 75, 1)",
        ],
        borderWidth: 3,
        hoverBorderWidth: 5,
        hoverOffset: 15,
        borderAlign: 'inner',
      },
    ],
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
    plugins: {
      legend: {
        display: false, // We'll create a custom legend
      },
      tooltip: {
        backgroundColor: theme === "" ? "rgba(255, 255, 255, 0.95)" : "rgba(17, 24, 39, 0.95)",
        titleColor: theme === "" ? "rgb(17, 24, 39)" : "rgb(243, 244, 246)",
        bodyColor: theme === "" ? "rgb(75, 85, 99)" : "rgb(209, 213, 219)",
        borderColor: theme === "" ? "rgba(229, 231, 235, 1)" : "rgba(75, 85, 99, 1)",
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        usePointStyle: true,
        padding: 16,
        titleFont: {
          size: 16,
          weight: 'bold',
        },
        bodyFont: {
          size: 14,
          weight: '500',
        },
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const value = new Intl.NumberFormat('es-HN', {
              style: 'currency',
              currency: 'HNL',
            }).format(context.parsed);
            const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
            return [`Monto: ${value}`, `Porcentaje: ${percentage}%`];
          },
        },
      },
    },
    elements: {
      arc: {
        borderRadius: 8,
        borderJoinStyle: 'round',
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'nearest',
    },
  };

  return <Pie data={data || defaultData} options={options || defaultOptions} />;
}

RevenuePieChart.propTypes = {
  data: PropTypes.object,
  options: PropTypes.object,
  theme: PropTypes.string,
};

export default RevenuePieChart;