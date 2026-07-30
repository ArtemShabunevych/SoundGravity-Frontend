import { Helmet } from "react-helmet-async";
import Liked from "../components/Liked/Liked";

function LikedPage() {
    return (
        <div>
            <Helmet>
                <title>Liked Tracks — SoundGravity</title>
                <meta name="description" content="Your liked tracks on SoundGravity — all your favorite music in one place." />
            </Helmet>
            <Liked/>
        </div>
    )
}

export default LikedPage
