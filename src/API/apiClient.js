const getApiUrl = () => {
    let url = import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api/";
    if (!url.endsWith("/api/")) {
        url = url.endsWith("/") ? `${url}api/` : `${url}/api/`;
    }
    return url;
};

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
    refreshSubscribers.forEach(cb => cb(newToken));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
    refreshSubscribers.push(cb);
};

export const fetchWithAuth = async (endpoint, options = {}) => {
    const apiUrl = getApiUrl();
    const url = endpoint.startsWith("http") ? endpoint : `${apiUrl}${endpoint.replace(/^\//, "")}`;

    const getToken = () => localStorage.getItem("JWT_TOKEN");
    const getRefreshToken = () => localStorage.getItem("JWT_ACCESS_TOKEN");

    const doFetch = (token) => {
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token || getToken()}`,
                "x-refresh-token": getRefreshToken() || "",
            },
        });
    };

    let res = await doFetch();

    if (res.status === 401) {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error("Unauthorized");
        }

        if (isRefreshing) {
            return new Promise((resolve) => {
                addRefreshSubscriber((newToken) => {
                    resolve(doFetch(newToken));
                });
            });
        }

        isRefreshing = true;

        try {
            const refreshRes = await fetch(`${apiUrl}auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            });

            if (!refreshRes.ok) throw new Error("Refresh failed");

            const data = await refreshRes.json();
            const newToken = data.accessToken;

            localStorage.setItem("JWT_TOKEN", newToken);
            onRefreshed(newToken);

            res = await doFetch(newToken);
        } catch {
            localStorage.removeItem("JWT_TOKEN");
            localStorage.removeItem("JWT_ACCESS_TOKEN");
            window.location.href = "/auth";
            throw new Error("Session expired");
        } finally {
            isRefreshing = false;
        }
    }

    if (!res.ok) {
        const errorBody = await res.text();
        let errorMessage;
        try {
            errorMessage = JSON.parse(errorBody).message || res.statusText;
        } catch {
            errorMessage = errorBody || res.statusText;
        }
        throw new Error(errorMessage);
    }

    return res.json();
};
