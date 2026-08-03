import React from 'react'

const inspiration = () => {
    const quotes = [
    { q: "The clearest way into the Universe is through a forest wilderness.", a: "John Muir" },
    { q: "He that plants trees loves others besides himself.", a: "Thomas Fuller" },
    { q: "Time spent among trees is never time wasted.", a: "Katrina Mayer" }
  ];
  return (
    <>
    {/* --- INSPIRATION / QUOTES --- */}
      <section id="thoughts" className="py-24 bg-forest-base text-white relative border-t border-forest-surface">
      <div className="container mx-auto px-6 sm:px-15">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Nature's Wisdom</h2>
          <div className="w-24 h-1 bg-forest-accent mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {quotes.map((item, idx) => (
            <div
              key={idx}
              className="bg-forest-surface border border-forest-border p-4 sm:p-6 md:p-8 rounded-2xl hover:-translate-y-2 hover:border-forest-accent/30 transition-all duration-300 relative group"
            >
              {/* Decorative Quote Mark */}
              <span className="absolute top-4 left-4 text-4xl sm:text-5xl md:text-6xl text-forest-base font-serif opacity-50 group-hover:text-forest-highlight transition-colors">"</span>
              
              <p className="text-lg text-forest-text italic mb-6 font-light relative z-10 pt-4">
                {item.q}
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <div className="h-px w-8 bg-forest-accent/50"></div>
                <span className="font-semibold text-forest-accent block text-right">{item.a}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}

export default inspiration