import { Helmet } from "react-helmet-async";
import CreateTrack from "../components/CreateTrack/CreateTrack";


export default  function CreateTrackPage() {
    return (
        <div>
            <Helmet>
                <title>Upload Track — SoundGravity</title>
                <meta name="description" content="Upload and share your music on SoundGravity — reach new audiences with your tracks." />
            </Helmet>
            <CreateTrack/>
        </div>
    )
}