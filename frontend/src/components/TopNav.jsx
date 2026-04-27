import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Icon from "./Icon";

const TopNav = () => {
  const { user } = useAuth();
  const { theme, accent, setAccent } = useTheme();

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

      <div className="topnav-right">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="caption" style={{ marginRight: 6 }}>Accent</span>
          <div className="accent-presets" role="toolbar" aria-label="Theme accents">
            <button
              type="button"
              title="Ocean"
              className={`preset ocean ${accent === "ocean" ? "is-active" : ""}`}
              onClick={() => setAccent("ocean")}
              aria-pressed={accent === "ocean"}
            />
            <button
              type="button"
              title="Emerald"
              className={`preset emerald ${accent === "emerald" ? "is-active" : ""}`}
              onClick={() => setAccent("emerald")}
              aria-pressed={accent === "emerald"}
            />
            <button
              type="button"
              title="Graphite"
              className={`preset graphite ${accent === "graphite" ? "is-active" : ""}`}
              onClick={() => setAccent("graphite")}
              aria-pressed={accent === "graphite"}
            />
          </div>
        </div>

        <div className="topnav-user">
          <span className="caption">{user?.name || "User"}</span>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
