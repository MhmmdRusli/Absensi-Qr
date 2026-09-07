// Kumpulan icon inline SVG (tanpa dependency font/library eksternal)
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const IconDashboard = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
export const IconStudents = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M12 3 2 8l10 5 10-5-10-5Z" /><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
  </svg>
);
export const IconTeachers = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <circle cx="12" cy="8" r="3.2" /><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
  </svg>
);
export const IconClasses = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 4v16" />
  </svg>
);
export const IconSubjects = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z" /><path d="M4 4.5v17" />
  </svg>
);
export const IconReports = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M4 20V10M12 20V4M20 20v-7" />
  </svg>
);
export const IconLogout = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
);
export const IconCalendar = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
export const IconBell = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);
export const IconHelp = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <circle cx="12" cy="12" r="9" /><path d="M9.5 9.2c.3-1.3 1.3-2.1 2.6-2.1 1.4 0 2.5.9 2.5 2.1 0 1.6-2.4 1.7-2.4 3.6" /><path d="M12 17h.01" />
  </svg>
);
export const IconChevronDown = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconChevronRight = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>
);
export const IconUsers = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <circle cx="9" cy="8" r="3" /><path d="M2.5 20c1-3.2 3.4-5 6.5-5s5.5 1.8 6.5 5" />
    <circle cx="17.5" cy="8.5" r="2.3" /><path d="M15.5 13.2c2.4.2 4 1.8 4.8 4.3" />
  </svg>
);
export const IconCheckCircle = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.3 2.3 4.7-5.1" />
  </svg>
);
export const IconQr = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v7M14 20h3" />
  </svg>
);
export const IconDownload = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 19h16" />
  </svg>
);
export const IconPersonAdd = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c1-3.4 3.4-5.3 6.5-5.3s5.5 1.9 6.5 5.3" /><path d="M18 8v6M15 11h6" />
  </svg>
);
export const IconTrendingUp = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" />
  </svg>
);
export const IconSync = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M21 3v5h-5M3 21v-5h5" />
  </svg>
);
export const IconClock = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...base} {...p}>
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
  </svg>
);
export const IconChevronLeft = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}><path d="m15 6-6 6 6 6" /></svg>
);