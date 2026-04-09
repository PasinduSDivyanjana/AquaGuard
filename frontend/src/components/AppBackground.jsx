export default function AppBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 82% -8%, rgba(23,139,150,0.24), transparent 42%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 14% 85%, rgba(202,97,98,0.16), transparent 45%)' }} />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full" style={{ background: 'rgba(23,139,150,0.2)', filter: 'blur(70px)' }} />
      <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full" style={{ background: 'rgba(245,189,39,0.12)', filter: 'blur(70px)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-32 w-full">
        <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" fill="none">
          <path d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,96 1440,64 L1440,120 L0,120 Z" fill="rgba(23,139,150,0.08)" />
          <path d="M0,80 C240,40 480,100 720,80 C960,60 1200,100 1440,80 L1440,120 L0,120 Z" fill="rgba(245,189,39,0.06)" />
        </svg>
      </div>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(245,189,39,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(245,189,39,0.5) 1px, transparent 1px)`,
          backgroundSize: '52px 52px',
        }}
      />
    </div>
  );
}
