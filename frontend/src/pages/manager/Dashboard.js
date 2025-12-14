import { useEffect, useState, useCallback } from "react";
import API from "../../api/api";
import SearchBar from "../../components/SearchBar";
import FilterPanel from "../../components/FilterPanel";
import { toast } from "react-toastify";
import "./Dashboard.css";

const statuses = ["NEW", "IN_PROGRESS", "DONE"];

const Dashboard = () => {
  const [data, setData] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    totalRevenue: 0
  });
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    vehicleType: "",
    priority: "",
    isCritical: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, jobsRes] = await Promise.all([
        API.get("/manager/dashboard"),
        API.get("/manager/jobs")
      ]);
      setData(dashRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      toast.error("Failed to load dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...jobs];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.customerName?.toLowerCase().includes(search) ||
        job.vehicleNumber?.toLowerCase().includes(search) ||
        job.vehicleModel?.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.vehicleType) {
      filtered = filtered.filter(job => job.vehicleType === filters.vehicleType);
    }

    if (filters.priority) {
      filtered = filtered.filter(job => job.priority === filters.priority);
    }

    if (filters.isCritical) {
      filtered = filtered.filter(job => job.isCritical === true);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, filters, jobs]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      vehicleType: "",
      priority: "",
      isCritical: false
    });
    setSearchTerm("");
  };

  const updateStatus = async (id, status) => {
    const confirmed = window.confirm(`Are you sure you want to change status to ${status}?`);
    if (!confirmed) return;

    try {
      await API.put(`/jobcards/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      loadData();
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "NEW":
        return { color: "#3498db", icon: "🆕", label: "New" };
      case "IN_PROGRESS":
        return { color: "#f39c12", icon: "⚙️", label: "In Progress" };
      case "DONE":
        return { color: "#27ae60", icon: "✅", label: "Completed" };
      default:
        return { color: "#95a5a6", icon: "❓", label: status };
    }
  };

  if (loading) {
    return (
      <div className="manager-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="dashboard-header">
        <h1>📊 Manager Dashboard</h1>
        <p className="subtitle">Overview and job management</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{data.totalJobs}</h3>
            <p>Total Jobs</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{data.completedJobs}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{data.pendingJobs}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>₹{data.totalRevenue.toFixed(2)}</h3>
            <p>Revenue</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="kanban-header">
        <h2>🗂️ Job Board ({filteredJobs.length})</h2>
        <button
          className="btn-filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"} 🔽
        </button>
      </div>

      <div className="search-filter-section">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Search jobs..."
        />
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        )}
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {statuses.map((status) => {
          const statusInfo = getStatusInfo(status);
          const statusJobs = filteredJobs.filter((j) => j.status === status);

          return (
            <div key={status} className="kanban-column">
              <div className="kanban-column-header" style={{ background: statusInfo.color }}>
                <span className="column-icon">{statusInfo.icon}</span>
                <h3>{statusInfo.label}</h3>
                <span className="column-count">{statusJobs.length}</span>
              </div>

              <div className="kanban-cards">
                {statusJobs.length === 0 ? (
                  <div className="empty-column">
                    <p>No jobs</p>
                  </div>
                ) : (
                  statusJobs.map((job) => (
                    <div key={job._id} className="kanban-card">
                      <div className="card-header">
                        <h4>{job.customerName}</h4>
                        {job.isCritical && (
                          <span className="critical-badge">🚨</span>
                        )}
                      </div>
                      <p className="vehicle-info">
                        {job.vehicleModel} • {job.vehicleNumber}
                      </p>
                      <p className="technician-info">
                        👨‍🔧 {job.technician?.name || "Unassigned"}
                      </p>
                      {job.priority && (
                        <span className="priority-badge" style={{
                          background: job.priority === "URGENT" ? "#e74c3c" :
                            job.priority === "HIGH" ? "#f39c12" : "#3498db"
                        }}>
                          {job.priority}
                        </span>
                      )}

                      <div className="card-actions">
                        {status !== "NEW" && (
                          <button
                            onClick={() => updateStatus(job._id, "NEW")}
                            className="btn-action btn-new"
                            title="Move to New"
                          >
                            🆕
                          </button>
                        )}
                        {status !== "IN_PROGRESS" && (
                          <button
                            onClick={() => updateStatus(job._id, "IN_PROGRESS")}
                            className="btn-action btn-progress"
                            title="Move to In Progress"
                          >
                            ⚙️
                          </button>
                        )}
                        {status !== "DONE" && (
                          <button
                            onClick={() => updateStatus(job._id, "DONE")}
                            className="btn-action btn-done"
                            title="Move to Done"
                          >
                            ✅
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
