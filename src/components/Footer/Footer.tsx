import { Link} from "react-router-dom";
import styles from "./footer.module.css";
import {useTranslation} from "react-i18next";

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className={styles.mainFooter}>
            <div className={styles.footerLeft}>
                <div className={styles.breadcrumbs}>


                </div>
                <div className={styles.copyright}>
                    &copy; {new Date().getFullYear()}{t("footer.orbits")}
                </div>
            </div>

            <div className={styles.footerRight}>
                <div className={styles.footerLinks}>
                    <a href="https://send.monobank.ua/jar/2JbpBYkhMv"className={styles.donateLink}
                       target="_blank"
                       rel="noopener noreferrer">
                        {t("footer.donate")}
                    </a>
                    <Link to="/privacy">{t("footer.privacy")}</Link>
                    <Link to="/terms">{t("footer.terms")}</Link>
                </div>
            </div>
        </footer>
    );
}