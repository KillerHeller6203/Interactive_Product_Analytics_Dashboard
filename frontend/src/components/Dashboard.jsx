import { useState, useEffect, useCallback } from 'react';
import Filters from './Filters';
import BarChart from './BarChart';
import LineChart from './LineChart';
import { getAnalytics, trackEvent } from '../api';
import { saveFilters, loadFilters } from '../cookies';

export default function Dashboard({ onLogout }) {
  const [filters, setFilters] = useState(loadFilters);
  const [featureCounts, setFeatureCounts] = useState([]);
  const [timeSeries, setTimeSeries] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lineLoading, setLineLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch analytics ───────────────────────────────
  const fetchAnalytics = useCallback(async (currentFilters, feature = null) => {
    try {
      if (feature) {
        setLineLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await getAnalytics({
        startDate: currentFilters.startDate,
        endDate: currentFilters.endDate,
        ageGroup: currentFilters.ageGroup,
        gender: currentFilters.gender,
        featureName: feature || undefined,
      });

      if (!feature) {
        setFeatureCounts(data.feature_counts);
        setTimeSeries(data.time_series);
      } else {
        setTimeSeries(data.time_series);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setLineLoading(false);
    }
  }, []);

  // ── Track page load + dashboard view on mount ─────
  useEffect(() => {
    trackEvent('page_load');
    trackEvent('dashboard_view');
    fetchAnalytics(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handle filter change ──────────────────────────
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    saveFilters(newFilters);

    // Track each filter change
    const changedKeys = Object.keys(newFilters).filter(
      (key) => newFilters[key] !== filters[key]
    );
    changedKeys.forEach((key) => {
      const trackName = {
        startDate: 'date_filter',
        endDate: 'date_filter',
        ageGroup: 'age_filter',
        gender: 'gender_filter',
      }[key];
      if (trackName) trackEvent(trackName);
    });

    setSelectedFeature(null);
    fetchAnalytics(newFilters);
  };

  // ── Handle bar click ──────────────────────────────
  const handleBarClick = (featureName) => {
    setSelectedFeature(featureName);
    trackEvent('bar_chart_click');
    fetchAnalytics(filters, featureName);
  };

  // ── Handle line chart point click ─────────────────
  const handleLinePointClick = (period) => {
    trackEvent('line_chart_click');
  };

  // ── Clear feature selection ───────────────────────
  const clearFeature = () => {
    setSelectedFeature(null);
    fetchAnalytics(filters);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="dashboard-brand-icon">📊</span>
          <h1 className="dashboard-title">Product Analytics</h1>
        </div>
        <div className="dashboard-user">
          <button
            id="btn-logout"
            className="btn btn-secondary btn-logout"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Filters */}
      <Filters filters={filters} onChange={handleFilterChange} />

      {/* Error State */}
      {error && (
        <div className="error-banner glass-card">
          <span className="error-banner-icon">⚠️</span>
          <span className="error-banner-text">{error}</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => fetchAnalytics(filters, selectedFeature)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Charts */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <div className="chart-title">
              <span>📊</span> Feature Clicks
            </div>
            <span className="chart-badge">Bar Chart</span>
          </div>
          <BarChart
            data={featureCounts}
            loading={loading}
            onBarClick={handleBarClick}
          />
        </div>

        {/* Line Chart */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <div className="chart-title">
              <span>📈</span> Click Trend
              {selectedFeature && (
                <span className="selected-feature">
                  {selectedFeature}
                  <span className="clear-btn" onClick={clearFeature}>✕</span>
                </span>
              )}
            </div>
            <span className="chart-badge">Time Series</span>
          </div>
          <LineChart
            data={timeSeries}
            loading={lineLoading}
            selectedFeature={selectedFeature}
            onPointClick={handleLinePointClick}
          />
        </div>
      </div>
    </div>
  );
}
