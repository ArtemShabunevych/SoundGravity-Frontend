import MainPage from "../pages/MainPage.tsx";
import UserPage from "../pages/UserPage";
import TrackPage from "../pages/TrackPage.js";
import PlaylistPage from "../pages/PlaylistPage.js";
import TracksList from "../pages/TracksList.tsx";
import PlaylistsList from "../pages/PlaylistsList.tsx";

export const privateRoutes = [
    {path: '/tracks', component: TracksList },
    {path: '/playlists', component: PlaylistsList },
    {path: '/user', component: UserPage },
    { path:'/user/:username', component: UserPage },
    { path:'/track/:id', component: TrackPage },
    { path:'/playlist/:id', component: PlaylistPage },
]

export const publicRoute = [
    {path: '/', component: MainPage },
]