// Patient management API functions for Bun/SQLite backend

const API_BASE = "http://localhost:3000";

export async function fetchPatients() {
  const res = await fetch(`${API_BASE}/patients/latest/1000`);
  if (!res.ok) throw new Error("Failed to fetch patients");
  return await res.json();
}

export async function fetchPatientById(id) {
  const res = await fetch(`${API_BASE}/patient/${id}`);
  if (!res.ok) throw new Error("Failed to fetch patient");
  return await res.json();
}

export async function addPatient(patient) {
  const res = await fetch(`${API_BASE}/patient`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  });
  if (!res.ok) throw new Error("Failed to add patient");
  return await res.json();
}

export async function addDoctorNote(patientId, note) {
  const res = await fetch(`${API_BASE}/patient/${patientId}/note`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to add note");
  return await res.json();
}

export async function addProcedure(patientId, procedure) {
  const res = await fetch(`${API_BASE}/patient/${patientId}/procedure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(procedure),
  });
  if (!res.ok) throw new Error("Failed to add procedure");
  return await res.json();
} 