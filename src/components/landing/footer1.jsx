import React from 'react'
import { Trees, ArrowRight } from 'lucide-react';
import Logo from "../../../public/images/logo.png"


const footer = () => {
  return (
    <>
    {/* --- FOOTER --- */}
      <footer className="bg-forest-base border-t border-forest-surface pt-2 pb-1 lg:pt-4 lg:pb-3 text-forest-muted">
      <div className="container mx-auto px-15">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 ">
            
           {/* Brand */}    
          <div className="col-span-1 md:col-span-1 ">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-transparent  rounded-lg text-white">
                <img src={Logo} alt="logo" className='w-10 rounded-4xl bg-transparent' />
              </div>
              <span className="text-sm font-bold text-white">AgroPulse</span>
            </div>
            </div>

            {/* Links */}
            <div >
                {/* <h4 className="text-white font-bold mb-2">Platform</h4> */}
                <ul className="space-y-3 text-sm flex flex-row gap-6">
                <li className="hover:text-forest-accent cursor-pointer transition-colors">Open Map</li>
                <li className="hover:text-forest-accent cursor-pointer transition-colors">Adoption Program</li>
                <li className="hover:text-forest-accent cursor-pointer transition-colors">Impact Reports</li>
                </ul>
            </div>

            <div>
                {/* <h4 className="text-white font-bold mb-2">Company</h4> */}
                <ul className="space-y-3 text-sm flex flex-row gap-6">
                <li className="hover:text-forest-accent cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-forest-accent cursor-pointer transition-colors">Inspiration</li>
                <li className="hover:text-forest-accent cursor-pointer transition-colors">Contact</li>
                </ul>
            </div>

          </div>
            <p className="text-sm leading-relaxed mb-1 text-center">
                Dedicated to reforestation and the protection of biodiversity through technology and community action.
            </p>

          <div className="border-t border-forest-surface pt-2 flex flex-col md:flex-row justify-center items-center text-xs">
            <p>&copy; 2025 EcoGuard Management. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
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