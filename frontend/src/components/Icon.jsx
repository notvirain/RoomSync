import React from "react";

const Icon = ({ name, size = 20, className = "" }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className };

  switch (name) {
    case "group":
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3z" />
          <path d="M6 11c1.66 0 2.99-1.34 2.99-3S7.66 5 6 5 3 6.34 3 8s1.34 3 3 3z" />
          <path d="M6 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5C13 14.17 8.33 13 6 13zM16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.96 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-6-3.5z" />
        </svg>
      );
    case "empty":
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="14" rx="2" />
          <path d="M8 21h8" />
        </svg>
      );
    case "search":
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="6" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    case "spark":
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.94 4.94l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.94 19.06l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      );
    default:
      return (
        <svg {...props} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

export default Icon;
