const API_BASE = "http://localhost:5001/api";

export const fetchWells = async () => {
  const res = await fetch(`${API_BASE}/wells`);
  if (!res.ok) throw new Error("Failed to fetch wells");
  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};
