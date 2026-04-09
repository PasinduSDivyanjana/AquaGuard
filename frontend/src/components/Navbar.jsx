import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { Bell, Search, UserCircle2, FileText, AlertTriangle, Droplet, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const matched = [];
      const q = query.toLowerCase();

      try {
        // Search tasks
        const tasksRes = await axios.get("/api/tasks").catch(() => ({ data: [] }));
        (tasksRes.data || []).forEach((t) => {
          if (
            t.title?.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q)
          ) {
            matched.push({
              type: "task",
              icon: FileText,
              label: t.title,
              sub: `${t.status} · ${t.priority} priority`,
              path: "/tasks",
            });
          }
        });

        // Search alerts
        const alertsRes = await axios.get("/api/alerts").catch(() => ({ data: [] }));
        (alertsRes.data || []).forEach((a) => {
          if (
            a.type?.toLowerCase().includes(q) ||
            a.message?.toLowerCase().includes(q)
          ) {
            matched.push({
              type: "alert",
              icon: AlertTriangle,
              label: a.type || "System Alert",
              sub: a.message?.substring(0, 60) + "...",
              path: "/alerts",
            });
          }
        });

        // Search wells
        const wellsRes = await axios.get("/api/environment/wells").catch(() => ({ data: [] }));
        (wellsRes.data || []).forEach((w) => {
          if (w.name?.toLowerCase().includes(q)) {
            matched.push({
              type: "well",
              icon: Droplet,
              label: w.name,
              sub: `Lat: ${w.location?.lat?.toFixed(3)}, Lng: ${w.location?.lng?.toFixed(3)}`,
              path: "/wells",
            });
          }
        });
      } catch (e) {}

      setResults(matched.slice(0, 8));
      setShowResults(true);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result) => {
    navigate(result.path);
    setQuery("");
    setShowResults(false);
  };

  const typeColors = {
    task: "text-blue-400",
    alert: "text-red-400",
    well: "text-aqua",
  };

  return (
    <div className="h-20 border-b border-dark-border bg-dark-card/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="relative w-96" ref={searchRef}>
        <div className="flex items-center bg-dark-bg border border-dark-border rounded-full px-4 py-2 shadow-inner focus-within:border-aqua/50 transition-colors">
          <Search className="h-5 w-5 text-gray-500 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setShowResults(true)}
            placeholder="Search wells, tasks, alerts..."
            className="bg-transparent border-none outline-none text-gray-200 w-full placeholder-gray-500"
          />
          {query && (
            <button onClick={() => { setQuery(""); setShowResults(false); }} className="text-gray-500 hover:text-gray-300 ml-2">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
            {searching ? (
              <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-aqua border-t-transparent rounded-full"></div>
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No results found for "{query}"
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(r)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-bg/60 transition-colors text-left border-b border-dark-border/50 last:border-0"
                  >
                    <div className={`p-2 rounded-lg bg-dark-bg ${typeColors[r.type]}`}>
                      <r.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{r.label}</p>
                      <p className="text-xs text-gray-500 truncate">{r.sub}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-600 font-medium shrink-0">{r.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-6">
        <button onClick={() => navigate('/alerts')} className="relative p-2 text-gray-400 hover:text-aqua transition-colors rounded-full hover:bg-dark-border">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 border-2 border-dark-card rounded-full animate-pulse shadow-[0_0_10px_red]"></span>
        </button>

        <div className="flex items-center space-x-3 border-l border-dark-border pl-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-200">{user?.name || "Guest"}</p>
            <p className="text-xs text-aqua uppercase tracking-wide">{user?.role || "Visitor"}</p>
          </div>
          <UserCircle2 className="h-10 w-10 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
