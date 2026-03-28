import { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data, loading, onBarClick }) {
  const chartRef = useRef(null);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <span className="spinner-text">Loading chart data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <div className="empty-state-title">No Data Available</div>
        <div className="empty-state-text">
          Try adjusting your filters to see feature click data.
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.feature_name),
    datasets: [
      {
        label: 'Total Clicks',
        data: data.map((d) => d.count),
        backgroundColor: data.map((_, i) => {
          const colors = [
            'rgba(99, 102, 241, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(167, 139, 250, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(14, 165, 233, 0.7)',
            'rgba(249, 115, 22, 0.7)',
          ];
          return colors[i % colors.length];
        }),
        borderColor: data.map((_, i) => {
          const colors = [
            'rgba(99, 102, 241, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(167, 139, 250, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(14, 165, 233, 1)',
            'rgba(249, 115, 22, 1)',
          ];
          return colors[i % colors.length];
        }),
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: data.map((_, i) => {
          const colors = [
            'rgba(99, 102, 241, 0.9)',
            'rgba(139, 92, 246, 0.9)',
            'rgba(167, 139, 250, 0.9)',
            'rgba(16, 185, 129, 0.9)',
            'rgba(245, 158, 11, 0.9)',
            'rgba(236, 72, 153, 0.9)',
            'rgba(14, 165, 233, 0.9)',
            'rgba(249, 115, 22, 0.9)',
          ];
          return colors[i % colors.length];
        }),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const featureName = data[index].feature_name;
        onBarClick(featureName);
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items) => `Feature: ${items[0].label}`,
          label: (item) => `${item.raw} clicks — click to view trend`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="chart-container">
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
