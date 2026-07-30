import { Helmet } from "react-helmet-async";
import Settings from "../components/Settings/Settings";

function SettingsPage() {
    return (
        <div>
            <Helmet>
                <title>Settings — SoundGravity</title>
                <meta name="description" content="Customize your SoundGravity experience — theme, language, and account settings." />
            </Helmet>
            <Settings/>
        </div>
    )
}

export default SettingsPage
