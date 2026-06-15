import { useContext, useState } from "react";
import style from "./AuthForm.module.css";
import { useTranslation } from "react-i18next";
import MyInput from "../../UI/MyInput/MyInput.tsx";
import toast from "react-hot-toast";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

function AuthForm() {
    const [active, setActive] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setUser, setIsAuth } = useContext(UserContext);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [registerUsername, setRegisterUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const apiUrl = import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api/";

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("JWT_TOKEN");
            const accessToken = localStorage.getItem("JWT_ACCESS_TOKEN");

            if (!token || !accessToken) {
                throw new Error(t("errors.mustBeLoggedIn"));
            }

            const response = await fetch(
                `${apiUrl}users/me`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-refresh-token": `${accessToken}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "User not found");
            }
            setUser(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loginRequest = async () => {
        const response = await fetch(
            `${apiUrl}auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: loginEmail.trim(),
                    password: loginPassword.trim(),
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed");
        }

        localStorage.setItem("JWT_TOKEN", data.accessToken);
        localStorage.setItem("JWT_ACCESS_TOKEN", data.refreshToken);
        setIsAuth(true);
        await fetchUser();
        navigate('/fanfics');

        return data;
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();

        if (!loginEmail.trim() || !loginPassword.trim()) {
            toast.error("All fields are required");
            return;
        }

        toast.promise(loginRequest(), {
            loading: "Logging in...",
            success: (data) => `Welcome ${data.user?.username || 'back'}!`,
            error: (err) => err.message,
        });
    };

    const registerRequest = async () => {
        const response = await fetch(
            `${apiUrl}auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: registerUsername.trim(),
                    email: registerEmail.trim(),
                    password: registerPassword.trim(),
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed");
        }

        localStorage.setItem("JWT_TOKEN", data.accessToken);
        localStorage.setItem("JWT_ACCESS_TOKEN", data.refreshToken);
        setIsAuth(true);
        await fetchUser();
        navigate('/fanfics');

        return data;
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();

        if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword.trim()) {
            toast.error("All fields are required");
            return;
        }

        toast.promise(registerRequest(), {
            loading: "Creating account...",
            success: (data) => `Account created for ${data.user?.username || 'you'}!`,
            error: (err) => err.message,
        });
    };

    return (
        <div className={style.authWrapper}>
            <div className={`${style.container} ${active ? style.active : ""}`}>

                <div className={`${style.formBox} ${style.login}`}>
                    <form onSubmit={handleLoginSubmit}>
                        <h1 className={style.bold}>{t("auth.loginForm.login")}</h1>

                        <MyInput
                            type="email"
                            placeholder={t("auth.placeholders.email")}
                            required
                            icon={<i className="bx bxs-envelope-open bx-flip-horizontal"></i>}
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                        />

                        <MyInput
                            type="password"
                            placeholder={t("auth.placeholders.password")}
                            required
                            icon={<i className="bx bxs-lock-alt"></i>}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                        />

                        <div className={style.forgotLink}>
                            <a href="#" className={style.forgotPassword}>
                                {t("auth.loginForm.forgot")}
                            </a>
                        </div>

                        <button type="submit" className={style.btn}>
                            {t("auth.loginForm.login")}
                        </button>
                    </form>
                </div>

                <div className={`${style.formBox} ${style.register}`}>
                    <form onSubmit={handleRegisterSubmit}>
                        <h1 className={style.bold}>
                            {t("auth.registrationForm.registration")}
                        </h1>

                        <MyInput
                            type="text"
                            placeholder={t("auth.placeholders.username")}
                            required
                            icon={<i className="bx bxs-user"></i>}
                            value={registerUsername}
                            onChange={(e) => setRegisterUsername(e.target.value)}
                        />

                        <MyInput
                            type="email"
                            placeholder={t("auth.placeholders.email")}
                            required
                            icon={<i className="bx bxs-envelope-open bx-flip-horizontal"></i>}
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                        />

                        <MyInput
                            type="password"
                            placeholder={t("auth.placeholders.password")}
                            required
                            icon={<i className="bx bxs-lock-alt"></i>}
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                        />

                        <button type="submit" className={style.btn}>
                            {t("auth.registrationForm.register")}
                        </button>
                    </form>
                </div>

                <div className={style.toggleBox}>
                    <div className={`${style.togglePanel} ${style.toggleLeft} ${active ? style.activeToggleLeft : ''}`}>
                        <h1 className={style.bold}>
                            {t("auth.loginForm.welcome")}
                        </h1>
                        <p>{t("auth.loginForm.question")}</p>
                        <button
                            className={style.btnToggle}
                            type="button"
                            onClick={() => setActive(true)}
                        >
                            {t("auth.loginForm.register")}
                        </button>
                    </div>

                    <div className={`${style.togglePanel} ${style.toggleRight} ${active ? style.activeToggleRight : ''}`}>
                        <h1 className={style.bold}>
                            {t("auth.registrationForm.welcomeBack")}
                        </h1>
                        <p>{t("auth.registrationForm.question")}</p>
                        <button
                            className={style.btnToggle}
                            type="button"
                            onClick={() => setActive(false)}
                        >
                            {t("auth.loginForm.login")}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AuthForm;