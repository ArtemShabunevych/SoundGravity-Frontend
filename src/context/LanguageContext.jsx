import { createContext, useEffect, useState } from "react";
import i18n from "../i18n";
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

    useEffect(() => {
        i18n.changeLanguage(lang); // тепер гарантовано існує
        localStorage.setItem("lang", lang);
    }, [lang]);

    const toggleLanguage = () => {
        setLang(prev => (prev === "en" ? "ua" : "en"));
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};