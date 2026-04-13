import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const STATUS_COLORS = {
  Good: "#4BDA7F",
  "Needs Repair": "#F5BD27",
  Contaminated: "#CA6162",
  Dry: "#E54545",
};

// Fix default marker icon in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createWellIcon(status, isSelected) {
  const color = STATUS_COLORS[status] || "#979BA3";
  const size = isSelected ? 18 : 12;
  const border = isSelected ? "3px solid #FFFFFF" : "2px solid rgba(255,255,255,0.6)";
  const shadow = isSelected ? `0 0 12px ${color}` : "0 2px 6px rgba(0,0,0,0.4)";
  return L.divIcon({
    className: "custom-well-marker",
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:${border};border-radius:50%;box-shadow:${shadow};"></div>`,
    iconSize: [size + 6, size + 6],
    iconAnchor: [(size + 6) / 2, (size + 6) / 2],
  });
}

function FitBounds({ wells }) {
  const map = useMap();
  useEffect(() => {
    if (wells.length > 0) {
      const bounds = L.latLngBounds(wells.map((w) => [w.location.lat, w.location.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [wells, map]);
  return null;
}

export default function WellMap({ selectedWellId, onSelectWell }) {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadWells(); }, []);

  const loadWells = async () => {
    setLoading(true);
    setError(null);
    try {
      // /api/map is a public endpoint that returns all wells with name, location, status
      const res = await fetch("http://localhost:5001/api/map");
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();

      // Response shape: { success: true, data: [ { _id, name, location, status } ] }
      const list = Array.isArray(json.data) ? json.data : [];
      setWells(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-7 h-7 border-2 border-[#F5BD27] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#9BA0A6]">Loading wells…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <p className="text-[#CA6162] text-sm">⚠ {error}</p>
        <button
          type="button"
          onClick={loadWells}
          className="px-4 py-2 text-xs bg-[#172431] text-[#F5BD27] border border-[#F5BD27]/30 rounded-lg hover:bg-[#1a2a3a] transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ── No data ── */
  if (wells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
        <p className="text-[#9BA0A6] text-sm">No wells found in the database.</p>
        <button type="button" onClick={loadWells} className="text-xs text-[#F5BD27] hover:underline mt-1">
          Retry
        </button>
      </div>
    );
  }

  const center = [wells[0].location.lat, wells[0].location.lng];
  const selectedWell = wells.find((w) => w._id === selectedWellId);

  return (
    <div className="space-y-3">
      {/* Map */}
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "340px", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds wells={wells} />

        {wells.map((well) => (
          <Marker
            key={well._id}
            position={[well.location.lat, well.location.lng]}
            icon={createWellIcon(well.status, well._id === selectedWellId)}
            eventHandlers={{ click: () => onSelectWell(well) }}
          >
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif", minWidth: "150px" }}>
                <strong style={{ fontSize: "0.9rem" }}>{well.name}</strong>
                <br />
                <span style={{ fontSize: "0.75rem", color: STATUS_COLORS[well.status] || "#9BA0A6" }}>
                  ● {well.status}
                </span>
                <br />
                <span style={{ fontSize: "0.7rem", color: "#666" }}>
                  {well.location.lat.toFixed(5)}, {well.location.lng.toFixed(5)}
                </span>
                <br />
                <button
                  onClick={() => onSelectWell(well)}
                  style={{
                    marginTop: "8px", width: "100%", padding: "5px 0",
                    background: "rgba(245,189,39,0.15)",
                    border: "1px solid rgba(245,189,39,0.4)",
                    borderRadius: "6px", color: "#F5BD27",
                    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Select this well
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {status}
          </span>
        ))}
        <span className="ml-auto text-xs text-[#6B7280]">
          {wells.length} well{wells.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Selected well badge */}
      {selectedWell ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#4BDA7F]/10 border border-[#4BDA7F]/30 rounded-xl">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: STATUS_COLORS[selectedWell.status] || "#9BA0A6" }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#4BDA7F] truncate">{selectedWell.name}</p>
            <p className="text-xs text-[#6B7280] font-mono">
              {selectedWell.location.lat.toFixed(5)}, {selectedWell.location.lng.toFixed(5)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectWell(null)}
            className="text-xs text-[#9BA0A6] hover:text-[#CA6162] px-2 py-1 rounded-lg hover:bg-[#CA6162]/10 transition-all"
          >
            ✕ Clear
          </button>
        </div>
      ) : (
        <p className="text-xs text-[#6B7280] px-1">
          🗺 Click a marker on the map to select a well
        </p>
      )}
    </div>
  );
}
