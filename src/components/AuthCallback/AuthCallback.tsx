import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setIsAuth } = useContext(UserContext);

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');

        if (token && refreshToken) {
            localStorage.setItem('JWT_TOKEN', token);
            localStorage.setItem('JWT_ACCESS_TOKEN', refreshToken);
            setIsAuth(true);
        }

        navigate('/tracks', { replace: true });
    }, []);

    return null;
}
