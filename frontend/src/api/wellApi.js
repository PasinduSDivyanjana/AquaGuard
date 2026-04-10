const API_BASE = "http://localhost:5001/api";

/** For WellList page — user-scoped, paginated */
export const fetchWells = async () => {
  const res = await fetch(`${API_BASE}/map`);
  if (!res.ok) throw new Error("Failed to fetch wells");
  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE}/user`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};
