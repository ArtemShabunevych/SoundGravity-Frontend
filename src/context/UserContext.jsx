import {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import { getApiUrl } from "../API/apiClient";

export const UserContext = createContext();

export const UserProvider = ({children}) => {
    const navigate = useNavigate();

    const [isAuth, setIsAuth] = useState  (() => {

        const token = localStorage.getItem("JWT_TOKEN");

        return !!token;
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const [token, setToken] = useState(localStorage.getItem("JWT_TOKEN"));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("JWT_REFRESH_TOKEN"));

    const logout = () => {
        localStorage.removeItem("JWT_TOKEN");
        localStorage.removeItem("JWT_REFRESH_TOKEN");
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuth(false);
        navigate("/");
    };

    const apiUrl = getApiUrl();

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("JWT_TOKEN");
            const refreshToken = localStorage.getItem("JWT_REFRESH_TOKEN");

            if (!token || !refreshToken) return;

            const res = await fetch(`${apiUrl}users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-refresh-token": refreshToken,
                },
            });

            if (!res.ok) throw new Error();

            const data = await res.json();
            setUser(data);

        } catch {
            logout();
        }
    };

    const checkAuth = async () => {
        const currentToken = localStorage.getItem("JWT_TOKEN");
        const currentRefreshToken = localStorage.getItem("JWT_REFRESH_TOKEN");

        if (!currentToken || !currentRefreshToken) {
            setIsAuth(false);
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${apiUrl}auth/verify`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({token: currentToken}),
            });

            if (!res.ok) throw new Error();

            setToken(currentToken);
            setRefreshToken(currentRefreshToken);
            setIsAuth(true);
            await fetchUser();

        } catch {
            try {
                const res = await fetch(`${apiUrl}auth/refresh`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({refreshToken: currentRefreshToken}),
                });

                if (!res.ok) throw new Error();

                const data = await res.json();

                localStorage.setItem("JWT_TOKEN", data.accessToken);
                setToken(data.accessToken);

                setIsAuth(true);
                await fetchUser();
            } catch {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <UserContext.Provider
            value={{isAuth, setIsAuth, user, setUser, token, refreshToken, setToken, setRefreshToken, loading, logout, fetchUser}}
        >
            {children}
        </UserContext.Provider>
    );
};