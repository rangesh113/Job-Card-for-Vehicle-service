import { useEffect, useState, useCallback } from "react";
import API from "../../api/api";
import SearchBar from "../../components/SearchBar";
import FilterPanel from "../../components/FilterPanel";
import { toast } from "react-toastify";
import "./AdvisorDashboard.css";

const AdvisorDashboard = () => {
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    vehicleType: "",
    vehicleModel: "",
    vehicleNumber: "",
    complaint: "",
    technician: ""
  });

  const [technicians, setTechnicians] = useState([]);
  const [jobCards, setJobCards] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Search and filter states
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
      const [techRes, jobsRes] = await Promise.all([
        API.get("/manager/technicians"),
        API.get("/jobcards")
      ]);
      setTechnicians(techRes.data);
      setJobCards(jobsRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...jobCards];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.customerName?.toLowerCase().includes(search) ||
        job.vehicleNumber?.toLowerCase().includes(search) ||
        job.vehicleModel?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    // Vehicle type filter
    if (filters.vehicleType) {
      filtered = filtered.filter(job => job.vehicleType === filters.vehicleType);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(job => job.priority === filters.priority);
    }

    // Critical filter
    if (filters.isCritical) {
      filtered = filtered.filter(job => job.isCritical === true);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, filters, jobCards]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const submit = async e => {
    e.preventDefault();

    // Validate phone number
    if (!validatePhone(form.customerPhone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      await API.post("/jobcards", form);
      toast.success("✅ Job Card Created Successfully!");
      setForm({
        customerName: "",
        customerPhone: "",
        vehicleType: "",
        vehicleModel: "",
        vehicleNumber: "",
        complaint: "",
        technician: ""
      });
      loadData();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to create job card";
      toast.error(errorMsg);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "NEW": return "#3498db";
      case "IN_PROGRESS": return "#f39c12";
      case "DONE": return "#27ae60";
      default: return "#95a5a6";
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      LOW: "#95a5a6",
      MEDIUM: "#3498db",
      HIGH: "#f39c12",
      URGENT: "#e74c3c"
    };
    return colors[priority] || colors.MEDIUM;
  };

  if (loading) {
    return (
      <div className="advisor-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="advisor-container">
      <div className="dashboard-header">
        <h1>🎯 Service Advisor Dashboard</h1>
        <p className="subtitle">Create and track job cards</p>
      </div>

      <div className="advisor-content">
        {/* Create Job Card Form */}
        <div className="form-card">
          <h2>📝 Create New Job Card</h2>
          <form onSubmit={submit} className="job-form">
            <div className="form-row">
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  name="customerName"
                  placeholder="Enter customer name"
                  value={form.customerName}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Customer Phone *</label>
                <input
                  name="customerPhone"
                  placeholder="10-digit phone number"
                  value={form.customerPhone}
                  onChange={handleChange}
                  required
                  className="input-field"
                  type="tel"
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vehicle Type *</label>
                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="2-wheeler">🏍️ 2 Wheeler</option>
                  <option value="4-wheeler">🚗 4 Wheeler</option>
                </select>
              </div>

              <div className="form-group">
                <label>Vehicle Model *</label>
                <input
                  name="vehicleModel"
                  placeholder="e.g., Honda Activa, Maruti Swift"
                  value={form.vehicleModel}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Vehicle Number *</label>
                <input
                  name="vehicleNumber"
                  placeholder="e.g., MH-01-AB-1234"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  required
                  className="input-field"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label>Assign Technician *</label>
                <select
                  name="technician"
                  value={form.technician}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Technician</option>
                  {technicians.map(t => (
                    <option key={t._id} value={t._id}>
                      👨‍🔧 {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Complaint / Issue</label>
              <textarea
                name="complaint"
                placeholder="Describe the issue or service required"
                value={form.complaint}
                onChange={handleChange}
                className="input-field textarea"
                rows="3"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-large">
              ✅ Create Job Card
            </button>
          </form>
        </div>

        {/* Job Cards List with Search & Filter */}
        <div className="jobs-list-card">
          <div className="jobs-list-header">
            <h2>📋 Job Cards ({filteredJobs.length})</h2>
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
              placeholder="Search by customer, vehicle number, or model..."
            />
            {showFilters && (
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            )}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <p>No job cards found</p>
              {(searchTerm || Object.values(filters).some(v => v)) && (
                <button className="btn btn-secondary" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="jobs-list">
              {filteredJobs.map(job => (
                <div key={job._id} className="job-item">
                  <div className="job-item-header">
                    <div>
                      <h4>{job.customerName}</h4>
                      <p className="vehicle-info">
                        {job.vehicleModel} • {job.vehicleNumber}
                      </p>
                    </div>
                    <div className="badges">
                      {job.isCritical && (
                        <span className="critical-badge">🚨 CRITICAL</span>
                      )}
                      <span
                        className="status-badge"
                        style={{ background: getStatusColor(job.status) }}
                      >
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <div className="job-item-details">
                    <p><strong>Technician:</strong> {job.technician?.name || "Not assigned"}</p>
                    <p><strong>Type:</strong> {job.vehicleType}</p>
                    {job.priority && (
                      <p>
                        <strong>Priority:</strong>{" "}
                        <span
                          className="priority-badge"
                          style={{ background: getPriorityBadge(job.priority) }}
                        >
                          {job.priority}
                        </span>
                      </p>
                    )}
                    {job.complaint && (
                      <p><strong>Issue:</strong> {job.complaint}</p>
                    )}
                    <p className="job-date">
                      Created: {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorDashboard;
