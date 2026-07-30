import { Helmet } from "react-helmet-async";
import TracksList from "../components/TracksList/TracksList";

function TracksListPage() {
    return (
        <div>
            <Helmet>
                <title>Tracks — SoundGravity</title>
                <meta name="description" content="Browse all tracks on SoundGravity. Discover new music, artists, and sounds from around the world." />
            </Helmet>
            <TracksList/>
        </div>
    )
}

export default TracksListPage
