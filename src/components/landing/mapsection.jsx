import React from 'react'
import { Globe, ArrowRight, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mapsection = () => {
  const navigate = useNavigate();

  const handleOpenMap = () => {
    navigate('/map');
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' // Optional: for a smooth scroll effect
    });
  };

  return (
    <>
    {/* --- MAP SECTION --- */}
      <section id="community-map" className="py-16 sm:py-20 md:py-24 bg-forest-base relative overflow-hidden">
      {/* Decorative blobs adjusted for dark mode */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-forest-surface rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="container mx-auto px-6 sm:px-15 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-16">
          <div className="lg:w-1/2">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="text-forest-accent" size={20} />
              <span className="text-forest-accent font-bold uppercase tracking-widest text-sm">Global Tracking</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Every Tree Has a <span className="text-forest-accent">Story</span> and a <span className="text-forest-accent">Location</span>
            </h2>
            <div className="border-l-4 border-forest-accent pl-6 mb-8">
              <p className="text-xl font-medium text-forest-text italic">
                "Open the map to see locations of plants and witness the impact of our collective effort."
              </p>
            </div>
            <button onClick={handleOpenMap} className="group bg-forest-surface border border-forest-border text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-lg font-semibold hover:bg-forest-highlight transition-all flex items-center gap-3 shadow-xl cursor-pointer">
              Open Live Map
              <div className="bg-forest-accent/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
                <ArrowRight size={18} className="text-forest-accent"/>
              </div>
            </button>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="relative rounded-[2rem] overflow-hidden border-4 border-forest-surface shadow-2xl h-[250px] sm:h-[350px] md:h-[400px]">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop" 
                alt="Map Interface" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-forest-base/20 flex items-center justify-center">
                <button onClick={handleOpenMap} className="bg-forest-surface/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg flex items-center gap-2 border border-forest-border hover:bg-forest-highlight transition-all cursor-pointer">
                  <MapIcon className="text-forest-accent" />
                  <span className="font-bold text-white">Explore Locations</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

export default mapsection