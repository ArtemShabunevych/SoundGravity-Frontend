import { Helmet } from "react-helmet-async";
import User from "../components/User/User";

export default  function UserPage() {
    return (
        <div>
            <Helmet>
                <title>Profile — SoundGravity</title>
                <meta name="description" content="Your SoundGravity profile — manage your tracks, playlists, and settings." />
            </Helmet>
            <User/>
        </div>
    )
}