// Minimal dependency-free icon set. Stroke-based, 20x20, currentColor.
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconPlus = (p) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconUpload = (p) => (
  <svg {...base} {...p}><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
);
export const IconLogout = (p) => (
  <svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
);
export const IconArrowLeft = (p) => (
  <svg {...base} {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
);
export const IconShare = (p) => (
  <svg {...base} {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 10.5 15.4 6.5M8.6 13.5l6.8 4" /></svg>
);
export const IconCheck = (p) => (
  <svg {...base} {...p}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconAlert = (p) => (
  <svg {...base} {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
);
export const IconFile = (p) => (
  <svg {...base} {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
);
export const IconTrash = (p) => (
  <svg {...base} {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" /></svg>
);

// Editor toolbar icons
export const IconBold = (p) => (
  <svg {...base} {...p}><path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" /></svg>
);
export const IconItalic = (p) => (
  <svg {...base} {...p}><path d="M19 4h-9M5 20h9M15 4 9 20" /></svg>
);
export const IconUnderline = (p) => (
  <svg {...base} {...p}><path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" /></svg>
);
export const IconH1 = (p) => (
  <svg {...base} {...p}><path d="M4 6v12M12 6v12M4 12h8M17 18v-8l-2.5 2" /></svg>
);
export const IconH2 = (p) => (
  <svg {...base} {...p}><path d="M4 6v12M12 6v12M4 12h8M15 10.5a2.5 2.5 0 0 1 4.9-.8c0 1.8-4.9 3.3-4.9 6.3h5" /></svg>
);
export const IconBulletList = (p) => (
  <svg {...base} {...p}><circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" /><path d="M9 6h11M9 12h11M9 18h11" /></svg>
);
export const IconOrderedList = (p) => (
  <svg {...base} {...p}><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 5v3M4 5l-1 .5M4 14a1 1 0 1 1 1.3 1L4 16.3V17h1.5M4 17H4" /></svg>
);
