const API_BASE = "http://localhost:5001/api/report";

export const fetchReports = async (query = {}) => {
  const params = new URLSearchParams();
  if (query.status) params.append("status", query.status);
  if (query.conditionType) params.append("conditionType", query.conditionType);
  if (query.page) params.append("page", query.page);
  if (query.limit) params.append("limit", query.limit);

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
};

export const fetchReportById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
};

export const createReport = async (data) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create report");
  return json;
};

export const updateReportStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update status");
  return json;
};

export const deleteReport = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete report");
  return json;
};
