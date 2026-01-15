import React, { useState, useEffect, useMemo } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Sun, 
  Waves, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Wifi, 
  WifiOff,
  TrendingUp,
  History
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const App = () => {
  /* ================= STATE ================= */
  const [data, setData] = useState({
    airTemp: 28.5,
    humidity: 65,
    groundTemp: 31.2,
    sunlight: 450,
    timestamp: new Date().toLocaleTimeString()
  });

  const [isSimulation, setIsSimulation] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState([]);

  /* ================= SIMULATION MODE ================= */
  useEffect(() => {
    if (!isSimulation) return;

    const interval = setInterval(() => {
      const newAir = 25 + Math.random() * 15;
      const newGround = newAir + Math.random() * 10;
      const newSun = Math.floor(Math.random() * 1000);

      const newData = {
        airTemp: parseFloat(newAir.toFixed(1)),
        humidity: Math.floor(40 + Math.random() * 40),
        groundTemp: parseFloat(newGround.toFixed(1)),
        sunlight: newSun,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };

      setData(newData);
      setHistory(prev => [...prev.slice(-19), newData]);
      setIsConnected(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulation]);

  /* ================= REAL HARDWARE MODE ================= */
  useEffect(() => {
    if (isSimulation) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:3001/data");
        const json = await res.json();

        if (json.airTemp !== undefined) {
          const newData = {
            ...json,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          };

          setData(newData);
          setHistory(prev => [...prev.slice(-19), newData]);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch {
        setIsConnected(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulation]);

  /* ================= SAFETY LOGIC ================= */
  const safetyStatus = useMemo(() => {
    const isHotAir = data.airTemp > 35;
    const isHotGround = data.groundTemp > 40;
    const isHighSun = data.sunlight > 800;

    if (isHotAir || isHotGround) {
      return {
        level: 'UNSAFE',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/50',
        message: 'Extreme Heat Detected! Ground or Air temperature exceeds safety limits. Stop outdoor activities.',
        icon: <AlertTriangle className="w-8 h-8 text-red-500" />
      };
    } else if (isHighSun) {
      return {
        level: 'WARNING',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/50',
        message: 'High UV/Sunlight intensity. Ensure athletes are hydrated and taking breaks.',
        icon: <Sun className="w-8 h-8 text-yellow-500" />
      };
    } else {
      return {
        level: 'SAFE',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/50',
        message: 'Conditions are optimal for outdoor sports. Keep monitoring for changes.',
        icon: <CheckCircle className="w-8 h-8 text-emerald-500" />
      };
    }
  }, [data]);

  const StatCard = ({ title, value, unit, icon: Icon, colorClass }) => (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl transition-all hover:border-zinc-700 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <TrendingUp className="w-4 h-4 text-zinc-600" />
      </div>
      <h3 className="text-zinc-400 font-medium text-sm mb-1 uppercase tracking-wider">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-zinc-500 font-medium">{unit}</span>
      </div>
    </div>
  );

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30">

      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
            <Activity className="text-emerald-500 w-8 h-8" />
            Smart Outdoor Sports Monitor
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Campus Thermal Safety & Real-time Environment Analytics
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900 p-1.5 rounded-full border border-zinc-800">
          <button
            onClick={() => setIsSimulation(!isSimulation)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              isSimulation
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {isSimulation ? 'SIMULATION ACTIVE' : 'REAL-TIME MODE'}
          </button>

          <div className="h-4 w-[1px] bg-zinc-800" />

          <div className="flex items-center gap-2 px-3">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-emerald-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-zinc-600" />
            )}
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              {isConnected ? 'Hardware Connected' : 'Hardware Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Safety Status */}
      <section className={`max-w-7xl mx-auto p-6 rounded-3xl border ${safetyStatus.border} ${safetyStatus.bg} flex items-center gap-6 mb-6`}>
        {safetyStatus.icon}
        <div>
          <h2 className={`text-2xl font-black italic ${safetyStatus.color}`}>
            FIELD STATUS: {safetyStatus.level}
          </h2>
          <p className="text-zinc-300">{safetyStatus.message}</p>
        </div>
      </section>

      {/* Sensor Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Air Temperature (DHT11)" value={data.airTemp} unit="°C" icon={Thermometer} colorClass="bg-blue-500" />
        <StatCard title="Ground Surface (NTC)" value={data.groundTemp} unit="°C" icon={Waves} colorClass="bg-orange-500" />
        <StatCard title="Humidity" value={data.humidity} unit="%" icon={Droplets} colorClass="bg-cyan-500" />
        <StatCard title="Sunlight Intensity (LDR)" value={data.sunlight} unit="Lux" icon={Sun} colorClass="bg-amber-500" />
      </div>

      {/* Chart */}
      <div className="max-w-7xl mx-auto p-6 rounded-2xl bg-zinc-900 border border-zinc-800 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <CartesianGrid stroke="#27272a" />
            <XAxis dataKey="timestamp" stroke="#52525b" />
            <YAxis unit="°C" stroke="#52525b" />
            <Tooltip />
            <Area dataKey="airTemp" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            <Area dataKey="groundTemp" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default App;
