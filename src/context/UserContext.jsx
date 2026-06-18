import {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

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
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("JWT_ACCESS_TOKEN"));

    const logout = () => {
        localStorage.removeItem("JWT_TOKEN");
        localStorage.removeItem("JWT_ACCESS_TOKEN");
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuth(false);
        navigate("/");
    };

    const getApiUrl = () => {
        let url = import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api/";
        if (!url.endsWith("/api/")) {
            url = url.endsWith("/") ? `${url}api/` : `${url}/api/`;
        }
        return url;
    };

    const apiUrl = getApiUrl();

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("JWT_TOKEN");
            const access_token = localStorage.getItem("JWT_ACCESS_TOKEN");

            if (!token || !access_token) return;

            const res = await fetch(`${apiUrl}users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-refresh-token": access_token,
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
        if (!token || !refreshToken) {
            setIsAuth(false);
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${apiUrl}auth/verify`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({token}),
            });

            if (!res.ok) throw new Error();

            setIsAuth(true);
            await fetchUser();

        } catch {
            try {
                const res = await fetch(`${apiUrl}auth/refresh`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({refreshToken}),
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
    }, [token]);

    return (
        <UserContext.Provider
            value={{isAuth, setIsAuth, user, setUser, token, refreshToken, setToken, setRefreshToken, loading, logout, fetchUser}}
        >
            {children}
        </UserContext.Provider>
    );
};