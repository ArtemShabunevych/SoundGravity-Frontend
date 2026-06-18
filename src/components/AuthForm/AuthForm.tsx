import { useContext, useEffect, useState } from "react";
import style from "./authform.module.css";
import { useTranslation } from "react-i18next";
import MyInput from "../../UI/MyInput/MyInput.tsx";
import toast from "react-hot-toast";
import { UserContext } from "../../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import StarBackground from "../StarBackground/StarBackground.tsx";
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import KeyIcon from '@mui/icons-material/Key';
import FiberNewIcon from '@mui/icons-material/FiberNew';
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
        <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
);

function AuthForm() {
    const location = useLocation();
    const [flipped, setFlipped] = useState(location.pathname === "/auth/register");
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setUser, setIsAuth } = useContext(UserContext);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [registerUsername, setRegisterUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    // 🛡️ Залізобетонна нормалізація API URL, щоб уникнути 404 через відсутність /api/
    let baseApiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:3000/api/";
    if (!baseApiUrl.endsWith("/api/")) {
        baseApiUrl = baseApiUrl.endsWith("/") ? `${baseApiUrl}api/` : `${baseApiUrl}/api/`;
    }
    const apiUrl = baseApiUrl;

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("JWT_TOKEN");
            const accessToken = localStorage.getItem("JWT_ACCESS_TOKEN");

            if (!token || !accessToken) {
                throw new Error(t("errors.mustBeLoggedIn"));
            }

            const response = await fetch(`${apiUrl}users/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-refresh-token": `${accessToken}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "User not found");
            setUser(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Ініціалізуємо суворий редірект на бекенд NestJS
    const handleGoogleLogin = () => {
        window.location.href = `${apiUrl}auth/google`;
    };

    const loginRequest = async () => {
        const response = await fetch(`${apiUrl}auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: loginEmail.trim(),
                password: loginPassword.trim(),
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed");

        localStorage.setItem("JWT_TOKEN", data.accessToken);
        localStorage.setItem("JWT_ACCESS_TOKEN", data.refreshToken);
        setIsAuth(true);
        await fetchUser();
        navigate("/tracks");
        return data;
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail.trim() || !loginPassword.trim()) {
            toast.error("All fields are required");
            return;
        }
        toast.promise(loginRequest(), {
            loading: "Logging in...",
            success: (data) => `Welcome ${data.user?.username || "back"}!`,
            error: (err) => err.message,
        });
    };

    const registerRequest = async () => {
        const response = await fetch(`${apiUrl}auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: registerUsername.trim(),
                email: registerEmail.trim(),
                password: registerPassword.trim(),
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Registration failed");

        localStorage.setItem("JWT_TOKEN", data.accessToken);
        localStorage.setItem("JWT_ACCESS_TOKEN", data.refreshToken);
        setIsAuth(true);
        await fetchUser();
        navigate("/tracks"); // Виправив на /tracks для консистентності з логіном
        return data;
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword.trim()) {
            toast.error("All fields are required");
            return;
        }
        toast.promise(registerRequest(), {
            loading: "Creating account...",
            success: (data) => `Account created for ${data.user?.username || "you"}!`,
            error: (err) => err.message,
        });
    };

    return (
        <div className={style.authWrapper}>
            <StarBackground interactive zIndex={1} />
            <div className={style.scene}>
                <div className={`${style.card} ${flipped ? style.flipped : ""}`}>

                    <div className={style.cardFace}>
                        <div className={style.bluePanel}>
                            <h1 className={style.bluePanelTitle}>{t("auth.loginForm.welcome")}</h1>
                            <p className={style.bluePanelSub}>{t("auth.loginForm.question")}</p>
                            <button
                                type="button"
                                className={style.btnToggle}
                                onClick={() => setFlipped(true)}
                            >
                                {t("auth.loginForm.register")}
                            </button>
                        </div>

                        <div className={style.formPanel}>
                            <form onSubmit={handleLoginSubmit} className={style.form}>
                                <h1 className={style.formTitle}><LoginIcon className={style.headingIcon} /> {t("auth.loginForm.login")}</h1>
                                <MyInput
                                    type="email"
                                    placeholder={t("auth.placeholders.email")}
                                    required
                                    icon={<EmailIcon />}
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                                <MyInput
                                    type="password"
                                    placeholder={t("auth.placeholders.password")}
                                    required
                                    icon={<KeyIcon />}
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                                <button type="submit" className={style.btn}>
                                    {t("auth.loginForm.login")}
                                </button>

                                <div className={style.divider}>
                                    <span>{t("auth.or")}</span>
                                </div>

                                <button type="button" className={style.googleBtn} onClick={handleGoogleLogin}>
                                    <GoogleIcon />
                                    {t("auth.loginForm.google")}
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className={`${style.cardFace} ${style.cardBack}`}>
                        <div className={style.formPanel}>
                            <form onSubmit={handleRegisterSubmit} className={style.form}>
                                <h1 className={style.formTitle}>< FiberNewIcon className={style.headingIcon} /> {t("auth.registrationForm.registration")}</h1>
                                <MyInput
                                    type="text"
                                    placeholder={t("auth.placeholders.username")}
                                    required
                                    icon={<PersonIcon />}
                                    value={registerUsername}
                                    onChange={(e) => setRegisterUsername(e.target.value)}
                                />
                                <MyInput
                                    type="email"
                                    placeholder={t("auth.placeholders.email")}
                                    required
                                    icon={<EmailIcon />}
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                />
                                <MyInput
                                    type="password"
                                    placeholder={t("auth.placeholders.password")}
                                    required
                                    icon={<KeyIcon />}
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                />
                                <button type="submit" className={style.btn}>
                                    {t("auth.registrationForm.register")}
                                </button>

                                <div className={style.divider}>
                                    <span>{t("auth.or")}</span>
                                </div>

                                <button type="button" className={style.googleBtn} onClick={handleGoogleLogin}>
                                    <GoogleIcon />
                                    {t("auth.registrationForm.google")}
                                </button>
                            </form>
                        </div>

                        <div className={style.bluePanel}>
                            <h1 className={style.bluePanelTitle}>{t("auth.registrationForm.welcomeBack")}</h1>
                            <p className={style.bluePanelSub}>{t("auth.registrationForm.question")}</p>
                            <button
                                type="button"
                                className={style.btnToggle}
                                onClick={() => setFlipped(false)}
                            >
                                {t("auth.loginForm.login")}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AuthForm;