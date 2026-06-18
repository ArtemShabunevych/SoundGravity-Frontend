import { fetchWithAuth } from "./apiClient";

export const getPlaylists = async (limit, cursor, t) => {
    const data = await fetchWithAuth(`playlists/pagination?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`);
    return data;
};
