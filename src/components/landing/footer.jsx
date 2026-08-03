import React from 'react'
import { Trees, ArrowRight } from 'lucide-react';
import Logo from "../../../public/images/logo.png"


const footer = () => {
  return (
    <>
    {/* --- FOOTER --- */}
      <footer className="bg-forest-base border-t border-forest-surface pt-12 pb-6 sm:pt-16 sm:pb-8 text-forest-muted">
      <div className="container mx-auto px-6 sm:px-15">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
           {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-transparent  rounded-lg text-white">
              <img src={Logo} alt="" className='w-12 rounded-4xl bg-transparent' />
            </div>
              <span className="text-xl font-bold text-white">AgroPulse</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Dedicated to reforestation and the protection of biodiversity through technology and community action.
            </p>
            </div>

            {/* Links */}
            <div>
                <h4 className="text-white font-bold mb-6">Platform</h4>
                <ul className="space-y-3 text-sm">
                <li className="hover:text-forest-accent cursor-pointer transition-colors">Open Map</li>
                <li className="hover:text-forest-accent cursor-pointer transition-colors">Adoption Program</li>
                <li className="hover:text-forest-accent cursor-pointer transition-colors">Impact Reports</li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold mb-6">Company</h4>
                <ul className="space-y-3 text-sm">
                <li className="hover:text-forest-accent cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-forest-accent cursor-pointer transition-colors">Inspiration</li>
                <li className="hover:text-forest-accent cursor-pointer transition-colors">Contact</li>
                </ul>
            </div>

            {/* Newsletter */}
            <div>
                <h4 className="text-white font-bold mb-6">Stay Updated</h4>
                <div className="flex bg-forest-surface border border-forest-border p-1 rounded-lg">
                <input
                    type="email"
                    placeholder="Email address"
                    className="bg-transparent px-2 py-2 sm:px-3 sm:py-2 text-sm w-full focus:outline-none text-white placeholder-forest-muted"
                />
                <button className="bg-forest-accent hover:bg-emerald-400 text-forest-base p-1 sm:p-2 rounded-md transition-colors">
                    <ArrowRight size={16} />
                </button>
                </div>
            </div>

          </div>

          <div className="border-t border-forest-surface pt-8 flex flex-col md:flex-row justify-center items-center text-xs">
            <p>&copy; 2025 EcoGuard Management. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6 mt-4 md:mt-0">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default footer