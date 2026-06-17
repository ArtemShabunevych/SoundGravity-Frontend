import MainPage from "../pages/MainPage.tsx";
import UserPage from "../pages/UserPage";
import TrackPage from "../pages/TrackPage.js";
import PlaylistPage from "../pages/PlaylistPage.js";
import TracksList from "../pages/TracksList.tsx";
import PlaylistsList from "../pages/PlaylistsList.tsx";
import CreateTrack from "../pages/CreateTrack.tsx";
import CreatePlaylist from "../pages/CreatePlaylistPage.tsx";
import LikedPage from "../pages/LikedPage.tsx";
import SettingsPage from "../pages/SettingsPage.tsx";

export const privateRoutes = [
    {path: '/tracks', component: TracksList },
    {path: '/tracks/create', component: CreateTrack },
    {path: '/playlists', component: PlaylistsList },
    {path: '/playlists/create', component: CreatePlaylist },
    {path: '/user', component: UserPage },
    { path:'/user/:username', component: UserPage },
    { path:'/track/:id', component: TrackPage },
    { path:'/playlist/:id', component: PlaylistPage },
    { path:'/liked', component: LikedPage },
    { path:'/settings', component: SettingsPage },
]

export const publicRoute = [
    {path: '/', component: MainPage },
]