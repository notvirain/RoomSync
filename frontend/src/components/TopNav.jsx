import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";

const TopNav = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  return (
    <>
      <div className="topnav">
        <nav className="topnav-pages" aria-label="Primary">
          <Link to="/dashboard" className="animate-hover">Dashboard</Link>
          <Link to="/groups" className="animate-hover">Groups</Link>
          <Link to="/profile" className="animate-hover">Profile</Link>
        </nav>

        <div className="topnav-center">
          <div className="search-box">
            <Icon name="search" size={18} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search expenses or members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TopNav;
