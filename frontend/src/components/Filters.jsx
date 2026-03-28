export default function Filters({ filters, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="filters-panel glass-card">
      <div className="filters-title">
        <span>🔍</span> Filters
      </div>
      <div className="filters-grid">
        <div className="form-group">
          <label className="label" htmlFor="filter-start-date">Start Date</label>
          <input
            id="filter-start-date"
            type="date"
            className="input-field"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="filter-end-date">End Date</label>
          <input
            id="filter-end-date"
            type="date"
            className="input-field"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="filter-age-group">Age Group</label>
          <select
            id="filter-age-group"
            className="input-field"
            value={filters.ageGroup}
            onChange={(e) => handleChange('ageGroup', e.target.value)}
          >
            <option value="all">All Ages</option>
            <option value="<18">Under 18</option>
            <option value="18-40">18 – 40</option>
            <option value=">40">Over 40</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="filter-gender">Gender</label>
          <select
            id="filter-gender"
            className="input-field"
            value={filters.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}
