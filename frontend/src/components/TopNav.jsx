import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

const TopNav = () => {
  const { user } = useAuth();

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
        <span className="topnav-user">{user?.name || "User"}</span>
      </div>
    </div>
  );
};

export default TopNav;
