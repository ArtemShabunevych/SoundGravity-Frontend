import MainPage from "../pages/MainPage.tsx";
import UserPage from "../pages/UserPage";
import TrackPage from "../pages/TrackPage.js";
import PlaylistPage from "../pages/PlaylistPage.js";


export const privateRoutes = [
    {path: '/tracks', component: TrackPage },
    {path: '/playlists', component: PlaylistPage },
    {path: '/user', component: UserPage },
    { path:'/user/:username', component: UserPage },
    { path:'/track/:id', component: TrackPage },
    { path:'/playlist/:id', component: PlaylistPage },
]

export const publicRoute = [
    {path: '/', component: MainPage },
]