export default function HeroGraphic() {
  return (
    <div className="relative z-[1] w-full max-w-md mx-auto h-52 sm:h-60 flex items-center justify-center">
      <svg
        viewBox="0 0 200 120"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 18px 28px rgba(0, 0, 0, 0.35))' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="95" rx="55" ry="12" fill="rgba(245,189,39,0.18)" />
        <rect x="72" y="45" width="56" height="52" rx="4" stroke="rgba(23,139,150,0.8)" strokeWidth="3" />
        <rect x="78" y="51" width="44" height="40" rx="2" fill="rgba(23,139,150,0.2)" />
        <path d="M65 45 L100 25 L135 45" stroke="rgba(245,189,39,0.8)" strokeWidth="2.5" fill="none" />
        <ellipse cx="58" cy="52" rx="6" ry="8" fill="rgba(75,218,127,0.7)" className="animate-[bounce_2s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
        <ellipse cx="142" cy="48" rx="5" ry="7" fill="rgba(202,97,98,0.7)" className="animate-[bounce_2s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }} />
        <ellipse cx="100" cy="38" rx="4" ry="6" fill="rgba(245,189,39,0.75)" className="animate-[bounce_2s_ease-in-out_infinite]" style={{ animationDelay: '0.6s' }} />
        <circle cx="100" cy="75" r="8" stroke="rgba(245,189,39,0.5)" strokeWidth="1.5" fill="none" />
        <circle cx="100" cy="75" r="12" stroke="rgba(245,189,39,0.28)" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}
