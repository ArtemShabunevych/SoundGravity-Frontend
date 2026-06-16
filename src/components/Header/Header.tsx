import { Link, useNavigate } from "react-router-dom";
import { useContext } from 'react';
import styles from "./header.module.css";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../../context/ThemeContext";
import { LanguageContext } from "../../context/LanguageContext";
import { UserContext } from "../../context/UserContext";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import "flag-icons/css/flag-icons.min.css";
import logoLight from "../../photos/logo-light.png";
import logoDark from "../../photos/logo-dark.png";
import userIcon from "../../photos/user_icon.png";

export default function Header() {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { lang, toggleLanguage } = useContext(LanguageContext);
    const { isAuth, user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <header className={styles.mainHeader}>
            <div className={styles.logo} onClick={() => navigate("/")}>
                <img
                    src={theme === 'light' ? logoLight : logoDark}
                    alt="SoundGravity"
                    className={styles.logoImg}
                />
                <span className={styles.logoDot}></span>
                SoundGravity
            </div>

            <nav className={styles.mainNav}>
                {!isAuth ? (
                    <>
                        <Link to="/auth/login" className={styles.navLink}>{t("header.login")}</Link>
                        <Link to="/auth/register" className={styles.launchBtn}>{t("header.register")}</Link>
                    </>
                ) : (
                    <>
                        <Link to="/tracks" className={styles.navLink}>{t("header.tracks")}</Link>
                        <Link to="/playlists" className={styles.navLink}>{t("header.playlists")}</Link>
                        <Link to="/user" className={styles.profileLink}>
                            <img
                                src={user?.avatarUrl || userIcon}
                                alt={t("user.AvatarAlt")}
                                className={styles.userAvatar}
                            />
                            {user?.username || 'User'}
                        </Link>
                        <button onClick={logout} className={styles.navLink} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                            {t("header.logout")}
                        </button>
                    </>
                )}
            </nav>

            <div className={styles.controls}>
                <button
                    className={styles.buttonToggle}
                    onClick={toggleLanguage}
                    aria-label="Toggle language"
                >
                    {lang === 'en' ? (
                        <span className="fi fi-ua"></span>
                    ) : (
                        <span className="fi fi-gb"></span>
                    )}
                </button>

                <button
                    className={styles.buttonToggle}
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? (
                        <DarkModeIcon className={styles.icon} />
                    ) : (
                        <LightModeIcon className={styles.icon} />
                    )}
                </button>
            </div>
        </header>
    );
}