interface UnitTileIconProps {
  stationType: string;
  className?: string;
}

export default function UnitTileIcon({
  stationType,
  className = "h-8 w-8",
}: UnitTileIconProps) {
  if (stationType === "conveyor") {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="4" y="12" width="24" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
        <path d="M8 16h4M14 16h4M20 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="22" r="2" fill="currentColor" />
        <circle cx="24" cy="22" r="2" fill="currentColor" />
      </svg>
    );
  }

  if (stationType === "robot_arm") {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="14" y="18" width="4" height="10" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 8v10M16 8l-6 4M16 8l6 4M10 12v4M22 12v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="8" r="2" fill="currentColor" />
      </svg>
    );
  }

  if (stationType === "inspection") {
    return (
      <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="14" r="8" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <path d="M12 14l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="10" y="22" width="12" height="4" rx="1" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="8" y="8" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
