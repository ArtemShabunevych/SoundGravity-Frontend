import { Helmet } from "react-helmet-async";
import CreatePlaylist from "../components/CreatePlaylist/CreatePlaylist";


export default  function CreatePlaylistPage() {
    return (
        <div>
            <Helmet>
                <title>Create Playlist — SoundGravity</title>
                <meta name="description" content="Create a new playlist on SoundGravity — curate your own collection of tracks." />
            </Helmet>
            <CreatePlaylist/>
        </div>
    )
}