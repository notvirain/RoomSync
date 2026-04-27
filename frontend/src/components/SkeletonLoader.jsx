import React from "react";

const SkeletonLoader = ({ variant = "card", lines = 3 }) => {
  if (variant === "list") {
    return (
      <div className="skeleton-list">
        {Array.from({ length: lines }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="skeleton skeleton-line" style={{ ['--i']: i }} />
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-rect" style={{ ['--i']: 0 }} />
      <div className="skeleton skeleton-line" style={{ ['--i']: 1 }} />
      <div className="skeleton skeleton-line" style={{ ['--i']: 2 }} />
    </div>
  );
};

export default SkeletonLoader;
