import React from "react";
import "./Timeline.css";

const Timeline = ({ statusHistory }) => {
    if (!statusHistory || statusHistory.length === 0) {
        return (
            <div className="timeline-empty">
                <p>No status history available</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "NEW": return "#3498db";
            case "IN_PROGRESS": return "#f39c12";
            case "DONE": return "#27ae60";
            default: return "#95a5a6";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "NEW": return "🆕";
            case "IN_PROGRESS": return "⚙️";
            case "DONE": return "✅";
            default: return "📌";
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="timeline-container">
            <h4 className="timeline-title">📊 Progress Timeline</h4>
            <div className="timeline">
                {statusHistory.map((item, index) => (
                    <div key={index} className="timeline-item">
                        <div
                            className="timeline-marker"
                            style={{ background: getStatusColor(item.status) }}
                        >
                            <span className="timeline-icon">{getStatusIcon(item.status)}</span>
                        </div>
                        <div className="timeline-content">
                            <div className="timeline-status" style={{ color: getStatusColor(item.status) }}>
                                {item.status.replace("_", " ")}
                            </div>
                            <div className="timeline-user">
                                By: {item.changedBy?.name || "System"}
                            </div>
                            {item.notes && (
                                <div className="timeline-notes">{item.notes}</div>
                            )}
                            <div className="timeline-date">{formatDate(item.changedAt)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
