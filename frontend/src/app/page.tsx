"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, Cpu, Activity } from "lucide-react";

export default function BTCDashboard() {
  const [model, setModel] = useState("LSTM");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from your FastAPI backend
  const fetchData = async (selectedModel: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/predict/${selectedModel.toLowerCase()}`,
      );

      if (!response.ok) {
        throw new Error("Backend turned into a zombie.");
      }

      const json = await response.json();

      // Check if timestamps exists before mapping
      if (json && json.timestamps) {
        const formattedData = json.timestamps.map((t: string, i: number) => ({
          name: t,
          actual: json.actual_prices[i],
          predicted: json.predicted_prices[i],
        }));
        setData(formattedData);
      }
    } catch (error) {
      console.error("The UI survived, but the data is gone:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(model);
  }, [model]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
      {/* Header */}
      <nav className="flex items-center justify-between mb-12 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-400 w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tighter">
            BTC // ANALYZER
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {["LSTM", "XGBOOST", "RF"].map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${model === m
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              {m}
            </button>
          ))}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">
              Current Model
            </p>
            <h2 className="text-3xl font-black text-emerald-400">{model}</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-emerald-400 w-5 h-5" />
              <span className="text-sm font-semibold">Live Performance</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Using historical context from the last 7 days to project
              volatility for the next 24h window.
            </p>
          </div>
        </div>

        {/* Main Chart Card */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="h-[500px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-400"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" minHeight={300} aspect={2}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient
                      id="colorActual"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorActual)"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#colorPred)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
