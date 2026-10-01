/** Decorative icons: the control that holds one carries the accessible name. */
const base = {
  "viewBox": "0 0 24 24",
  "fill": "none",
  "stroke": "currentColor",
  "strokeWidth": 2,
  "strokeLinecap": "round" as const,
  "strokeLinejoin": "round" as const,
  "aria-hidden": true,
  "focusable": false,
};

export const CloseIcon = () => (
  <svg {...base}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const PreviousIcon = () => (
  <svg {...base}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const NextIcon = () => (
  <svg {...base}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const PauseIcon = () => (
  <svg {...base}>
    <line x1="9" y1="5" x2="9" y2="19" />
    <line x1="15" y1="5" x2="15" y2="19" />
  </svg>
);

export const PlayIcon = () => (
  <svg {...base} fill="currentColor" stroke="none">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

export const ZoomIcon = () => (
  <svg {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);
