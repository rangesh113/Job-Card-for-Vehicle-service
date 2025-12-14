import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import API from "../api/api";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider");
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Load initial notifications
        loadNotifications();

        // Setup Socket.IO connection only if enabled (for local development)
        // In production on Netlify, Socket.IO won't work with serverless functions
        const socketEnabled = process.env.REACT_APP_SOCKET_ENABLED === 'true';
        const userId = localStorage.getItem("userId");

        if (socketEnabled && userId) {
            const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
            const newSocket = io(socketUrl);

            newSocket.on("connect", () => {
                console.log("Socket connected");
                newSocket.emit("join", userId);
            });

            newSocket.on("notification", (notification) => {
                console.log("New notification:", notification);

                // Add to notifications list
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show toast notification
                const priority = notification.priority || "MEDIUM";
                const toastType = priority === "URGENT" ? toast.error :
                    priority === "HIGH" ? toast.warning : toast.info;

                toastType(notification.title, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await API.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.put("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await API.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            const notification = notifications.find(n => n._id === notificationId);
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
