import { Helmet } from "react-helmet-async";
import PrivacyPolicy from "../components/PrivacyPolicy/PrivacyPolicy";

function PrivacyPolicyPage() {
    return (
        <>
            <Helmet>
                <title>Privacy Policy — SoundGravity</title>
                <meta name="description" content="SoundGravity privacy policy — how we collect, use, and protect your personal data." />
            </Helmet>
            <PrivacyPolicy />
        </>
    )
}

export default PrivacyPolicyPage
