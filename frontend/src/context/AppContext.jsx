import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/axios";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState("");

  const fetchGroups = async () => {
    setGroupsLoading(true);
    setGroupsError("");

    try {
      const response = await api.get("/groups");
      setGroups(response.data);
    } catch (err) {
      setGroupsError(err.response?.data?.message || "Failed to load groups");
    } finally {
      setGroupsLoading(false);
    }
  };

  const createGroup = async (name) => {
    const response = await api.post("/groups", { name });
    await fetchGroups();
    return response.data;
  };

  const addMemberToGroup = async (groupId, memberId) => {
    const response = await api.post(`/groups/${groupId}/add-member`, { memberId });
    await fetchGroups();
    return response.data;
  };

  const value = useMemo(
    () => ({
      groups,
      groupsLoading,
      groupsError,
      fetchGroups,
      createGroup,
      addMemberToGroup,
    }),
    [groups, groupsLoading, groupsError]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
