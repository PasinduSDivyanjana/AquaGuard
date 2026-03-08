export default function HeroGraphic() {
  return (
    <div className="relative w-full max-w-md mx-auto h-48 sm:h-56 flex items-center justify-center mb-8">
      {/* Water well + drops illustration */}
      <svg
        viewBox="0 0 200 120"
        className="w-full h-full text-ocean-500/90 drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground / well base */}
        <ellipse cx="100" cy="95" rx="55" ry="12" fill="currentColor" opacity="0.2" />
        <rect x="72" y="45" width="56" height="52" rx="4" stroke="currentColor" strokeWidth="3" opacity="0.5" />
        <rect x="78" y="51" width="44" height="40" rx="2" fill="currentColor" opacity="0.15" />
        {/* Well roof */}
        <path d="M65 45 L100 25 L135 45" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.6" />
        {/* Water drops */}
        <ellipse cx="58" cy="52" rx="6" ry="8" fill="currentColor" opacity="0.4" className="animate-[bounce_2s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
        <ellipse cx="142" cy="48" rx="5" ry="7" fill="currentColor" opacity="0.35" className="animate-[bounce_2s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }} />
        <ellipse cx="100" cy="38" rx="4" ry="6" fill="currentColor" opacity="0.3" className="animate-[bounce_2s_ease-in-out_infinite]" style={{ animationDelay: '0.6s' }} />
        {/* Ripple */}
        <circle cx="100" cy="75" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.25" />
        <circle cx="100" cy="75" r="12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.15" />
      </svg>
    </div>
  );
}
