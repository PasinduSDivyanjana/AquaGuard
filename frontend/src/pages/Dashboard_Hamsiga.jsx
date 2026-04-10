import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import {
  AlertTriangle,
  Activity,
  CheckSquare,
  Droplet,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    tasks: 0,
    alerts: 0,
    autoTasks: 0,
  });
  const [tasksByStatus, setTasksByStatus] = useState({
    pending: 0,
    "in-progress": 0,
    completed: 0,
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let tasksCount = 0;
    let alertsCount = 0;
    let autoTasksCount = 0;

    const fetchDashboardData = async () => {
      let allTasks = [];
      let allAlerts = [];

      try {
        const tasksRes = await axios
          .get("/api/tasks")
          .catch(() => ({ data: [] }));
        allTasks = tasksRes.data || [];
        tasksCount = allTasks.length;
      } catch (e) {}

      try {
        const alertsRes = await axios
          .get("/api/alerts")
          .catch(() => ({ data: [] }));
        allAlerts = alertsRes.data || [];
        alertsCount = allAlerts.filter((a) => !a.read)?.length || 0;
      } catch (e) {}

      try {
        const autoTasksRes = await axios
          .get("/api/tasks/auto")
          .catch(() => ({ data: [] }));
        autoTasksCount =
          autoTasksRes.data?.filter((a) => a.status === "pending")?.length || 0;
      } catch (e) {}

      setStats({
        tasks: tasksCount,
        alerts: alertsCount,
        autoTasks: autoTasksCount,
      });

      // Task status distribution
      const statusCounts = { pending: 0, "in-progress": 0, completed: 0 };
      allTasks.forEach((t) => {
        if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
      });
      setTasksByStatus(statusCounts);

      // Weekly activity — tasks + alerts created per day over the last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);

        const taskCount = allTasks.filter((t) => {
          const created = new Date(t.createdAt);
          return created >= d && created < nextD;
        }).length;

        const alertCount = allAlerts.filter((a) => {
          const created = new Date(a.createdAt);
          return created >= d && created < nextD;
        }).length;

        days.push({
          label: d.toLocaleDateString("en-US", { weekday: "short" }),
          tasks: taskCount,
          alerts: alertCount,
          total: taskCount + alertCount,
        });
      }
      setWeeklyData(days);

      setLoading(false);
    };

    if (user?.role === "admin" || user?.role === "officer") {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const cards = [
    {
      title: "Active Tasks",
      value: stats.tasks,
      icon: CheckSquare,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      roles: ["admin", "officer"],
    },
    {
      title: "Unread Alerts",
      value: stats.alerts,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-400/10",
      roles: ["admin", "officer"],
    },
    {
      title: "Pending Auto-Tasks",
      value: stats.autoTasks,
      icon: Activity,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      roles: ["admin"],
    },
  ];

  const maxWeekly = Math.max(...weeklyData.map((d) => d.total), 1);

  const statusTotal =
    tasksByStatus.pending +
    tasksByStatus["in-progress"] +
    tasksByStatus.completed;
  const statusItems = [
    {
      label: "Pending",
      count: tasksByStatus.pending,
      color: "bg-gray-400",
      textColor: "text-gray-400",
    },
    {
      label: "In Progress",
      count: tasksByStatus["in-progress"],
      color: "bg-amber-400",
      textColor: "text-amber-400",
    },
    {
      label: "Completed",
      count: tasksByStatus.completed,
      color: "bg-green-400",
      textColor: "text-green-400",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Status Overview for AquaGuard Systems
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm px-4 py-2 glass rounded-full text-aqua">
          <Droplet className="h-4 w-4" />
          <span>System Normal</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards
            .filter((card) => card.roles.includes(user?.role))
            .map((card, idx) => (
              <div
                key={idx}
                className="glass p-6 rounded-2xl flex items-center justify-between hover:shadow-[0_0_15px_rgba(0,247,255,0.1)] transition-all"
              >
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    {card.title}
                  </p>
                  <h3 className="text-4xl font-bold text-gray-100">
                    {card.value}
                  </h3>
                </div>
                <div className={`p-4 rounded-xl ${card.bg}`}>
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                </div>
              </div>
            ))}
          {user?.role === "public" && (
            <div className="col-span-3 glass p-10 rounded-2xl text-center">
              <Droplet className="h-16 w-16 text-aqua mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2 text-gray-200">
                Welcome to AquaGuard
              </h2>
              <p className="text-gray-400">
                You are logged in as a public user. View wells and weather data
                from the sidebar.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Charts */}
      {(user?.role === "admin" || user?.role === "officer") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Weekly Activity Bar Chart */}
          <div className="glass p-6 rounded-2xl h-80 flex flex-col border border-dark-border relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-aqua/5 to-transparent pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-aqua" />
                Weekly Activity
              </h3>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-aqua/70 rounded-sm inline-block"></span>{" "}
                  Tasks
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-red-400/70 rounded-sm inline-block"></span>{" "}
                  Alerts
                </span>
              </div>
            </div>
            <div className="flex-1 flex items-end gap-4 px-1 pb-6 relative z-10">
              {weeklyData.map((day, i) => {
                const taskH =
                  maxWeekly > 0
                    ? Math.max(
                        (day.tasks / maxWeekly) * 100,
                        day.tasks > 0 ? 15 : 0
                      )
                    : 0;
                const alertH =
                  maxWeekly > 0
                    ? Math.max(
                        (day.alerts / maxWeekly) * 100,
                        day.alerts > 0 ? 15 : 0
                      )
                    : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    {/* Count labels */}
                    <div className="flex gap-1 mb-1 text-[10px] font-bold">
                      {day.tasks > 0 && (
                        <span className="text-aqua">{day.tasks}</span>
                      )}
                      {day.alerts > 0 && (
                        <span className="text-red-400">{day.alerts}</span>
                      )}
                    </div>
                    {/* Side-by-side bars */}
                    <div
                      className="w-full flex gap-1 items-end"
                      style={{ height: "180px" }}
                    >
                      <div
                        className="flex-1 bg-gradient-to-t from-aqua to-aqua/30 rounded-t-md transition-all duration-500 hover:from-aqua hover:to-aqua/60 hover:shadow-[0_0_12px_rgba(0,247,255,0.4)]"
                        style={{
                          height: `${taskH}%`,
                          minHeight: day.tasks > 0 ? "12px" : "3px",
                          opacity: day.tasks > 0 ? 1 : 0.15,
                        }}
                      ></div>
                      <div
                        className="flex-1 bg-gradient-to-t from-red-400 to-red-400/30 rounded-t-md transition-all duration-500 hover:from-red-400 hover:to-red-400/60 hover:shadow-[0_0_12px_rgba(248,113,113,0.4)]"
                        style={{
                          height: `${alertH}%`,
                          minHeight: day.alerts > 0 ? "12px" : "3px",
                          opacity: day.alerts > 0 ? 1 : 0.15,
                        }}
                      ></div>
                    </div>
                    {/* Day label */}
                    <span className="text-[11px] text-gray-400 mt-2 font-semibold tracking-wide">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Status Distribution + Quick Actions */}
          <div className="glass p-6 rounded-2xl h-80 flex flex-col border border-dark-border">
            <h3 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
              <Clock className="w-5 h-5 text-aqua" />
              Task Status Distribution
            </h3>

            {statusTotal === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                No tasks yet
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center gap-4">
                {/* Progress Bar */}
                <div className="w-full h-4 rounded-full bg-dark-bg/60 overflow-hidden flex">
                  {statusItems.map(
                    (s, i) =>
                      s.count > 0 && (
                        <div
                          key={i}
                          className={`${s.color} h-full transition-all duration-500`}
                          style={{ width: `${(s.count / statusTotal) * 100}%` }}
                          title={`${s.label}: ${s.count}`}
                        ></div>
                      )
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3 mt-2">
                  {statusItems.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${s.color}`}
                        ></span>
                        <span className={`text-sm ${s.textColor}`}>
                          {s.label}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-200">
                        {s.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex gap-3 mt-auto pt-4 border-t border-dark-border">
              <button
                onClick={() => navigate("/tasks")}
                className="flex-1 glass-button rounded-xl flex items-center justify-center gap-2 py-2.5 text-sm"
              >
                <CheckSquare className="h-4 w-4 text-aqua" />
                Manage Tasks
              </button>
              <button
                onClick={() => navigate("/alerts")}
                className="flex-1 bg-dark-bg/50 hover:bg-dark-border border border-dark-border text-gray-300 transition-colors rounded-xl flex items-center justify-center gap-2 py-2.5 text-sm"
              >
                <AlertTriangle className="h-4 w-4" />
                System Alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
