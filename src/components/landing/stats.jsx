import React from 'react'
import { User, Leaf, Heart, Trees } from 'lucide-react';

const stats = ({ totalPlants, activeGuardians, adoptedCount }) => {
  return (
    <>
    {/* --- STATS SECTION (Square Boxes) --- */}
      <section className="py-12 sm:py-16 md:py-20 bg-forest-base relative -mt-4 z-20 rounded-t-[3rem] border-t border-forest-surface/50">
      <div className="container mx-auto px-6 sm:px-15">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Box 1 */}
          <div className="bg-forest-surface border border-forest-border p-4 sm:p-6 md:p-10 rounded-3xl hover:bg-forest-highlight transition-all text-center group">
            <div className="bg-forest-base w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-forest-accent border border-forest-border group-hover:scale-110 transition-transform">
              <User size={24} sm:size={32} />
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">{activeGuardians}</h3>
            <p className="text-forest-muted text-lg uppercase tracking-wider font-medium">Active Guardians</p>
          </div>

          {/* Box 2 (Highlighted) */}
          <div className="bg-forest-highlight border border-forest-accent/30 p-4 sm:p-6 md:p-10 rounded-3xl transition-all text-center relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Leaf size={120} />
            </div>
            <div className="bg-forest-accent w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-forest-base shadow-lg relative z-10 group-hover:rotate-12 transition-transform">
              <Leaf size={24} sm:size={32} />
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 relative z-10">{totalPlants}</h3>
            <p className="text-white/80 text-lg uppercase tracking-wider font-medium relative z-10">Total Plants</p>
          </div>

          {/* Box 3 */}
          <div className="bg-forest-surface border border-forest-border p-4 sm:p-6 md:p-10 rounded-3xl hover:bg-forest-highlight transition-all text-center group">
            <div className="bg-forest-base w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-400 border border-forest-border group-hover:scale-110 transition-transform">
              <Heart size={24} sm:size={32} />
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">{adoptedCount}</h3>
            <p className="text-forest-muted text-lg uppercase tracking-wider font-medium">Adopted Plants</p>
          </div>

        </div>
      </div>
    </section>
    </>
  )
}

export default stats