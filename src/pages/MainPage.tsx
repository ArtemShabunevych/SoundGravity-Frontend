import Main from "../components/Main/Main";
import { Helmet } from "react-helmet-async";

function MainPage() {
    return (
        <div>
            <Helmet>
                <title>SoundGravity</title>
                <meta name="description" content="SoundGravity — interactive music platform. Streams, playlists, visualizations and music from around the world." />
            </Helmet>
            <Main/>
        </div>

    )
}

export default MainPage