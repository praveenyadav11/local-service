import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);

  const loadNotifications = useCallback(() => {
    api
      .get("/notifications", { params: { limit: 10 } })
      .then((res) => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadNotifications();

    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    socket.on("notification:new", (n) => {
      setNotifications((prev) =>
        [{ _id: n.id, ...n, isRead: false }, ...prev].slice(0, 10),
      );
      setUnreadCount((c) => c + 1);
    });

    const bump = (name) => (payload) =>
      setLastEvent({ name, payload, at: Date.now() });
    socket.on("booking:created", bump("booking:created"));
    socket.on("booking:status", bump("booking:status"));

    return () => socket.disconnect();
  }, [user, loadNotifications]);

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider
      value={{ notifications, unreadCount, markAllRead, lastEvent }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
