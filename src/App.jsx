import React, { useState, useEffect, useMemo } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Sun, 
  Waves, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Wifi, 
  WifiOff,
  TrendingUp,
  History,
  CloudSun,
  Timer,
  Info,
  Clock
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
  
  /* ================= DATA HANDLING (SIM & REAL) ================= */
  useEffect(() => {
    let interval;
    
    const updateData = (newData) => {
      setData(newData);
      setHistory(prev => [...prev, newData].slice(-30));
      setIsConnected(true);
    };

    if (isSimulation) {
      interval = setInterval(() => {
        const newAir = 24 + Math.random() * 12;
        const newGround = newAir + (Math.random() * 10);
        const newSun = Math.floor(Math.random() * 1200);
        const newHum = Math.floor(45 + Math.random() * 35);

        updateData({
          airTemp: parseFloat(newAir.toFixed(1)),
          humidity: newHum,
          groundTemp: parseFloat(newGround.toFixed(1)),
          sunlight: newSun,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }, 3000);
    } else {
      interval = setInterval(async () => {
        try {
          const res = await fetch("https://mqtt-server-js-porh-a.fly.dev/data");
          const json = await res.json();
          if (json.airTemp !== undefined || json.air !== undefined) {
            updateData({
              airTemp: json.airTemp || json.air || 0,
              groundTemp: json.groundTemp || json.grd || 0,
              humidity: json.humidity || json.hum || 0,
              sunlight: json.sunlight || json.sun || 0,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
          } else {
            setIsConnected(false);
          }
        } catch {
          setIsConnected(false);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulation]);

  /* ================= SAFETY & WEATHER LOGIC ================= */
  const safetyStatus = useMemo(() => {
    const isHotAir = data.airTemp > 35;
    const isHotGround = data.groundTemp > 40;
    const isHighSun = data.sunlight > 900;

    if (isHotAir || isHotGround) {
      return {
        level: 'UNSAFE',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/50',
        message: 'Extreme Heat Detected! Stop outdoor activities immediately.',
        icon: <AlertTriangle className="w-10 h-10 text-red-500" />,
        actions: ["Suspend all field activities", "Evacuate to shaded areas", "Provide ice-cold water towels"]
      };
    } else if (isHighSun || data.airTemp > 32) {
      return {
        level: 'WARNING',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/50',
        message: 'High thermal stress. Frequent hydration and shade breaks required.',
        icon: <Sun className="w-10 h-10 text-yellow-500" />,
        actions: ["Mandatory 15-min water breaks", "Apply SPF 50+ sunscreen", "Limit session to 45 mins"]
      };
    } else {
      return {
        level: 'SAFE',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/50',
        message: 'Conditions are optimal. Standard hydration protocols in place.',
        icon: <CheckCircle className="w-10 h-10 text-emerald-500" />,
        actions: ["Standard hydration", "Routine monitor active", "Breathable sports gear"]
      };
    }
  }, [data]);

  const weatherCondition = useMemo(() => {
    if (data.sunlight > 900) return "Harsh Sunlight";
    if (data.humidity > 75) return "Tropical Humidity";
    if (data.sunlight < 200 && data.humidity > 70) return "Overcast / Potential Rain";
    return "Clear Sky";
  }, [data]);

  /* ================= SUB-COMPONENTS ================= */
  const StatCard = ({ title, value, unit, icon: Icon, colorHex, max }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-xl transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: `${colorHex}20` }}>
            <Icon size={24} color={colorHex} strokeWidth={2.5} />
          </div>
          <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Live</div>
        </div>
        <h3 className="text-zinc-400 font-medium text-xs mb-1 uppercase tracking-wider">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
          <span className="text-zinc-500 font-medium text-sm">{unit}</span>
        </div>
        <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: colorHex }} />
        </div>
      </div>
    );
  };

  const CustomChart = ({ title, dataKey, hexColor, unit, icon: Icon, height = 250 }) => (
    <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-tighter italic">
          <Icon size={16} color={hexColor} />
          {title} Trend
        </h3>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 border border-white/5" style={{ color: hexColor }}>
          LIVE
        </div>
      </div>
      <div style={{ height: `${height}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={hexColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={hexColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.3} />
            <XAxis dataKey="timestamp" hide />
            <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} unit={unit} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', fontSize: '11px' }}
              itemStyle={{ color: '#fff' }}
              isAnimationActive={false}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={hexColor} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill={`url(#color${dataKey})`} 
              isAnimationActive={true} 
              animationDuration={500} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  /* ================= UI RENDER ================= */
  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <Activity className="text-white w-8 h-8" />
             </div>
             <div>
                <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Smart Outdoor Monitor</h1>
                <div className="flex items-center gap-3 mt-1.5">
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <CloudSun size={12} className="text-emerald-500" /> {weatherCondition}
                   </p>
                   <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={12} className="text-zinc-600" /> Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900 p-1.5 rounded-full border border-zinc-800">
            <button
              onClick={() => setIsSimulation(!isSimulation)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${
                isSimulation ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isSimulation ? 'SIMULATION' : 'REAL HARDWARE'}
            </button>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <div className="flex items-center gap-2 px-3">
              <Wifi size={14} className={isConnected ? "text-emerald-500 animate-pulse" : "text-zinc-600"} />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{isConnected ? 'Link Active' : 'Offline'}</span>
            </div>
          </div>
        </header>

        {/* Safety & Action Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className={`lg:col-span-2 p-8 rounded-3xl border ${safetyStatus.border} ${safetyStatus.bg} backdrop-blur-md flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 ${safetyStatus.color.replace('text-', 'bg-')}`} />
            <div className="flex-shrink-0">{safetyStatus.icon}</div>
            <div className="flex-grow text-center md:text-left">
              <h2 className={`text-3xl font-black italic tracking-tight ${safetyStatus.color}`}>FIELD STATUS: {safetyStatus.level}</h2>
              <p className="text-zinc-300 text-lg max-w-2xl mt-2 leading-relaxed font-medium">{safetyStatus.message}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-xl text-center min-w-[140px]">
               <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">Live Heat Index</p>
               <p className={`text-3xl font-black italic tracking-tighter ${safetyStatus.color}`}>{(data.airTemp * 1.05).toFixed(1)}</p>
            </div>
          </section>

          <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
             <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider italic mb-4">
                <Info size={16} className="text-emerald-500" /> Coach's Action Plan
             </div>
             <ul className="space-y-3">
                {safetyStatus.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-zinc-400">
                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${safetyStatus.color.replace('text-', 'bg-')}`} />
                    {action}
                  </li>
                ))}
             </ul>
             <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                <span className="text-zinc-600">Protocol Status</span>
                <span className={safetyStatus.color}>Verified</span>
             </div>
          </section>
        </div>

        {/* Data Analytics Hub */}
        <div className="space-y-6">
          
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Air Temp" value={data.airTemp} unit="°C" icon={Thermometer} colorHex="#3b82f6" max={50} />
            <StatCard title="Ground Temp" value={data.groundTemp} unit="°C" icon={Waves} colorHex="#f97316" max={60} />
            <StatCard title="Field Humidity" value={data.humidity} unit="%" icon={Droplets} colorHex="#06b6d4" max={100} />
            <StatCard title="Solar Intensity" value={data.sunlight} unit="Lx" icon={Sun} colorHex="#f59e0b" max={1500} />
          </div>

          {/* Primary Chart: Temperature Comparison */}
          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter italic"><History className="text-emerald-500" size={24} /> Thermal Correlation Analysis</h3>
                <p className="text-zinc-500 text-sm mt-1">Real-time analysis of atmospheric vs. surface heat</p>
              </div>
              <div className="flex gap-6 bg-black/30 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-300"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Ground</div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-300"><span className="w-3 h-3 rounded-full bg-blue-500" /> Air</div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAir" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorGround" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
                  <XAxis dataKey="timestamp" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} unit="°C" />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '16px' }} cursor={{ stroke: '#52525b' }} isAnimationActive={false} />
                  <Area type="monotone" dataKey="airTemp" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAir)" animationDuration={500} isAnimationActive={true} />
                  <Area type="monotone" dataKey="groundTemp" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorGround)" animationDuration={500} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Charts: Humidity & Solar (Full Width Stack) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomChart title="Field Humidity" dataKey="humidity" unit="%" icon={Droplets} hexColor="#06b6d4" />
            <CustomChart title="Solar Load" dataKey="sunlight" unit="Lx" icon={Sun} hexColor="#f59e0b" />
          </div>

        </div>

        <footer className="mt-8 pb-12 border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center text-zinc-600 gap-4 text-[10px] font-bold uppercase tracking-widest">
          <p className="flex items-center gap-2 text-zinc-500"><Activity size={12} /> Campus Thermal Safety | UiTM M3CDCS2514A</p>
          <div className="flex gap-8">
            <div className="flex items-center gap-2"><Clock size={12} /> System Live</div>
            <span className="text-zinc-800">|</span>
            <span>Ref: ITT569-IOT-2026</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;