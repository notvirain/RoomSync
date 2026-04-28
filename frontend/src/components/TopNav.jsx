import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const TopNav = () => {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="topnav">
      <div className="topnav-left">
        <div className="topnav-brand animate-fluid" title="RoomSync">
          <Icon name="spark" size={18} />
          <span className="brand-label">RoomSync</span>
        </div>
        <nav className="topnav-pages" aria-label="Primary">
          <Link to="/dashboard" className="animate-hover">Dashboard</Link>
          <Link to="/groups" className="animate-hover">Groups</Link>
          <Link to="/profile" className="animate-hover">Profile</Link>
        </nav>
      </div>

      <div className="topnav-center">
        <div className={`search-box ${searchOpen ? "is-open" : ""}`}>
          <button
            type="button"
            className="search-toggle"
            onClick={handleSearchToggle}
            aria-label="Search"
            title="Search expenses or members"
          >
            <Icon name="search" size={18} />
          </button>
          {searchOpen && (
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            />
          )}
        </div>
      </div>

      <div className="topnav-right">
        <div className="user-menu-wrapper" ref={userMenuRef}>
          <button
            type="button"
            className="user-avatar"
            onClick={handleUserMenuToggle}
            aria-label={user?.name}
            title={user?.name}
          >
            <span className="avatar-circle">{initials}</span>
          </button>

          {userMenuOpen && (
            <div className="user-dropdown">
              <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                👤 Profile
              </Link>
              <button type="button" className="dropdown-item logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNav;
