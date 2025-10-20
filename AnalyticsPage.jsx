import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GLASS_CARD_CLASSES =
  "p-8 rounded-3xl shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20 " +
  "transition-transform transform hover:scale-[1.02] hover:shadow-indigo-500/40 " +
  "max-w-6xl mx-auto";

const AnalyticsPage = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const primaryColor = "rgba(99,102,241,0.9)"; // Indigo-500
    const primaryBorder = "rgb(99,102,241)";
    const hoverColor = "rgba(129,140,248,1)"; // Indigo-400

    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("http://localhost:8000/analytics");
        const data = response.data;

        const categories = Object.keys(data.category_distribution);
        const counts = Object.values(data.category_distribution);

        setChartData({
          categoryBarData: {
            labels: categories.slice(0, 10),
            datasets: [
              {
                label: "Products per Category",
                data: counts.slice(0, 10),
                backgroundColor: primaryColor,
                borderColor: primaryBorder,
                borderWidth: 2,
                hoverBackgroundColor: hoverColor,
              },
            ],
          },
        });
      } catch (err) {
        setError("⚠️ Failed to fetch analytics data. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // ⏳ Loading state
  if (isLoading)
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 animate-gradient bg-[length:200%_200%] min-h-screen flex items-center justify-center text-white">
        <div
          className={`${GLASS_CARD_CLASSES} text-center flex items-center space-x-4 px-10 py-6`}
        >
          <svg
            className="animate-spin h-6 w-6 text-indigo-400"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373
              0 0 5.373 0 12h4zm2
              5.291A7.962 7.962 0
              014 12H0c0 3.042 1.135
              5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-lg font-semibold tracking-wide">
            Loading Analytics...
          </span>
        </div>
      </div>
    );

  // ❌ Error state
  if (error)
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 animate-gradient bg-[length:200%_200%] min-h-screen flex items-center justify-center text-white">
        <div className="p-8 rounded-3xl shadow-2xl backdrop-blur-xl bg-red-600/30 border border-red-400 text-white font-semibold max-w-lg text-center">
          {error}
        </div>
      </div>
    );

  // ✅ Main Dashboard
  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 animate-gradient bg-[length:200%_200%] min-h-screen p-6 sm:p-10 text-white font-sans">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold drop-shadow-lg tracking-wider mb-2">
          Product Analytics Dashboard
        </h1>
        <p className="text-indigo-200 font-light text-lg">
          Visual overview of your dataset performance and trends
        </p>
      </header>

      {/* Chart Section */}
      <section className="space-y-10">
        {chartData?.categoryBarData && (
          <div className={`${GLASS_CARD_CLASSES}`}>
            <h2 className="text-2xl font-bold mb-6 text-white drop-shadow-lg border-b border-white/20 pb-3">
              🔝 Top 10 Product Categories
            </h2>
            <div className="h-[450px]">
              <Bar
                data={chartData.categoryBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        color: "white",
                        font: { size: 14, weight: "bold" },
                      },
                    },
                    title: {
                      display: true,
                      text: "Distribution Overview",
                      color: "white",
                      font: { size: 18, weight: "bold" },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0,0,0,0.85)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#6366f1",
                      borderWidth: 1,
                    },
                  },
                  scales: {
                    y: {
                      ticks: { color: "rgba(255,255,255,0.8)" },
                      grid: { color: "rgba(255,255,255,0.15)" },
                    },
                    x: {
                      ticks: { color: "rgba(255,255,255,0.8)" },
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalyticsPage;
