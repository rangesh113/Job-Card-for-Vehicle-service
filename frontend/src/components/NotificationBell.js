import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import "./NotificationBell.css";

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }

        // Navigate to job card if applicable
        if (notification.jobCardId) {
            setShowDropdown(false);
            // You can navigate to a job details page if you have one
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "URGENT": return "#e74c3c";
            case "HIGH": return "#f39c12";
            case "MEDIUM": return "#3498db";
            case "LOW": return "#95a5a6";
            default: return "#3498db";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "CRITICAL_ISSUE": return "🚨";
            case "STATUS_CHANGE": return "🔄";
            case "NEW_JOB": return "📋";
            case "BILL_CREATED": return "💰";
            default: return "🔔";
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifDate.toLocaleDateString();
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button
                className="notification-bell-button"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-read" onClick={markAllAsRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <span className="no-notif-icon">🔕</span>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${!notification.read ? "unread" : ""}`}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{ borderLeftColor: getPriorityColor(notification.priority) }}
                                >
                                    <div className="notification-icon">
                                        {getTypeIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-title">{notification.title}</div>
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-time">{formatTime(notification.createdAt)}</div>
                                    </div>
                                    <button
                                        className="notification-delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification._id);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 10 && (
                        <div className="notification-footer">
                            <button onClick={() => setShowDropdown(false)}>
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
