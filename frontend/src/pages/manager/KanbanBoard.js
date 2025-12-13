import { useEffect, useState } from "react";
import API from "../../api/api";

const statuses = ["NEW", "IN_PROGRESS", "DONE"];

const KanbanBoard = () => {
  const [jobs, setJobs] = useState([]);

  const loadJobs = async () => {
    const res = await API.get("/manager/jobs");
    setJobs(res.data);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const updateStatus = async (id, status) => {
    await API.put(`/jobcards/${id}/status`, { status });
    loadJobs();
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {statuses.map(status => (
        <div
          key={status}
          style={{
            width: "30%",
            background: "#f4f4f4",
            padding: "10px",
            borderRadius: "5px"
          }}
        >
          <h3>{status}</h3>

          {jobs
            .filter(job => job.status === status)
            .map(job => (
              <div
                key={job._id}
                style={{
                  background: "#fff",
                  margin: "10px 0",
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0 0 5px rgba(0,0,0,0.1)"
                }}
              >
                <strong>{job.vehicleNumber}</strong>
                <p>{job.customerName}</p>

                {statuses
                  .filter(s => s !== status)
                  .map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(job._id, s)}
                      style={{ marginRight: "5px" }}
                    >
                      Move to {s}
                    </button>
                  ))}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
