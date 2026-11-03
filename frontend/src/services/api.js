
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

// Check backend health
export async function checkHealth() {
  const response = await fetch(
    `${API_BASE_URL}/api/health`
  );

  if (!response.ok) {
    throw new Error("Backend health check failed");
  }

  return response.json();
}

// Check database connection
export async function checkDatabase() {
  const response = await fetch(
    `${API_BASE_URL}/api/db-check`
  );

  if (!response.ok) {
    throw new Error("Database check failed");
  }

  return response.json();
}

// Scan nearby Wi-Fi networks
export async function scanNetworks() {
  const response = await fetch(
    `${API_BASE_URL}/api/scan`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Wi-Fi scanning failed"
    );
  }

  return response.json();
}
