import { useCallback, useMemo, useState } from "react";
import { AuthsContext } from "./AuthsContext";

const AuthsProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userJson = localStorage.getItem("user");

    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = useCallback((resData) => {
    // Change state
    setUser(resData);

    // Store data to localStorage
    localStorage.setItem("user", JSON.stringify(resData));

  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const contextValues = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout],
  );

  return (
    <AuthsContext.Provider value={contextValues}>
      {children}
    </AuthsContext.Provider>
  );
};

export default AuthsProvider;
