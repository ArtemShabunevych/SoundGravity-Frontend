import MainPage from "../pages/MainPage";
import CreateStoryPage from "../pages/CreateStoryPage";
import FanficsPage from "../pages/FanficsPage";
import UserPage from "../pages/UserPage";
import StoryPage from "../pages/StoryPage";
import LeaderboardPage from "../pages/LeaderboardPage";

export const privatRoutes = [
    {path: '/track/create', component: CreateTrackPage },
    {path: '/tracks', component: TrackPage },
    {path: '/playlists', component: PlaylistPage },
    {path: '/user', component: UserPage },
    { path:'/user/:username', component: UserPage },
    { path:'/track/:id', component: TrackPage },
    { path:'/playlist/:id', component: PlaylistPage },
    { path:'/leaderboard', component: LeaderboardPage },
]

export const publicRoute = [
    {path: '/', component: MainPage },
]