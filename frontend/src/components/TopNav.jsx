import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Icon from "./Icon";

const TopNav = () => {
  const { user } = useAuth();
  const { theme, setAccent } = useTheme();

  return (
    <div className="topnav">
      <div className="topnav-left">
        <div className="topnav-brand">
          <Icon name="spark" size={18} />
          <span className="brand-label">RoomSync</span>
        </div>
        <nav className="topnav-pages" aria-label="Primary">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/groups">Groups</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </div>

      <div className="topnav-right">
        <div className="accent-presets">
          <button type="button" className="preset ocean" onClick={() => setAccent("ocean")} aria-label="Ocean preset" />
          <button type="button" className="preset emerald" onClick={() => setAccent("emerald")} aria-label="Emerald preset" />
          <button type="button" className="preset graphite" onClick={() => setAccent("graphite")} aria-label="Graphite preset" />
        </div>

        <div className="topnav-user">
          <span className="caption">{user?.name || "User"}</span>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
