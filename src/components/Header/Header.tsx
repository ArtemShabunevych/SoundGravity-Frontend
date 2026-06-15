import { Link, useNavigate } from "react-router-dom";
import { useContext } from 'react';
import styles from "./header.module.css";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../../context/ThemeContext";
import { LanguageContext } from "../../context/LanguageContext";
import { UserContext } from "../../context/UserContext";

export default function Header() {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { lang, toggleLanguage } = useContext(LanguageContext);
    const { isAuth, user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <header className={styles.mainHeader}>
            <div className={styles.logo} onClick={() => navigate("/")}>
                <span className={styles.logoDot}></span>
                SoundGravity
            </div>

            <div className={styles.controls}>
                <button
                    className={styles.buttonToggle}
                    onClick={toggleLanguage}>
                    {lang === 'en' ? "UA" : "EN"}
                </button>

                <button
                    className={styles.buttonToggle}
                    onClick={toggleTheme}>
                    {theme === 'light' ? <i className='bx bx-moon'></i> : <i className='bx bx-sun'></i>}
                </button>
            </div>

            <nav className={styles.mainNav}>
                {!isAuth ? (
                    <>
                        <Link to="/login" className={styles.navLink}>{t("header.login")}</Link>
                        <Link to="/register" className={styles.launchBtn}>{t("header.register")}</Link>
                    </>
                ) : (
                    <>
                        <Link to="/universe" className={styles.navLink}>Universe</Link>
                        <Link to="/profile" className={styles.navLink}>{t("header.profile")} ({user?.name || 'User'})</Link>
                        <button onClick={logout} className={styles.navLink} style={{ background: 'none', border: 'none', padding: 0 }}>
                            {t("header.log-out")}
                        </button>
                    </>
                )}
            </nav>
        </header>
    );
}