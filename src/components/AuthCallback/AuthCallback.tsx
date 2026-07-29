import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

export default function AuthCallback() {
    const navigate = useNavigate();
    const { setIsAuth, fetchUser } = useContext(UserContext);

    useEffect(() => {
        const handleAuth = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            const refreshToken = params.get('refreshToken');

            if (token && refreshToken) {
                localStorage.setItem('JWT_TOKEN', token);
                localStorage.setItem('JWT_REFRESH_TOKEN', refreshToken);
                setIsAuth(true);
                await fetchUser();
            }

            navigate('/tracks', { replace: true });
        };

        handleAuth();
    }, []);

    return null;
}
