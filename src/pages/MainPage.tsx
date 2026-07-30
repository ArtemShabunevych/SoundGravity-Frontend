import Main from "../components/Main/Main";
import { Helmet } from "react-helmet-async";

function MainPage() {
    return (
        <div>
            <Helmet>
                <title>SoundGravity — Stream & Discover Music</title>
                <meta name="description" content="SoundGravity — інтерактивна музична платформа. Стріми, плейлисти, візуалізації та музика з усього світу." />
            </Helmet>
            <Main/>
        </div>

    )
}

export default MainPage