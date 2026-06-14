export const getStories = async (limit, cursor, t) => {
    const url = new URL(`${process.env.REACT_APP_API_URL}stories/pagination`);
    url.searchParams.append('limit', limit);
    if (cursor) url.searchParams.append('cursor', cursor);

    const token = localStorage.getItem("JWT_TOKEN");
    if (!token) {
        throw new Error(t("errors.mustBeLoggedIn"));
    }

    const access_token = localStorage.getItem("JWT_ACCESS_TOKEN");
    if (!access_token) {
        throw new Error(t("errors.mustBeLoggedIn"));
    }


    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "x-refresh-token" : `${access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch stories");
    }

    return await response.json();
};