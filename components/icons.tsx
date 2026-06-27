/**
 * SVG stroke icons, size controlled by prop. Decorative by default
 * (aria-hidden); adjacent text provides the accessible name.
 */

type Props = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const ChevronIcon = ({
  size = 16,
  className,
  open = false,
}: Props & { open?: boolean }) => (
  <svg
    {...base(size)}
    className={className}
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const SwordIcon = ({ size = 18, className }: Props) => (
  <svg {...base(size)} className={className}>
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
  </svg>
);

export const DragonIcon = ({ size = 18, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M12 2 14 7l5-2-2 5 5 2-5 2 2 5-5-2-2 5-2-5-5 2 2-5-5-2 5-2-2-5 5 2z" />
  </svg>
);

export const MountainIcon = ({ size = 18, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M8 3l4 8 5-5 2 15H2L8 3z" />
  </svg>
);

export const GemIcon = ({ size = 18, className }: Props) => (
  <svg {...base(size)} className={className}>
    <polygon points="6 3 18 3 22 9 12 22 2 9" />
    <line x1="2" y1="9" x2="22" y2="9" />
    <line x1="12" y1="22" x2="6" y2="3" />
    <line x1="12" y1="22" x2="18" y2="3" />
  </svg>
);

export const MapIcon = ({ size = 18, className }: Props) => (
  <svg {...base(size)} className={className}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

export const HammerIcon = ({ size = 18, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M15 12l-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9" />
    <path d="M17.64 15 22 10.64l-5.36-5.36a2 2 0 0 0-2.83 0L9.6 9.49 14.5 14.4l3.14.6z" />
  </svg>
);

export const CommunityIcon = ({ size = 18, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const PlusIcon = ({ size = 16, className }: Props) => (
  <svg {...base(size)} className={className} strokeWidth={2.5}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const TrashIcon = ({ size = 14, className }: Props) => (
  <svg {...base(size)} className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const EditIcon = ({ size = 16, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
  </svg>
);

export const RulerIcon = ({ size = 16, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="m4 17 13-13 3 3L7 20H4Z" />
    <path d="m14 7 3 3M11 10l2 2M8 13l3 3" />
  </svg>
);

export const DownloadIcon = ({ size = 16, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const UploadIcon = ({ size = 16, className }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const SessionsIcon = ({ size = 16, className }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 4V2h12a2 2 0 0 1 2 2v12h-2" />
    <path d="M9 9h6M9 13h6M9 17h3" />
  </svg>
);

export const DiceIcon = ({ size = 20, className }: Props) => (
  <svg {...base(size)} className={className} strokeWidth={1.5}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
    <circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" />
    <circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" />
    <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </svg>
);

/**
 * Brand mark for Dagacorazón: a dagger whose central circle reads as the
 * pommel rivet, the map pin's eye, and the "corazón", while the swept guard
 * wings echo the folded "M" of the map marker. Drawn with the same geometric
 * stroke technique on a 100x100 canvas.
 */
export const LogoIcon = ({ size = 26, className }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth={4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className={className}
  >
    <line x1="43" y1="14" x2="57" y2="14" />
    <line x1="50" y1="15" x2="50" y2="33" />
    <path d="M50 36 Q33 35 25 45" />
    <path d="M50 36 Q67 35 75 45" />
    <circle cx="50" cy="39" r="6" />
    <polygon points="41,45 59,45 50,93" />
    <line x1="50" y1="48" x2="50" y2="84" />
  </svg>
);

export const ImageIcon = ({ size = 16, className }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const GoogleIcon = ({ size = 18, className }: Props) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className}>
    <path
      fill="currentColor"
      d="M21.35 11.1H12v2.96h5.35c-.5 2.5-2.62 3.94-5.35 3.94a5.99 5.99 0 1 1 0-12 5.7 5.7 0 0 1 4.05 1.58l2.2-2.2A8.94 8.94 0 0 0 12 3a9 9 0 1 0 0 18c4.64 0 8.64-3.27 8.64-9 0-.3-.13-.6-.29-.9z"
    />
  </svg>
);
