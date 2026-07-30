import { Helmet } from "react-helmet-async";
import TermsOfService from "../components/TermsOfService/TermsOfService";

function TermsOfServicePage() {
    return (
        <>
            <Helmet>
                <title>Terms of Service — SoundGravity</title>
                <meta name="description" content="SoundGravity terms of service — rules and guidelines for using the platform." />
            </Helmet>
            <TermsOfService />
        </>
    )
}

export default TermsOfServicePage
