import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Line, Bar, ReferenceLine
} from 'recharts';
import {
  Droplets, Thermometer, Wind, Gauge, Activity, Sprout,
  CloudRain, Sun, CloudLightning, AlertTriangle, CheckCircle,
  BrainCircuit, LayoutDashboard, Leaf,
} from 'lucide-react';
import { rtdb, db, auth } from '../../firebase/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { query, collection, doc, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';

import Pic1 from "../../assets/plants_logo/pic1.png";
import Pic2 from "../../assets/plants_logo/pic2.png";
import Pic3 from "../../assets/plants_logo/pic3.png";
import Pic4 from "../../assets/plants_logo/pic4.png";
import Pic5 from "../../assets/plants_logo/pic5.png";
import Pic6 from "../../assets/plants_logo/pic6.png";
import Pic7 from "../../assets/plants_logo/pic7.png";
import Pic8 from "../../assets/plants_logo/pic8.png";
import Pic9 from "../../assets/plants_logo/pic9.png";
import Pic10 from "../../assets/plants_logo/pic10.png";
import Footer from "../../components/landing/footer1";

const LOGO_SET = [Pic1, Pic2, Pic3, Pic4, Pic5, Pic6, Pic7, Pic8, Pic9, Pic10];

const getRandomLogo = () => {
  const randomIndex = Math.floor(Math.random() * LOGO_SET.length);
  return LOGO_SET[randomIndex];
};

// ---------- Utilities ----------
const calculateVPD = (temp, humidity) => {
  if (temp == null || humidity == null) return null;
  const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  const ea = es * (humidity / 100);
  return Number((es - ea).toFixed(2));
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return "Never";
  const t = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((Date.now() - t) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h AGO`;
  return new Date(timestamp).toLocaleDateString();
};

function aggregateSensorData(data, timeMeta) {
  // Safety guards — DO NOT REMOVE
  if (!Array.isArray(data) || data.length === 0) return [];
  if (!timeMeta || data.length < 2) {
    // Pass-through with safe formatting
    return data.map(d => {
      let t;
      if (d.timestamp?.toDate) {
        t = d.timestamp.toDate();
      } else if (typeof d.timestamp === 'string') {
        t = new Date(d.timestamp);
      } else {
        t = new Date(d.timestamp);
      }
      if (isNaN(t.getTime())) t = new Date(); // Fallback if invalid

      return {
        time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        temperature: d.sensor?.temperature ?? d.temperature,
        humidity: d.sensor?.humidity ?? d.humidity,
        moisture: d.sensor?.moisture ?? d.moisture,
        pressure: d.sensor?.pressure ?? d.pressure,
      };
    });
  }

  const buckets = {};
  let mode;

  // Decide aggregation mode ONLY ONCE
  if (timeMeta.diffHours <= 24) mode = "hour";
  else if (timeMeta.diffDays <= 3) mode = "block"; // AM / PM
  else mode = "day";

  let workingData = data;
  workingData.forEach(d => {
    let t;
    if (d.timestamp?.toDate) {
      t = d.timestamp.toDate();
    } else if (typeof d.timestamp === 'string') {
      t = new Date(d.timestamp);
    } else {
      t = new Date(d.timestamp);
    }
    if (isNaN(t.getTime())) t = new Date(); // Fallback if invalid

    let key, label;
    if (mode === "hour") {
      key = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}-${t.getHours()}`;
      label = t.toLocaleTimeString([], { weekday: "short" ,hour: "2-digit", minute: "2-digit" });
    }
    else if (mode === "block") {
      const isAM = t.getHours() < 12;
      key = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}-${isAM ? "AM" : "PM"}`;
      label = `${t.toLocaleDateString([], { weekday: "short" })} `;
    }
    else {
      key = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
      label = t.toLocaleDateString([], { weekday: "short" });
    }

    if (!buckets[key]) {
      buckets[key] = {
        time: label,
        temperature: 0,
        humidity: 0,
        moisture: 0,
        pressure: 0,
        count: 0,
      };
    }

    buckets[key].temperature += d.sensor?.temperature ?? d.temperature;
    buckets[key].humidity += d.sensor?.humidity ?? d.humidity;
    buckets[key].moisture += d.sensor?.moisture ?? d.moisture;
    buckets[key].pressure += d.sensor?.pressure ?? d.pressure;
    buckets[key].count += 1;
  });

  // Final averaged output — THIS IS WHAT CHARTS USE
  return Object.values(buckets).map(b => ({
    time: b.time,
    temperature: b.temperature / b.count,
    humidity: b.humidity / b.count,
    moisture: b.moisture / b.count,
    pressure: b.pressure / b.count,
  }));
}

// ==========================================
// VIEW 1: DASHBOARD
// ==========================================
const DashboardView = ({
  plants,mlData,activePlant,activePlantId,sensorHistory,setActivePlantId,userAdoptedIds
}) => {

  if (!userAdoptedIds || userAdoptedIds.length === 0) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="bg-forest-surface border border-forest-border p-12 rounded-[3rem] text-center shadow-2xl">
        <Sprout size={40} className="mx-auto mb-6 text-forest-muted opacity-40" />
        <h2 className="text-2xl font-bold text-white mb-2">No Active Monitors</h2>
        <p className="text-forest-muted">Adopt a plant to start tracking live telemetry.</p>
      </div>
    </div>
  );
}
  const safeHistory = Array.isArray(sensorHistory) ? sensorHistory : [];

  const currentTemp = activePlant?.temp ?? 0;
  const currentHumid =
    activePlant?.humidity != null ? activePlant.humidity.toFixed(2) : 0;
  const currentMoist = activePlant?.moisture ?? 0;
  const currentPress =
    activePlant?.pressure != null ? activePlant.pressure.toFixed(2) : 0;

  const ml = mlData?.[activePlantId];
  const plantConfidence = ml?.confidence ?? null;
  const activePlantHealth = ml?.health ?? "Healthy";

  const timeMeta = useMemo(() => {
    if (!safeHistory.length) return null;
    const first = new Date(safeHistory[0].timestamp);
    const last = new Date(safeHistory[safeHistory.length - 1].timestamp);
    return {
      diffDays: (last - first) / (1000 * 60 * 60 * 24),
      diffHours: (last - first) / (1000 * 60 * 60),
    };
  }, [safeHistory]);

  const processedHistory = useMemo(
    () => (timeMeta ? aggregateSensorData(safeHistory, timeMeta) : safeHistory),
    [safeHistory, timeMeta]
  );

  // VPD
const vpdData = useMemo(() => {
  if (!processedHistory || processedHistory.length === 0) return [];
  return processedHistory.map(p => ({
    time: p.time,
    vpd: calculateVPD(p.temperature, p.humidity),
  }));
}, [processedHistory]);

// Moisture

const moistureStats = useMemo(() => {
  if (!processedHistory || processedHistory.length === 0) return { chartData: [], diff: 0, hasData: false };

  // Convert to Number immediately to prevent the NaN string-concatenation bug
  const chartData = processedHistory.map(p => ({
    time: p.time,
    val: Number(p.moisture.toFixed(2)), 
  }));

  const current = chartData[chartData.length - 1].val;
  const total = chartData.reduce((acc, p) => acc + p.val, 0);
  const avg = total / chartData.length;
  const diff = current - avg;

  return { chartData, diff, hasData: chartData.length >= 2 };
}, [processedHistory]);

// Microclimate
const microClimateData = useMemo(() => {
  if (!processedHistory || processedHistory.length === 0) return [];
  return processedHistory.map(p => ({
    time: p.time,
    temp: p.temperature.toFixed(2),
    hum: p.humidity.toFixed(2),
  }));
}, [processedHistory]);

// Predictive Environmental Intelligence
let weather = { icon: Sun, text: "Optimal Condition", color: "text-yellow-400" };

if (activePlantHealth === 'Critical') {
  weather = { icon: AlertTriangle, text: "Terminal Risk", color: "text-red-400" };
} else if (calculateVPD(currentTemp, currentHumid) > 1.5) {
  weather = { icon: Wind, text: "Stress Forecast", color: "text-orange-400" };
} else if (currentPress < 1009) {
  weather = { icon: CloudLightning, text: "Atmospheric Drop", color: "text-purple-400" };
} else if (currentPress < 1012) {
  weather = { icon: CloudRain, text: "Unstable Sky", color: "text-blue-400" };
}

const WeatherIcon = weather.icon;

  return (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-6 animate-in fade-in duration-500 pb-24">
        
        {/* FEATURED PLANT LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-forest-surface/50 border border-forest-border rounded-[3rem] p-8 h-[450px] lg:h-[650px] flex flex-col overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-forest-base pointer-events-none"></div>
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative z-20 text-center mb-8">
              <h2 className="text-4xl font-bold text-white leading-tight">Love Green</h2>
              <h2 className="text-4xl font-bold text-white leading-tight">Live Long</h2>
            </div>

            <div className="absolute inset-0 z-0">
              <img 
                src="https://aehinnovativehydrogel.com/wp-content/uploads/2022/07/04June22_what-are-the-requirements-for-plant-growth_iStock-956366756.jpg" 
                className="w-full h-full object-cover opacity-60" 
                alt="Leaf Detail" 
              />
              
              {/* DESKTOP ONLY */}
              <div className="hidden lg:block">
                {/* Top Left Vital - Temperature */}
                <div className="absolute lg:top-35 lg:left-55 text-middle">
                  <div className="text-x text-white uppercase tracking-wider mb-1">Temperature</div>
                  <div className="text-2xl font-bold text-emerald-400">{currentTemp} °C</div>
                  <div className="absolute right-10 w-16 h-0.5 bg-forest-surface/90 origin-left rotate-45"></div>
                </div>

                {/* Top Right Vital - Pressure */}
                <div className="absolute top-25 right-25 text-right">
                  <div className="text-x text-white uppercase tracking-wider mb-1">Pressure</div>
                  <div className="text-2xl font-bold text-emerald-400">{currentPress}</div>
                  <div className="absolute top-full right-0 w-16 h-0.5 bg-forest-surface/90 origin-left rotate-125"></div>
                </div>

                {/* Bottom Left Vital - Humidity */}
                <div className="absolute bottom-70 left-30 text-left">
                  <div className="text-x text-white uppercase tracking-wider mb-1">Humidity</div>
                  <div className="text-2xl font-bold text-emerald-400">{currentHumid}%</div>
                  <div className="absolute right-0 w-16 h-0.5 bg-forest-surface/90 origin-left rotate-45"></div>
                </div>

                {/* Bottom Right Vital - Soil Moisture */}
                <div className="absolute bottom-45 right-15 text-left">
                  <div className="text-x text-white uppercase tracking-wider mb-1">Soil Moisture</div>
                  <div className="text-2xl font-bold text-emerald-400">{currentMoist}%</div>
                  <div className="absolute top-full right-15 w-16 h-0.5 bg-forest-surface/90 origin-left rotate-125"></div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-forest-base via-forest-base/80 to-transparent z-10 pointer-events-none"></div>
          </div>

          {/* MOBILE ONLY: Grid view for clean phone display */}
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            <div className="bg-forest-surface border border-forest-border p-4 rounded-2xl flex flex-col items-center">
              <div className="text-[10px] text-forest-muted uppercase font-bold mb-1">Temperature</div>
              <div className="text-xl font-bold text-emerald-400">{currentTemp}°C</div>
            </div>
            <div className="bg-forest-surface border border-forest-border p-4 rounded-2xl flex flex-col items-center">
              <div className="text-[10px] text-forest-muted uppercase font-bold mb-1">Humidity</div>
              <div className="text-xl font-bold text-emerald-400">{currentHumid}%</div>
            </div>
            <div className="bg-forest-surface border border-forest-border p-4 rounded-2xl flex flex-col items-center">
              <div className="text-[10px] text-forest-muted uppercase font-bold mb-1">Moisture</div>
              <div className="text-xl font-bold text-emerald-400">{currentMoist}%</div>
            </div>
            <div className="bg-forest-surface border border-forest-border p-4 rounded-2xl flex flex-col items-center">
              <div className="text-[10px] text-forest-muted uppercase font-bold mb-1">Pressure</div>
              <div className="text-xl font-bold text-emerald-400">{currentPress}</div>
            </div>
          </div>
        </div>
  
        {/* RIGHT COMMAND CENTER */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ML HEALTH */}
            <div className="bg-forest-surface border border-forest-border p-6 rounded-3xl relative overflow-hidden">
              <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-2xl ${
                ml?.health === 'Critical' ? 'bg-red-500/20' : 
                ml?.health === 'Moderate' ? 'bg-yellow-500/20' : 'bg-emerald-500/10'
              }`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-forest-muted text-xs font-bold uppercase">ML Health Score</p>
                  <h3 className="text-4xl font-bold text-white mt-2">
                    {plantConfidence != null ? Math.round(plantConfidence * 100) : "--"}
                    <span className="text-xl text-forest-accent">%</span>
                  </h3>
                </div>
                <div className={`p-2 rounded-lg ${
                  ml?.health === 'Critical' ? 'bg-red-500/20 text-red-400' : 
                  ml?.health === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <BrainCircuit size={24}/>
                </div>
              </div>
  
              <div className="w-full bg-forest-base h-2 rounded-full">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    ml?.health === 'Critical' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 
                    ml?.health === 'Moderate' ? 'bg-yellow-500 shadow-[0_0_15px_#eab308]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'
                  }`} 
                  style={{ width: `${plantConfidence != null ? plantConfidence * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-forest-muted mt-2">AI confidence based on current sensor readings</p>
            </div>
  
            {/* Environmental Intelligence */}
            <div className="bg-forest-surface border border-forest-border p-6 rounded-3xl relative min-h-[180px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-forest-muted text-[10px] font-bold uppercase tracking-widest">Environmental Intelligence</p>
                  <div className="flex items-center gap-2 mt-2">
                    <WeatherIcon size={24} className={weather.color}/>
                    <h3 className="text-xl font-bold text-white">{weather.text}</h3>
                  </div>
                </div>
              </div>

              {/* Dynamic Alert Message Based on VPD and Health */}
              <div className="space-y-3">
                {activePlantHealth === 'Critical' ? (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                    <AlertTriangle className="text-red-400" size={18}/>
                    <span className="text-xs text-red-200 font-bold">Rapid physiological decline likely within hours without intervention.</span>
                  </div>
                ) : calculateVPD(currentTemp, currentHumid) > 1.5 ? (
                  <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl flex items-center gap-3">
                    <Wind className="text-orange-400" size={18}/>
                    <span className="text-xs text-orange-200 font-bold">High Evaporation: Check soil moisture soon.</span>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-3">
                    <CheckCircle className="text-emerald-400" size={18}/>
                    <span className="text-xs text-emerald-200 font-bold">Equilibrium: Transpiration rates are optimal.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* PLANT CLIMATE WIDGET */}
          <div className="bg-forest-surface border border-forest-border p-5 rounded-[2.5rem] relative h-fit lg:h-[425px] flex flex-col shadow-2xl overflow-hidden transition-all duration-300">
            {/* Header  */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Environmental Vitals</h3>
                <p className="text-[10px] text-forest-muted uppercase tracking-widest mt-1">Telemetry Analysis</p>
              </div>
              
              <div className="text-right">
                <div className="text-[10px] text-forest-muted uppercase font-bold tracking-tighter mb-1">Last Update</div>
                <div className="text-sm font-mono text-emerald-400 font-bold bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10">
                  {activePlant?.lastUpdated ? getTimeAgo(activePlant.lastUpdated) : "Syncing"}
                </div>
              </div>
            </div>
            <div className=" flex-grow flex flex-col justify-between">
              
              {/* Temperature Indicator  */}
              <div className="group">
                <div className="flex justify-between items-end mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <Thermometer size={16} className="text-orange-400" />
                    <span className="text-[11px] font-bold uppercase text-forest-muted">Air Temperature</span>
                  </div>
                  <span className="text-xl font-bold text-white">{currentTemp}<span className="text-sm font-normal text-forest-muted ml-1">°C</span></span>
                </div>
                <div className="h-2.5 w-full bg-forest-base rounded-full overflow-hidden border border-forest-border/50 p-[1px]">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-red-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(Math.max((currentTemp / 50) * 100, 0), 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Humidity Indicator  */}
              <div className="group">
                <div className="flex justify-between items-end mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <Wind size={16} className="text-blue-400" />
                    <span className="text-[11px] font-bold uppercase text-forest-muted">Relative Humidity</span>
                  </div>
                  <span className="text-xl font-bold text-white">{currentHumid}<span className="text-sm font-normal text-forest-muted ml-1">%</span></span>
                </div>
                <div className="h-2.5 w-full bg-forest-base rounded-full overflow-hidden border border-forest-border/50 p-[1px]">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(Math.max(currentHumid, 0), 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Barometric Block  */}
              <div className="p-4 bg-forest-base/40 rounded-3xl border border-forest-border/60 relative group">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Gauge size={18} className="text-purple-400" />
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Atmos. Engine</span>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-400 text-[12px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                    VPD: {calculateVPD(currentTemp, currentHumid)} 
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-white tracking-tight">{currentPress}</span>
                  <span className="text-xs text-forest-muted uppercase">hPa</span>
                </div>

                {/* Segmented Bar  */}
                <div className="relative pt-1 mb-2">
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-forest-base/50">
                    <div style={{ width: "33%" }} className="bg-blue-500/20"></div>
                    <div style={{ width: "34%" }} className="bg-emerald-500/40 border-x border-white/5"></div>
                    <div style={{ width: "33%" }} className="bg-purple-500/20"></div>
                  </div>
                  <div 
                    className="absolute top-[2px] w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] border-2 border-forest-base transition-all duration-1000"
                    style={{ left: `calc(${Math.min(Math.max(((currentPress - 980) / (1050 - 980)) * 100, 0), 100)}% - 6px)` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-[8px] text-forest-muted uppercase font-black tracking-tighter mb-5 opacity-80">
                  <span>Stormy</span>
                  <span className="text-emerald-400">Stable</span>
                  <span>Clear</span>
                </div>

                <p className="text-[15px] text-gray-400 leading-tight italic border-l-2 border-forest-border/30 pl-2">
                  {currentPress < 1010 ? "Low pressure: moisture retention high." : "High pressure: balanced humidity levels."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {/* ANALYTICS CHARTS */}
      <div className="space-y-2">
       <h1 className="text-3xl font-bold text-forest-primary flex justify-center"> Recent Trends</h1>
       <p className="text-sm text-forest-muted mt-3 flex justify-center space-y-3 pb-4">
        <i>Aggregated view of recent environmental and soil conditions affecting plant health</i></p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 ">
            <div className="bg-forest-surface border border-forest-border p-6 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300">
              <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><Activity size={18} className="text-forest-accent"/> Vapor Pressure Deficit</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={vpdData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C4A42" vertical={false} />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#4ADE80" fontSize={10} axisLine={false} tickLine={false} width={30}/>
                    <YAxis yAxisId="right" orientation="right" stroke="#60a5fa" fontSize={10} axisLine={false} tickLine={false} width={30}/>
                    <Tooltip contentStyle={{ backgroundColor: '#121F1B', borderColor: '#2C4A42' }} />
                    <ReferenceLine yAxisId="left" y={0.8} stroke="#4ADE80" strokeDasharray="3 3" opacity={0.3} />
                    <ReferenceLine yAxisId="left" y={1.2} stroke="#4ADE80" strokeDasharray="3 3" opacity={0.3} />
                    <Area yAxisId="left" type="monotone" dataKey="vpd" fill="rgba(74,222,128,0.2)" stroke="#4ADE80" />
                    {/* <Line yAxisId="right" type="monotone" dataKey="hum" stroke="#60a5fa" dot={false} strokeWidth={2} /> */}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
    
            <div className="bg-forest-surface border border-forest-border p-6 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <div><h3 className="font-bold text-white text-lg flex items-center gap-2"><Droplets size={18} className="text-blue-400"/> Soil Moisture</h3></div>
                {/* {moistureStats.hasData ? (
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    moistureStats.diff < -5 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {moistureStats.diff > 0 ? '+' : ''}{moistureStats.diff.toFixed(0)}% vs Avg
                  </div>
                ) : (
                  <div className="bg-forest-highlight/20 px-3 py-1 rounded-full text-forest-muted text-xs font-bold">
                    Stable
                  </div>
                )} */}
            </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart  data={moistureStats.chartData}>
                    <defs><linearGradient id="colorMoist" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/><stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C4A42" vertical={false} />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis domain={[0, 100]} stroke="#60a5fa" fontSize={12} tickLine={false} axisLine={false} unit="%" width={35} />
                    <Tooltip contentStyle={{ backgroundColor: '#121F1B', borderColor: '#2C4A42', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#60a5fa' }} />
                    <Area type="monotone" dataKey="val" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorMoist)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
    
            <div className="bg-forest-surface border border-forest-border p-6 rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <div><h3 className="font-bold text-white text-lg flex items-center gap-2"><Thermometer size={18} className="text-orange-400"/> Micro-Climate</h3></div>
                <div className="bg-orange-500/10 px-3 py-1 rounded-full text-orange-400 text-xs font-bold">Inverse</div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={microClimateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C4A42" vertical={false} />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#fb923c" fontSize={12} tickLine={false} axisLine={false} unit="°C" width={35} />
                    <YAxis yAxisId="right" orientation="right" stroke="#4ADE80" fontSize={12} tickLine={false} axisLine={false} unit="%" width={35} />
                    <Tooltip contentStyle={{ backgroundColor: '#121F1B', borderColor: '#2C4A42', borderRadius: '12px' }} />
                    <Bar yAxisId="right" dataKey="hum" fill="#4ADE80" opacity={0.2} radius={[4, 4, 0, 0]} barSize={20} />
                    <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#fb923c" strokeWidth={3} dot={{r: 4, fill: '#121F1B', strokeWidth: 2}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
      </div>
        {/* --- ALL PLANTS LIST --- */}
        <div className="w-full mt-8 px-6">
          <div className="flex justify-between items-end mb-6">
            <div><h3 className="text-xl font-bold text-white">Active Plant Monitor</h3><p className="text-xs text-forest-muted uppercase tracking-wider mt-1">Tracking {plants.length} Specimens</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {plants
                .filter((plant) => userAdoptedIds.includes(plant.id))
                .map((plant) => {
                const ml = mlData?.[plant.id];
                const health = ml?.health ?? "Loading"; 

                return (
                  <div key={plant.id} onClick={() => setActivePlantId(plant.id)} className="bg-forest-surface border border-forest-border p-3 rounded-2xl flex items-center gap-4 hover:border-forest-accent/30 hover:bg-forest-highlight/50 transition-all cursor-pointer group">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-forest-border group-hover:border-forest-accent transition-colors relative">
                      <img src={getRandomLogo()} alt={plant.name} className="w-full h-full object-cover" />
                    </div>
  
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate text-sm">{plant.name}</h4>
                      <p className="text-[10px] text-forest-muted uppercase tracking-wider">
                        ID: {plant.id.substring(0, 6)}...
                      </p>
                    </div>
  
                    <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-end min-w-[80px]
                      ${health === 'Healthy'
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                        : health === 'Critical'
                        ? 'bg-red-500/5 border-red-500/20 text-red-400'
                        : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'}`}>
  
                      <span className="flex items-center gap-1.5">
                        {health}
                        <span className={`w-1.5 h-1.5 rounded-full
                          ${health === 'Healthy'
                            ? 'bg-emerald-500 animate-pulse'
                            : health === 'Critical'
                            ? 'bg-red-500 animate-ping'
                            : 'bg-yellow-500'}`} />
                      </span>
                      {ml?.confidence !== undefined && (
                        <span className="text-[10px] text-forest-muted mt-0.5">
                          {(ml.confidence * 100).toFixed(1)}% confident
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
  
          </div>
        </div>
  
      </>
    );
  };
  
  // ==========================================
  // VIEW 2: MY PLANTS
  // ==========================================
  const MyPlantsView = ({ plants ,mlData}) => (
    <div className="animate-in fade-in duration-500 pb-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Adopted Forest</h2>
          <p className="text-forest-muted mt-1">Real-time telemetry for {plants.length} units.</p>
        </div>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plants.length === 0 ? (
          <div className="col-span-3 text-center py-20 bg-forest-surface border border-forest-border rounded-3xl border-dashed">
              <Sprout size={48} className="mx-auto text-forest-muted mb-4"/>
              <h3 className="text-xl font-bold text-white">No sensor data detected</h3>
              <p className="text-forest-muted mb-4">Ensure your ESP32/sensor is writing to the 'sensorData' node in Realtime Database.</p>
          </div>
        ) : plants.map((plant) => {
              const ml = mlData?.[plant.id];
              const health = ml?.health ?? "Loading";
  
              // 🔥 DYNAMIC CHANGE: Fetch the directive from Firebase mlPredictions
              const aiAdvice = ml?.directive || "Monitoring plant vitals for AI analysis...";
  
              const statusColor = 
                health === 'Healthy' ? 'emerald' : 
                health === 'Critical' ? 'red' : 'yellow';
          return (
            <div key={plant.id} 
                className={`relative bg-forest-surface border rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500 h-[500px] flex flex-col justify-between
             ${health === 'Healthy' ? 'border-forest-border' : `border-${statusColor}-500/50 shadow-[0_0_30px_rgba(${statusColor === 'red' ? '239,68,68' : '234,179,8'},0.15)]`}`}>
              <div className="absolute inset-0 z-0">
                <img src={getRandomLogo()} alt={plant.name} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-1000"/>
              </div>
              <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">{plant.name}</h3>
                    <span className="text-sm font-medium text-forest-accent px-2 py-0.5 bg-forest-accent/20 rounded-md backdrop-blur-md">{plant.plantType}</span>
                   
                  </div>
                  {/* Right side of the header - Status & Time */}
                  <div className="flex flex-col items-end gap-1.5">
                    {/* The Status Badge (Critical/Healthy) */}
                    <div className={`backdrop-blur-xl px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 bg-${statusColor}-500/20 border-${statusColor}-500/30 text-${statusColor}-300 shadow-lg`}>
                      {health === 'Healthy' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>} 
                      {health}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 mr-2">
                      <Activity size={10} className="text-forest-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-forest-accent">
                        {getTimeAgo(plant.lastUpdated)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <SensorBoxTransparent icon={Droplets} label="Moisture" value={`${plant.moisture}%`} color={plant.moisture < 30 ? 'text-red-300' : 'text-blue-300'} />
                    <SensorBoxTransparent icon={Thermometer} label="Temp" value={`${plant.temp}°C`} color={plant.temp > 27 ? 'text-orange-300' : 'text-white'} />
                    <SensorBoxTransparent icon={Wind} label="Humidity" value={`${plant.humidity}%`} color="text-white" />
                    <SensorBoxTransparent icon={Gauge} label="Pressure" value={`${plant.pressure} hPa`} color="text-purple-300" />
                  </div>
                  <div className="bg-transparent/40 backdrop-blur-sm p-5 rounded-2xl border border-forest-border/50 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 p-8 bg-forest-accent/10 rounded-full blur-xl"></div>
                    <div className="flex items-center gap-2 mb-2 relative z-10"><BrainCircuit size={18} className="text-forest-accent" /><h5 className="text-xs font-bold text-forest-accent uppercase tracking-wider">ML directive</h5></div>
                    <p className="text-sm text-gray-100 leading-relaxed font-medium relative z-10 drop-shadow">"{aiAdvice}"</p>
                    <div className="mt-3 pt-3 border-t border-forest-border/30 text-[10px] text-forest-muted text-right relative z-10">Confidence: {(ml.confidence*100).toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  const SensorBoxTransparent = ({ icon: Icon, label, value, color }) => (
    <div className="bg-transparent/40 backdrop-blur-sm p-4 rounded-2xl border border-forest-border/50 flex flex-col justify-between transition-colors hover:bg-forest-base/60 hover:border-forest-accent/30 shadow-sm">
      <div className="flex items-center gap-1.5 text-forest-muted/80 text-[10px] uppercase font-bold"><Icon size={14}/> {label}</div>
      <div className={`text-xl font-bold mt-2 ${color} drop-shadow-sm`}>{value}</div>
    </div>
  );

// ==========================================
// MAIN DASHBOARD
// ==========================================
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showNav, setShowNav] = useState(true);
  const [plants, setPlants] = useState([]);
  const [mlData, setMlData] = useState({});
  const [activePlantId, setActivePlantId] = useState(null);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [userAdoptedIds, setUserAdoptedIds] = useState([]);
  const [allMetadata, setAllMetadata] = useState({});
  const lastScrollY = useRef(0);

  // RTDB – sensor data
  useEffect(() => {
    const sensorsRef = ref(rtdb, 'sensorData');
    const unsub = onValue(sensorsRef, snap => {
      const data = snap.val() || {};
      const list = Object.entries(data).map(([id, p]) => ({
        id,
        name: `Plant ${id.replace('plant-', '')}`,
        moisture: p.moisture,
        temp: p.temperature,
        humidity: p.humidity,
        pressure: p.pressure,
        lastUpdated: p.timestamp || Date.now()
      }));
      setPlants(list);
    });
    return () => unsub();
  }, []);

  // RTDB – ML predictions
  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'mlPredictions'), snap => {
      setMlData(snap.val() || {});
    });
    return () => unsub();
  }, []);

  // Auth + Firestore metadata 
  useEffect(() => {
    let plantUnsubs = []; // Array to store the listener cleanup functions
    
    const authUnsub = auth.onAuthStateChanged(user => {
      if (!user) return;

      // 1. Listen to the User's document to get their list of adopted plant IDs
      const userUnsub = onSnapshot(
        doc(db, "UsersDetail", user.uid),
        snap => {
          const adopted = snap.data()?.adoptedPlants || [];
          setUserAdoptedIds(adopted);
          
          // Set the first plant as active if none is selected
          if (!activePlantId && adopted[0]) setActivePlantId(adopted[0]);

          // Clean up any previous metadata listeners before starting new ones
          plantUnsubs.forEach(u => u());
          plantUnsubs = [];

          // 2. Optimized: One listener for ALL adopted plants
          if (adopted.length > 0) {
            const q = query(
              collection(db, "All_Plants"),
              where("__name__", "in", adopted)
            );

            const metaUnsub = onSnapshot(q, (querySnap) => {
              const newMetadata = {};
              querySnap.forEach((doc) => {
                newMetadata[doc.id] = doc.data();
              });
              
              // Merges new metadata into the state
              setAllMetadata(prev => ({ ...prev, ...newMetadata }));
            }, (error) => {
              console.error("Error fetching plant metadata:", error);
            });

            plantUnsubs.push(metaUnsub);
          }
        }
      );

      // Add the user listener to the cleanup array
      plantUnsubs.push(userUnsub);
    });

    // Cleanup: This runs when the component unmounts
    return () => {
      authUnsub();
      plantUnsubs.forEach(u => u());
    };
  }, [activePlantId]); // Re-runs if activePlantId changes logic requires it

  const sevenDaysAgoTimestamp = useMemo(() => {
    return Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  }, []);


  // Firestore – sensor history
  useEffect(() => {
    if (!activePlantId) return;
    const q = query(
      collection(db, "All_Plants", activePlantId, "sensorData"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => d.data());
      console.log("Fetched sensor history:", data);
      setSensorHistory(data);
    });
    return () => unsub();
  }, [activePlantId]);

  // Scroll nav logic
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setShowNav(!(y > lastScrollY.current && y > 100));
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const enrichedPlants = plants.map(p => {
    const meta = allMetadata[p.id];
    const num = p.id.replace('plant-', '');
    return {
      ...p,
      name: meta?.name ? `Plant ${num} (${meta.name})` : `Plant ${num}`,
      plantType: meta?.plantType || "Specimen"
    };
  });

  const activePlant = enrichedPlants.find(p => p.id === activePlantId);

  return (
    <div className="min-h-screen bg-forest-base text-white relative py-24">
      <div className="container mx-auto px-6 pt-8 relative z-10">
        {activeTab === 'Dashboard' ? (
          <DashboardView
            plants={enrichedPlants}
            mlData={mlData}
            activePlant={activePlant}
            activePlantId={activePlantId}
            sensorHistory={sensorHistory}
            setActivePlantId={setActivePlantId}
            userAdoptedIds={userAdoptedIds}
          />
        ) : (
          <MyPlantsView
            plants={enrichedPlants.filter(p => userAdoptedIds.includes(p.id))}
            mlData={mlData}
          />
        )}
      </div>

      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${showNav ? 'opacity-100' : 'opacity-0 translate-y-24'}`}>
        <div className="flex items-center gap-2 bg-forest-surface/90 backdrop-blur-xl p-2 rounded-full border border-forest-border">
          <NavButton icon={LayoutDashboard} label="Dashboard" isActive={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavButton icon={Leaf} label="My Plants" isActive={activeTab === 'My Plants'} onClick={() => setActiveTab('My Plants')} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

const NavButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300
      ${isActive ? 'bg-forest-accent text-forest-base' : 'text-forest-muted hover:text-white hover:bg-forest-highlight'}`}
  >
    <Icon size={20} /> {label}
  </button>
);

export default Dashboard;
