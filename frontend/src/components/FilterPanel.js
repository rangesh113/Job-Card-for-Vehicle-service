import React from "react";
import "./FilterPanel.css";

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
    const handleChange = (filterName, value) => {
        if (onFilterChange) {
            onFilterChange(filterName, value);
        }
    };

    return (
        <div className="filter-panel">
            <div className="filter-header">
                <h4>🔽 Filters</h4>
                <button className="clear-filters-btn" onClick={onClearFilters}>
                    Clear All
                </button>
            </div>

            <div className="filter-group">
                <label>Status</label>
                <select
                    value={filters.status || ""}
                    onChange={(e) => handleChange("status", e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Vehicle Type</label>
                <select
                    value={filters.vehicleType || ""}
                    onChange={(e) => handleChange("vehicleType", e.target.value)}
                >
                    <option value="">All Types</option>
                    <option value="2-wheeler">2-Wheeler</option>
                    <option value="4-wheeler">4-Wheeler</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Priority</label>
                <select
                    value={filters.priority || ""}
                    onChange={(e) => handleChange("priority", e.target.value)}
                >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                </select>
            </div>

            <div className="filter-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={filters.isCritical || false}
                        onChange={(e) => handleChange("isCritical", e.target.checked)}
                    />
                    <span>Critical Issues Only</span>
                </label>
            </div>
        </div>
    );
};

export default FilterPanel;
