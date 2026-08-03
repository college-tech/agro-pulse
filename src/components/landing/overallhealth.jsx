import React from 'react'
import { Activity, CheckCircle, AlertTriangle } from 'lucide-react';

const overallhealth = ({ healthCounts = { thriving: 0, moderate: 0, critical: 0 } }) => {
  const { thriving, moderate, critical } = healthCounts;
  const total = thriving + moderate + critical || 1;

  const thrivingPct = Math.round((thriving / total) * 100);
  const moderatePct = Math.round((moderate / total) * 100);
  const criticalPct = Math.round((critical / total) * 100);

  // SVG Offsets
  const offsetThriving = 0? 450 :440 - (440 * thrivingPct) / 100;
  const offsetModerate = 0? 450 :440 - (440 * moderatePct) / 100;
  const offsetCritical = 0? 450 :440 - (440 * criticalPct) / 100;
  return (
    <>
      {/* --- NEW SECTION: HEALTH MONITOR (Percentage Representation) --- */}
      <section className="py-16 sm:py-20 md:py-24 bg-forest-base text-white relative border-t border-forest-surface">
        <div className="container mx-auto px-15">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <div className="flex items-center gap-2 text-forest-accent mb-2">
                <Activity size={20} />
                <span className="uppercase tracking-widest font-bold text-sm">Real-time Analytics</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Ecological Health Index</h2>
            </div>
            <p className="text-forest-muted max-w-md mt-4 md:mt-0 text-right">
              Based on sensors captured datas and ML predictions updated in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Thriving */}
            <div className="bg-forest-surface border border-forest-border p-8 rounded-3xl relative overflow-hidden group hover:bg-forest-highlight transition-colors">
              <div className="absolute top-0 right-0 p-20 bg-forest-accent/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-white">Thriving</h3>
                  <p className="text-forest-accent text-sm">Optimal growth</p>
                </div>
                <CheckCircle className="text-forest-accent" size={28} />
              </div>

              <div className="relative w-40 h-40 mx-auto my-6 z-10">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-forest-base" />
                  <circle 
                    cx="80" cy="80" r="70" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray="440" 
                    strokeDashoffset={offsetThriving} 
                    className="text-forest-accent transition-all duration-1000 ease-out" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{thrivingPct}%</span>
                </div>
              </div>
              <p className="text-center text-sm text-forest-muted relative z-10">System-wide status</p>
            </div>

            {/* Card 2: Moderate */}
            <div className="bg-forest-surface border border-forest-border p-8 rounded-3xl relative overflow-hidden group hover:bg-forest-highlight transition-colors">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white">Moderate</h3>
                  <p className="text-yellow-400/80 text-sm">Stable condition</p>
                </div>
                <Activity className="text-yellow-400" size={28} />
              </div>

              <div className="relative w-40 h-40 mx-auto my-6">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-forest-base" />
                  <circle 
                    cx="80" cy="80" r="70" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray="440" 
                    strokeDashoffset={offsetModerate} 
                    className="text-yellow-400 transition-all duration-1000 ease-out" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{moderatePct}%</span>
                </div>
              </div>
              <p className="text-center text-sm text-forest-muted">Monitoring hydration</p>
            </div>

            {/* Card 3: Needs Care */}
            <div className="bg-forest-surface border border-forest-border p-8 rounded-3xl relative overflow-hidden group hover:bg-forest-highlight transition-colors">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white">Needs Care</h3>
                  <p className="text-rose-400/80 text-sm">Action required</p>
                </div>
                <AlertTriangle className="text-rose-500" size={28} />
              </div>

              <div className="relative w-40 h-40 mx-auto my-6">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-forest-base" />
                  <circle 
                    cx="80" cy="80" r="70" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray="440" 
                    strokeDashoffset={offsetCritical} 
                    className="text-rose-500 transition-all duration-1000 ease-out" 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{criticalPct}%</span>
                </div>
              </div>
              <p className="text-center text-sm text-forest-muted">Maintenance alert active</p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default overallhealth