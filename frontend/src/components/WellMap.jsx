import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchWells } from "../api/wellApi";

// Fix default marker icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const STATUS_COLORS = {
  Good: "#4BDA7F",
  "Needs Repair": "#F5BD27",
  Contaminated: "#CA6162",
  Dry: "#E54545",
};

function createWellIcon(status, isSelected) {
  const color = STATUS_COLORS[status] || "#979BA3";
  const size = isSelected ? 18 : 12;
  const border = isSelected ? "3px solid #FFFFFF" : "2px solid rgba(255,255,255,0.6)";
  const shadow = isSelected ? `0 0 12px ${color}` : "0 2px 6px rgba(0,0,0,0.4)";

  return L.divIcon({
    className: "custom-well-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: ${border};
      border-radius: 50%;
      box-shadow: ${shadow};
    "></div>`,
    iconSize: [size + 6, size + 6],
    iconAnchor: [(size + 6) / 2, (size + 6) / 2],
  });
}

// Auto-fit map to markers
function FitBounds({ wells }) {
  const map = useMap();
  useEffect(() => {
    if (wells.length > 0) {
      const bounds = L.latLngBounds(
        wells.map((w) => [w.location.lat, w.location.lng])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [wells, map]);
  return null;
}

export default function WellMap({ selectedWellId, onSelectWell }) {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWells();
  }, []);

  const loadWells = async () => {
    try {
      const res = await fetchWells();
      setWells(res.data || []);
    } catch (err) {
      console.error("Failed to load wells:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (wells.length === 0) {
    return (
      <div className="map-empty">
        <p>No wells found in the database.</p>
      </div>
    );
  }

  const center = wells[0]
    ? [wells[0].location.lat, wells[0].location.lng]
    : [7.8731, 80.7718]; // Sri Lanka center fallback

  const selectedWell = wells.find((w) => w._id === selectedWellId);

  return (
    <div className="well-map-wrapper">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "320px", width: "100%", borderRadius: "12px" }}
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
            eventHandlers={{
              click: () => onSelectWell(well),
            }}
          >
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif", minWidth: "140px" }}>
                <strong style={{ fontSize: "0.9rem" }}>{well.name}</strong>
                <br />
                <span style={{ fontSize: "0.75rem", color: STATUS_COLORS[well.status] }}>
                  ● {well.status}
                </span>
                <br />
                <span style={{ fontSize: "0.7rem", color: "#666" }}>
                  {well.location.lat.toFixed(4)}, {well.location.lng.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Selected well indicator */}
      {selectedWell ? (
        <div className="selected-well-badge">
          <span className="selected-well-dot" style={{ background: STATUS_COLORS[selectedWell.status] }} />
          <span><strong>{selectedWell.name}</strong> — {selectedWell.status}</span>
          <button
            type="button"
            className="selected-well-clear"
            onClick={() => onSelectWell(null)}
          >
            ✕
          </button>
        </div>
      ) : (
        <p className="map-hint">Click a marker on the map to select a well</p>
      )}
    </div>
  );
}
