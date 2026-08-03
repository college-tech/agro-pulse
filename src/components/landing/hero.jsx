import {React,useEffect} from 'react'
import { Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Hero from "../../../public/images/hero.png"
import { useAuth } from "../../contexts/AuthContext";

const hero = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  return (
    <>
    {/* --- HERO SECTION --- */}
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src = {Hero}
            alt="Deep Forest"
          className="w-full h-full object-cover"
        />
        {/* Updated Gradient: Blends from dark overlay down into the solid forest-base color */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-forest-base/30 to-forest-base"></div>
      </div>
      <div className="relative z-10 text-center px-6 sm:px-4 max-w-5xl mx-auto">
        {/* Updated Badge styling for dark theme */}
        <span className="inline-block py-1 px-3 rounded-full bg-forest-surface/80 border border-forest-accent/30 text-forest-accent text-sm font-semibold mb-6 backdrop-blur-md">
          EVERY TREE TELLS A STORY
        </span>
        
        <h1 className="text-3xl md:text-4xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
          Preserving <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-forest-accent to-emerald-300">Nature</span> for the <br/>
          {/* Updated text gradient using the new accent */}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-forest-accent to-emerald-300">Next Generation</span>
        </h1>
        
        <p className="text-forest-text text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light drop-shadow-md">
          “Join our large movement toward protecting our planet’s green lungs by digitally monitoring, adopting, and safeguarding them using advanced IoT sensors and machine learning.”
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          {/* Updated Button: Accent background with dark text for contrast, and matching shadow */}
          <button onClick={() => { if (currentUser) navigate('/adopt'); else navigate('/login'); }}  className="bg-forest-accent hover:bg-emerald-400 text-forest-base px-8 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(74,222,128,0.4)] cursor-pointer">
            Start Adopting trees <Leaf size={20} strokeWidth={2.5} />
          </button>
        </div>
         
      </div>
    </section>
    </>
  )
}

export default hero