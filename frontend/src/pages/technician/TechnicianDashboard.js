import { useEffect, useState } from "react";
import API from "../../api/api";
import Timeline from "../../components/Timeline";
import { toast } from "react-toastify";
import "./TechnicianDashboard.css";

const TechnicianDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showCriticalModal, setShowCriticalModal] = useState(false);
  const [summary, setSummary] = useState({
    serviceNotes: "",
    recommendations: ""
  });
  const [criticalData, setCriticalData] = useState({
    reason: "",
    priority: "URGENT"
  });

  const loadJobs = async () => {
    try {
      const res = await API.get("/jobcards/my");
      setJobs(res.data);
    } catch (err) {
      toast.error("Failed to load jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const updateStatus = async (id, status) => {
    const statusText = status === "IN_PROGRESS" ? "start work on" : "complete";
    const confirmed = window.confirm(`Are you sure you want to ${statusText} this job?`);
    if (!confirmed) return;

    try {
      await API.put(`/jobcards/${id}/status`, { status });
      toast.success(`✅ Job ${status === "DONE" ? "completed" : "started"}!`);
      loadJobs();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update status";
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const openSummaryModal = (job) => {
    setSelectedJob(job);
    setSummary({
      serviceNotes: job.serviceNotes || "",
      recommendations: job.recommendations || ""
    });
    setShowModal(true);
  };

  const openTimelineModal = (job) => {
    setSelectedJob(job);
    setShowTimelineModal(true);
  };

  const openCriticalModal = (job) => {
    setSelectedJob(job);
    setCriticalData({
      reason: "",
      priority: "URGENT"
    });
    setShowCriticalModal(true);
  };

  const saveSummary = async () => {
    if (!summary.serviceNotes.trim()) {
      toast.error("Please enter service notes");
      return;
    }

    try {
      await API.put(`/jobcards/${selectedJob._id}/summary`, summary);
      toast.success("✅ Service summary saved!");
      setShowModal(false);
      loadJobs();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save summary";
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const markAsCritical = async () => {
    if (!criticalData.reason.trim()) {
      toast.error("Please provide a reason for marking as critical");
      return;
    }

    const confirmed = window.confirm(
      "This will send an URGENT notification to the Service Advisor. Continue?"
    );
    if (!confirmed) return;

    try {
      await API.put(`/jobcards/${selectedJob._id}/critical`, {
        isCritical: true,
        criticalReason: criticalData.reason,
        priority: criticalData.priority
      });
      toast.success("🚨 Job marked as CRITICAL! Advisor notified.");
      setShowCriticalModal(false);
      loadJobs();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to mark as critical";
      toast.error(errorMsg);
      console.error(err);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "NEW":
        return { color: "#3498db", icon: "🆕", text: "New" };
      case "IN_PROGRESS":
        return { color: "#f39c12", icon: "⚙️", text: "In Progress" };
      case "DONE":
        return { color: "#27ae60", icon: "✅", text: "Completed" };
      default:
        return { color: "#95a5a6", icon: "❓", text: status };
    }
  };

  if (loading) {
    return (
      <div className="technician-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="technician-container">
      <div className="dashboard-header">
        <h1>🔧 Technician Dashboard</h1>
        <p className="subtitle">Manage your assigned jobs</p>
      </div>

      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{jobs.length}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <h3>{jobs.filter(j => j.status === "IN_PROGRESS").length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{jobs.filter(j => j.status === "DONE").length}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card critical">
          <div className="stat-icon">🚨</div>
          <div className="stat-info">
            <h3>{jobs.filter(j => j.isCritical).length}</h3>
            <p>Critical</p>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <h3>No Jobs Assigned</h3>
          <p>You don't have any assigned jobs at the moment</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => {
            const statusInfo = getStatusInfo(job.status);
            return (
              <div key={job._id} className={`job-card ${job.isCritical ? 'critical-job' : ''}`}>
                <div className="job-card-header">
                  <div>
                    <h3>{job.customerName}</h3>
                    <p className="vehicle-number">{job.vehicleNumber}</p>
                  </div>
                  <div className="badges">
                    {job.isCritical && (
                      <span className="critical-badge">🚨 CRITICAL</span>
                    )}
                    <span
                      className="status-badge"
                      style={{ background: statusInfo.color }}
                    >
                      {statusInfo.icon} {statusInfo.text}
                    </span>
                  </div>
                </div>

                <div className="job-card-body">
                  <div className="info-row">
                    <span className="label">Vehicle:</span>
                    <span className="value">{job.vehicleModel} ({job.vehicleType})</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{job.customerPhone}</span>
                  </div>
                  {job.priority && (
                    <div className="info-row">
                      <span className="label">Priority:</span>
                      <span className={`priority-badge priority-${job.priority.toLowerCase()}`}>
                        {job.priority}
                      </span>
                    </div>
                  )}
                  {job.complaint && (
                    <div className="info-row complaint">
                      <span className="label">Issue:</span>
                      <span className="value">{job.complaint}</span>
                    </div>
                  )}
                  {job.serviceNotes && (
                    <div className="service-summary">
                      <strong>Service Notes:</strong>
                      <p>{job.serviceNotes}</p>
                    </div>
                  )}
                  {job.recommendations && (
                    <div className="service-summary">
                      <strong>Recommendations:</strong>
                      <p>{job.recommendations}</p>
                    </div>
                  )}
                </div>

                <div className="job-card-actions">
                  {job.statusHistory && job.statusHistory.length > 0 && (
                    <button
                      className="btn btn-timeline"
                      onClick={() => openTimelineModal(job)}
                    >
                      📅 View Timeline
                    </button>
                  )}

                  {job.status !== "DONE" && !job.isCritical && (
                    <button
                      className="btn btn-critical"
                      onClick={() => openCriticalModal(job)}
                    >
                      🚨 Mark Critical
                    </button>
                  )}

                  {job.status === "NEW" && (
                    <button
                      className="btn btn-start"
                      onClick={() => updateStatus(job._id, "IN_PROGRESS")}
                    >
                      ▶️ Start Work
                    </button>
                  )}

                  {job.status === "IN_PROGRESS" && (
                    <>
                      <button
                        className="btn btn-summary"
                        onClick={() => openSummaryModal(job)}
                      >
                        📝 Add Summary
                      </button>
                      <button
                        className="btn btn-complete"
                        onClick={() => updateStatus(job._id, "DONE")}
                      >
                        ✅ Complete
                      </button>
                    </>
                  )}

                  {job.status === "DONE" && (
                    <div className="completed-badge">
                      ✅ Job Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Add Service Summary</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="job-info-summary">
                <p><strong>Customer:</strong> {selectedJob?.customerName}</p>
                <p><strong>Vehicle:</strong> {selectedJob?.vehicleModel} - {selectedJob?.vehicleNumber}</p>
              </div>

              <div className="form-group">
                <label>Service Notes *</label>
                <textarea
                  placeholder="Describe the work performed, parts replaced, etc."
                  value={summary.serviceNotes}
                  onChange={(e) => setSummary({ ...summary, serviceNotes: e.target.value })}
                  className="input-field"
                  rows="5"
                />
              </div>

              <div className="form-group">
                <label>Recommendations</label>
                <textarea
                  placeholder="Suggest preventive maintenance or future services"
                  value={summary.recommendations}
                  onChange={(e) => setSummary({ ...summary, recommendations: e.target.value })}
                  className="input-field"
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={saveSummary}>
                💾 Save Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && (
        <div className="modal-overlay" onClick={() => setShowTimelineModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Job Timeline</h2>
              <button className="modal-close" onClick={() => setShowTimelineModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="job-info-summary">
                <p><strong>Customer:</strong> {selectedJob?.customerName}</p>
                <p><strong>Vehicle:</strong> {selectedJob?.vehicleModel} - {selectedJob?.vehicleNumber}</p>
              </div>

              <Timeline statusHistory={selectedJob?.statusHistory || []} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setShowTimelineModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Critical Modal */}
      {showCriticalModal && (
        <div className="modal-overlay" onClick={() => setShowCriticalModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header critical-header">
              <h2>🚨 Mark as Critical</h2>
              <button className="modal-close" onClick={() => setShowCriticalModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="job-info-summary">
                <p><strong>Customer:</strong> {selectedJob?.customerName}</p>
                <p><strong>Vehicle:</strong> {selectedJob?.vehicleModel} - {selectedJob?.vehicleNumber}</p>
              </div>

              <div className="form-group">
                <label>Reason for Critical Status *</label>
                <textarea
                  placeholder="Explain why this job requires immediate attention..."
                  value={criticalData.reason}
                  onChange={(e) => setCriticalData({ ...criticalData, reason: e.target.value })}
                  className="input-field"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Priority Level</label>
                <select
                  value={criticalData.priority}
                  onChange={(e) => setCriticalData({ ...criticalData, priority: e.target.value })}
                  className="input-field"
                >
                  <option value="URGENT">🔴 URGENT</option>
                  <option value="HIGH">🟠 HIGH</option>
                  <option value="MEDIUM">🟡 MEDIUM</option>
                </select>
              </div>

              <div className="warning-box">
                ⚠️ This will send an immediate notification to the Service Advisor
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setShowCriticalModal(false)}>
                Cancel
              </button>
              <button className="btn btn-critical-confirm" onClick={markAsCritical}>
                🚨 Mark as Critical
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
