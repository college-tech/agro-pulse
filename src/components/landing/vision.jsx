import React from 'react';
import { Cpu, Users, ShieldCheck } from 'lucide-react';
import Photo from "../../../public/images/greenry_with_iot.png"

const Vision = () => {
  return (
    <section id="our-vision" className="py-24 bg-forest-base relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-forest-surface/40 via-forest-base to-forest-base -z-10"></div>

      <div className="container mx-auto px-15">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Our Working Vision</h2>
          <p className="text-forest-muted max-w-2xl mx-auto">
            To create a scalable digital platform that monitors every plant’s health and exact location using advanced IoT sensing and ML analytics. The system enables communities and organizations to safeguard green environments through transparent, continuous, and automated monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Big Feature Block */}
          <div className="lg:col-span-2 row-span-2 bg-forest-border border border-forest-border rounded-3xl p-10 relative overflow-hidden group">
            <img src={Photo}
            //   src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop" 
              alt="Forest Tech"
              className="absolute inset-0 w-full h-full object-cover   group-hover:scale-105 transition-all duration-700 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-base via-transparent to-transparent"></div>
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="bg-forest-highlight border border-forest-border w-fit p-3 rounded-xl mb-4 text-forest-accent">
                <Cpu size={32} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Smart IoT and Machine Learning</h3>
              <p className="text-forest-muted text-lg max-w-lg">
                Deploy a distributed network of IoT sensors to continuously capture soil moisture, temperature, and related environmental signals, stream those features into a machine-learning pipeline, and deliver accurate, timely predictions of plant health and failure risk for automated interventions.
              </p>
            </div>
          </div>

          {/* Smaller Feature 1 */}
          <div className="bg-forest-surface border border-forest-border p-8 rounded-3xl hover:border-forest-accent/50 transition-colors flex flex-col justify-between group">
            <div className="bg-forest-base w-12 h-12 rounded-full flex items-center justify-center text-forest-accent border border-forest-border group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Community First</h4>
              <p className="text-forest-muted text-sm">Empowering local tribes and communities with ownership of the data and the land.</p>
            </div>
          </div>

          {/* Smaller Feature 2 */}
          <div className="bg-forest-surface border border-forest-border p-8 rounded-3xl hover:border-forest-accent/50 transition-colors flex flex-col justify-between group">
            <div className="bg-forest-base w-12 h-12 rounded-full flex items-center justify-center text-forest-accent border border-forest-border group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Long-term Protection</h4>
              <p className="text-forest-muted text-sm">Legal frameworks and digital monitoring to prevent illegal logging.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;