import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

export default function LineChart({ data, loading, selectedFeature, onPointClick }) {
  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <span className="spinner-text">Loading trend data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">{selectedFeature ? '📭' : '👆'}</div>
        <div className="empty-state-title">
          {selectedFeature ? 'No Trend Data' : 'No Data Available'}
        </div>
        <div className="empty-state-text">
          {selectedFeature
            ? `No time-series data found for "${selectedFeature}" with current filters.`
            : 'Try adjusting your filters or click a bar to see a specific trend.'}
        </div>
      </div>
    );
  }

  const label = selectedFeature ? `Clicks: ${selectedFeature}` : 'Total Clicks (All Features)';

  const chartData = {
    labels: data.map((d) => d.period),
    datasets: [
      {
        label,
        data: data.map((d) => d.count),
        borderColor: selectedFeature ? 'rgba(99, 102, 241, 1)' : 'rgba(139, 92, 246, 1)',
        backgroundColor: selectedFeature ? 'rgba(99, 102, 241, 0.08)' : 'rgba(139, 92, 246, 0.08)',
        pointBackgroundColor: selectedFeature ? 'rgba(99, 102, 241, 1)' : 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#0a0e1a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0 && onPointClick) {
        const index = elements[0].index;
        const period = data[index].period;
        onPointClick(period);
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
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, maxRotation: 45 },
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
      <Line data={chartData} options={options} />
    </div>
  );
}
