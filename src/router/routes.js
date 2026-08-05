import MainPage from "../pages/MainPage";
import UserPage from "../pages/UserPage";
import TrackPage from "../pages/TrackPage";
import PlaylistPage from "../pages/PlaylistPage";
import TracksList from "../pages/TracksList";
import PlaylistsList from "../pages/PlaylistsList";
import CreateTrack from "../pages/CreateTrack";
import CreatePlaylist from "../pages/CreatePlaylistPage";
import LikedPage from "../pages/LikedPage";
import SettingsPage from "../pages/SettingsPage";

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
