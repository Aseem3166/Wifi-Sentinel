
import { useEffect, useState } from "react";

import {
  checkHealth,
  checkDatabase,
  scanNetworks
} from "./services/api";


function StatusCard({ title, status, description }) {
  const healthy = status === "Connected";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            healthy ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />

        <h3 className="text-xl font-semibold text-white">
          {status}
        </h3>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}


function StatCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-4 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}


function App() {

  const [backendStatus, setBackendStatus] =
    useState("Checking...");

  const [databaseStatus, setDatabaseStatus] =
    useState("Checking...");

  const [networks, setNetworks] = useState([]);

  const [loading, setLoading] = useState(false);

  const [lastChecked, setLastChecked] = useState(null);

  const [scanError, setScanError] = useState("");


  // Fetch Wi-Fi networks from FastAPI
  async function refreshScan() {

    setLoading(true);
    setScanError("");

    try {

      const data = await scanNetworks();

      setNetworks(data.networks || []);

      setLastChecked(new Date().toLocaleTimeString());

    } catch (error) {

      setScanError(error.message);
      setNetworks([]);

    } finally {

      setLoading(false);

    }
  }


  // Check backend, database and scanner
  async function refreshStatus() {

    try {

      const health = await checkHealth();

      setBackendStatus(
        health.status === "healthy"
          ? "Connected"
          : "Unavailable"
      );

    } catch {

      setBackendStatus("Unavailable");

    }

    try {

      const database = await checkDatabase();

      setDatabaseStatus(
        database.status === "connected"
          ? "Connected"
          : "Unavailable"
      );

    } catch {

      setDatabaseStatus("Unavailable");

    }

    await refreshScan();
  }


  // Automatically check services on page load
  useEffect(() => {
    refreshStatus();
  }, []);


  // Calculate signal statistics
  const strongNetworks = networks.filter(
    network =>
      typeof network.signal === "number" &&
      network.signal >= 70
  ).length;

  const weakNetworks = networks.filter(
    network =>
      typeof network.signal === "number" &&
      network.signal <= 40
  ).length;


  return (

    <div className="min-h-screen bg-[#080d19] text-slate-200">

      {/* Sidebar */}

      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-[#0c1322] p-6 lg:block">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl">
            🛡️
          </div>

          <div>
            <h1 className="text-lg font-bold text-white">
              WiFi Sentinel
            </h1>

            <p className="text-xs text-slate-500">
              Network Security Platform
            </p>
          </div>

        </div>


        <nav className="mt-12 space-y-3">

          <div className="rounded-xl bg-blue-600/15 px-4 py-3 text-sm font-medium text-blue-400">
            ◈ Dashboard
          </div>

          <button
            onClick={refreshScan}
            className="w-full rounded-xl px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-800 hover:text-blue-400"
          >
            ◉ Wi-Fi Scanner
          </button>

          <div className="rounded-xl px-4 py-3 text-sm text-slate-500">
            ◈ Security Analysis
          </div>

          <div className="rounded-xl px-4 py-3 text-sm text-slate-500">
            ◷ Scan History
          </div>

          <div className="rounded-xl px-4 py-3 text-sm text-slate-500">
            ◫ Reports
          </div>

        </nav>


        <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-slate-800 p-4">

          <p className="text-xs text-slate-500">
            PROJECT VERSION
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            WiFi Sentinel 2.0
          </p>

          <p className="mt-1 text-xs text-emerald-400">
            Phase 3 - Scanner Integration
          </p>

        </div>

      </aside>


      {/* Main content */}

      <main className="lg:ml-64">

        {/* Header */}

        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-6 py-6 md:px-10">

          <div>

            <p className="text-sm text-slate-500">
              Overview
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              Security Dashboard
            </h2>

          </div>


          <div className="flex flex-wrap items-center gap-3">

            <span className="text-xs text-slate-500">
              {lastChecked
                ? `Last scanned: ${lastChecked}`
                : "Initializing..."}
            </span>

            <button
              onClick={refreshStatus}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Refresh Status"}
            </button>

          </div>

        </header>


        <div className="space-y-8 p-6 md:p-10">


          {/* Welcome */}

          <section>

            <h3 className="text-xl font-semibold text-white">
              Welcome to WiFi Sentinel
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Monitor Wi-Fi network security, evaluate
              encryption configurations and identify
              potential network risks from one platform.
            </p>

          </section>


          {/* Live statistics */}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Networks Discovered"
              value={networks.length}
              description="Networks returned by Wi-Fi scanner"
            />

            <StatCard
              title="Strong Signal Networks"
              value={strongNetworks}
              description="Signal strength 70% or higher"
            />

            <StatCard
              title="Weak Signal Networks"
              value={weakNetworks}
              description="Signal strength 40% or lower"
            />

            <StatCard
              title="Average Security Score"
              value="Pending"
              description="Security analysis not implemented"
            />

          </section>


          {/* Wi-Fi Scanner */}

          <section>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

              <div>

                <h3 className="text-lg font-semibold text-white">
                  Detected Wi-Fi Networks
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Live information received from your Windows Wi-Fi adapter.
                </p>

              </div>

              <button
                onClick={refreshScan}
                disabled={loading}
                className="rounded-xl border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-600 hover:text-white disabled:opacity-50"
              >
                {loading ? "Scanning..." : "Scan Networks"}
              </button>

            </div>


            {scanError && (

              <div className="mb-4 rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-400">
                Scanner error: {scanError}
              </div>

            )}


            {!scanError && networks.length === 0 && !loading && (

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center">

                <p className="text-slate-300">
                  No Wi-Fi networks detected.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Click Scan Networks to try again.
                </p>

              </div>

            )}


            {loading && networks.length === 0 && (

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400">
                Scanning for Wi-Fi networks...
              </div>

            )}


            {networks.length > 0 && (

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">

                <table className="w-full min-w-[750px] text-left text-sm">

                  <thead className="border-b border-slate-800 text-slate-400">

                    <tr>
                      <th className="px-5 py-4">Network Name</th>
                      <th className="px-5 py-4">BSSID</th>
                      <th className="px-5 py-4">Signal</th>
                      <th className="px-5 py-4">Channel</th>
                      <th className="px-5 py-4">Authentication</th>
                      <th className="px-5 py-4">Encryption</th>
                    </tr>

                  </thead>


                  <tbody>

                    {networks.map((network, index) => (

                      <tr
                        key={network.bssid || `${network.ssid}-${index}`}
                        className="border-b border-slate-800/70 last:border-0"
                      >

                        <td className="px-5 py-4 font-semibold text-white">
                          {network.ssid}
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          {network.bssid || "Unavailable"}
                        </td>

                        <td className="px-5 py-4">

                          {typeof network.signal === "number" ? (

                            <span className={
                              network.signal >= 70
                                ? "text-emerald-400"
                                : network.signal <= 40
                                  ? "text-red-400"
                                  : "text-amber-400"
                            }>
                              {network.signal}%
                            </span>

                          ) : "Unavailable"}

                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {network.channel ?? "Unavailable"}
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {network.authentication}
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {network.encryption}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </section>


          {/* System status */}

          <section>

            <div className="mb-4">

              <h3 className="text-lg font-semibold text-white">
                System Status
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Live connectivity checks for application services.
              </p>

            </div>


            <div className="grid gap-4 md:grid-cols-2">

              <StatusCard
                title="FastAPI Backend"
                status={backendStatus}
                description="Python application server"
              />

              <StatusCard
                title="SQLite Database"
                status={databaseStatus}
                description="Local database connectivity"
              />

            </div>

          </section>


          {/* Development progress */}

          <section className="rounded-2xl border border-blue-900/50 bg-blue-950/20 p-6">

            <div className="flex items-center gap-3">

              <span className="text-2xl">🚀</span>

              <div>

                <h3 className="font-semibold text-white">
                  Development Progress
                </h3>

                <p className="text-xs text-slate-400">
                  Phase 3 - Wi-Fi Scanner Integration
                </p>

              </div>

            </div>


            <div className="mt-5 space-y-3 text-sm">

              {[
                "React frontend initialized",
                "FastAPI backend configured",
                "SQLite database connected",
                "Wi-Fi scanning engine implemented",
                "FastAPI scanning endpoint integrated",
                "React Wi-Fi scanner integration"
              ].map((item) => (

                <div key={item} className="flex items-center gap-3">

                  <span className="text-emerald-400">✓</span>

                  <span className="text-slate-300">
                    {item}
                  </span>

                </div>

              ))}

            </div>

          </section>


          <footer className="border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
            WiFi Sentinel 2.0 · Built with React, FastAPI and SQLite
          </footer>

        </div>

      </main>

    </div>

  );
}

export default App;
