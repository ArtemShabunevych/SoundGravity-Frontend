import { fetchWithAuth } from "./apiClient";

export const getTracks = async (limit, cursor, t) => {
    const data = await fetchWithAuth(`tracks/pagination?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`);
    return data;
};