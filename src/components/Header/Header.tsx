import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from 'react';
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
import LogoutIcon from '@mui/icons-material/Logout';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

export default function Header() {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { lang, toggleLanguage } = useContext(LanguageContext);
    const { isAuth, user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    return (
        <header className={styles.mainHeader}>
            <div className={styles.leftGroup}>
                <div className={styles.logo} onClick={() => navigate("/")}>
                    <img
                        src={theme === 'light' ? logoLight : logoDark}
                        alt="SoundGravity"
                        className={styles.logoImg}
                    />
                    SoundGravity
                </div>
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
            </div>

            {!isAuth ? (
                <nav className={styles.rightGroup}>
                    <Link to="/auth/login" className={styles.navLink}>{t("header.login")}</Link>
                    <Link to="/auth/register" className={styles.launchBtn}>{t("header.register")}</Link>
                </nav>
            ) : (
                <>
                    <nav className={styles.centerNav}>
                        <Link to="/tracks" className={styles.navLink}>
                            <MusicNoteOutlinedIcon className={styles.navIcon} /> {t("header.tracks")}
                        </Link>
                        <Link to="/playlists" className={styles.navLink}>
                            <FeaturedPlayListIcon className={styles.navIcon} /> {t("header.playlists")}
                        </Link>
                    </nav>

                    <div className={styles.rightGroup}>
                        <Link to="/user" className={styles.profileLink}>
                            <img
                                src={user?.avatarUrl || userIcon}
                                alt={t("user.AvatarAlt")}
                                className={styles.userAvatar}
                            />
                            {user?.username}
                        </Link>
                        <button
                            className={styles.burgerBtn}
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            aria-label="Menu"
                        >
                            <MenuIcon />
                        </button>
                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={() => setAnchorEl(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem onClick={() => { setAnchorEl(null); navigate('/liked'); }}>
                                <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>
                                {t("header.liked")}
                            </MenuItem>
                            <MenuItem onClick={() => { setAnchorEl(null); navigate('/tracks/create'); }}>
                                <ListItemIcon><AudiotrackIcon fontSize="small" /></ListItemIcon>
                                {t("user.CreateTrack")}
                            </MenuItem>
                            <MenuItem onClick={() => { setAnchorEl(null); navigate('/playlists/create'); }}>
                                <ListItemIcon><PlaylistAddIcon fontSize="small" /></ListItemIcon>
                                {t("user.CreatePlaylist")}
                            </MenuItem>
                            <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
                                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                                {t("header.settings")}
                            </MenuItem>
                            <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>
                                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                                {t("header.logout")}
                            </MenuItem>
                        </Menu>
                    </div>
                </>
            )}
        </header>
    );
}
