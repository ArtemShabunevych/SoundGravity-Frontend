import { Helmet } from "react-helmet-async";
import AuthForm from "../components/AuthForm/AuthForm.tsx";

function AuthPage() {
    return (
        <>
            <Helmet>
                <title>Auth — SoundGravity</title>
                <meta name="description" content="Sign in or register on SoundGravity to start streaming and sharing your music." />
            </Helmet>
            <AuthForm />
        </>
    )
}

export default AuthPage
