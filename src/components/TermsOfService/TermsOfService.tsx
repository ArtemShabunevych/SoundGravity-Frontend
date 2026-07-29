import { useTranslation } from "react-i18next";
import styles from "./termsOfService.module.css";

function TermsOfService() {
    const { t } = useTranslation();

    return (
        <div className={styles.container}>
            <h1>{t("pages.terms.title")}</h1>
            <p>{t("pages.terms.lastUpdated")}</p>

            <h2>{t("pages.terms.agreement")}</h2>
            <p>
                By accessing or using SoundGravity, you agree to be bound by these Terms of Service.
                If you do not agree, please do not use our services.
            </p>

            <h2>{t("pages.terms.userAccounts")}</h2>
            <p>
                To access certain features of SoundGravity, you must authenticate using your Google account
                or registration forms. You are responsible for maintaining the confidentiality of your account
                activity.
            </p>

            <h2>{t("pages.terms.acceptableUse")}</h2>
            <p>
                You agree not to use SoundGravity for any unlawful activities or in a manner that disrupts
                the functionality of the application.
            </p>

            <h2>{t("pages.terms.disclaimer")}</h2>
            <p>
                SoundGravity is provided "as is" without any warranties of any kind. We are not liable for any
                temporary downtime or data loss.
            </p>

            <h2>{t("pages.terms.changes")}</h2>
            <p>
                We reserve the right to update these terms at any time. Continued use of the service constitutes
                acceptance of the new terms.
            </p>
        </div>
    );
}

export default TermsOfService;
