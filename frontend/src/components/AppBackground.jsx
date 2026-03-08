export default function AppBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero" />
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-ocean-300/25 blur-3xl" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-ocean-400/20 blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full bg-ocean-200/20 blur-3xl" />
      {/* Bottom waves SVG */}
      <div className="absolute bottom-0 left-0 right-0 h-32 w-full">
        <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full h-full text-ocean-500/10" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,96 1440,64 L1440,120 L0,120 Z" />
          <path d="M0,80 C240,40 480,100 720,80 C960,60 1200,100 1440,80 L1440,120 L0,120 Z" opacity="0.7" />
        </svg>
      </div>
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.6) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(6,182,212,0.6) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
