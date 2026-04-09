import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Check, ShieldAlert, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export const AlertsManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/alerts');
      setAlerts(res.data);
    } catch (err) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/alerts/${id}/read`);
      fetchAlerts();
    } catch (err) {
      toast.error('Failed to mark alert as read');
    }
  };

  const severityColor = (sev) => {
    switch (sev) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/50';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/50';
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-aqua border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center glass p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center mb-1">
            <ShieldAlert className="w-6 h-6 mr-3 text-red-400" />
            Alerts Center
          </h1>
          <p className="text-gray-400 text-sm">System generated alerts from environment monitoring</p>
        </div>
      </div>

      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center flex flex-col items-center">
            <Check className="w-16 h-16 text-green-400 mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-gray-200">No active alerts</h3>
            <p className="text-gray-500 mt-2">All systems are operating within normal parameters.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`glass p-5 rounded-2xl transition-all relative overflow-hidden ${
                !alert.read
                  ? 'border-l-4 border-l-aqua bg-dark-bg/80 border border-aqua/30 shadow-[0_0_20px_rgba(0,247,255,0.15)]'
                  : 'opacity-60 border border-dark-border/30'
              }`}
            >
              {!alert.read && <div className="absolute top-0 right-0 w-32 h-32 bg-aqua/10 blur-3xl rounded-full pointer-events-none"></div>}
              <div className="flex items-start space-x-5 relative z-10">
                <div className={`p-3 rounded-full border ${severityColor(alert.severity)}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-100">
                      {alert.type || 'System Alert'}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest rounded bg-dark-bg border ${severityColor(alert.severity).split(' ')[0]} border-current`}>
                      {alert.severity || 'Normal'}
                    </span>
                    {!alert.read && <span className="w-2 h-2 ml-1 rounded-full bg-aqua animate-pulse shadow-[0_0_5px_rgba(0,247,255,1)]"></span>}
                  </div>
                  <p className="text-gray-400">{alert.message}</p>
                  <p className="text-xs text-gray-600 mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {!alert.read && (
                <button
                  onClick={() => markAsRead(alert._id)}
                  className="relative z-10 ml-auto shrink-0 text-gray-400 hover:text-aqua border border-dark-border hover:border-aqua/50 bg-dark-bg/60 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
