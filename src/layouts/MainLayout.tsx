import { useContext } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import MiniPlayer from "../components/MiniPlayer/MiniPlayer";
import { UserContext } from "../context/UserContext";
import styles from "./MainLayout.module.css";

function MainLayout() {
    const { isAuth } = useContext(UserContext);

    return (
        <>
            <Header />
            <div className={styles.content}>
                <Outlet />
            </div>
            {isAuth && <MiniPlayer />}
            <Footer />
        </>
    );
}

export default MainLayout;