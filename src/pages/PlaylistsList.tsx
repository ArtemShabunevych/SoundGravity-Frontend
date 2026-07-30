import { Helmet } from "react-helmet-async";
import PlaylistsList from "../components/PlaylistList/PlaylistList";

function PlaylistsListPage() {
    return (
        <div>
            <Helmet>
                <title>Playlists — SoundGravity</title>
                <meta name="description" content="Browse all playlists on SoundGravity. Discover curated collections of music for every mood." />
            </Helmet>
            <PlaylistsList/>
        </div>
    )
}

export default PlaylistsListPage
