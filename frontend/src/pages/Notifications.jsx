import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

const TYPE_ICONS = {
  EXAM: '📅', ADMIT_CARD: '📄', RESULT: '🏆', REMINDER: '🔔', SYSTEM: 'ℹ️',
};

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAllRead}
            className="text-sm text-primary-600 font-semibold hover:underline">
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <span className="text-4xl mb-4 block">🔔</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
          <p className="text-gray-500">Reminders for your exams and admit cards will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                n.isRead ? 'border-gray-200' : 'border-primary-200 bg-primary-50/30'
              }`}>
              <span className="text-xl mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-semibold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h3>
                  {!n.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <button onClick={() => handleMarkRead(n.id)}
                  className="text-xs text-primary-600 font-medium hover:underline flex-shrink-0 mt-1">
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
