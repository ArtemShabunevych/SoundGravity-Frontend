import Cursor from './components/Cursor/Cursor';
import './styles/theme.module.css';
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./components/AppRoutes/AppRoutes";
import { UserProvider } from "./context/UserContext";
import { PlayerProvider } from "./context/PlayerContext";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <div className="App">
            <UserProvider>
                <LanguageProvider>
                    <ThemeProvider>
                        <PlayerProvider>

                            <AppRoutes />
                            <Cursor />
                            <Toaster
                                position="bottom-right"
                                toastOptions={{
                                    style: {
                                        background: 'var(--white-dark)',
                                        color: 'var(--text-main)',
                                        border: '1px solid var(--input-bg)',
                                        borderRadius: '12px',
                                        padding: '12px 20px',
                                        fontSize: '14px',
                                        fontFamily: 'var(--main-font), sans-serif',
                                        boxShadow: '0 8px 32px var(--shadow)',
                                    },
                                    success: {
                                        iconTheme: {
                                            primary: 'var(--main-color)',
                                            secondary: '#fff',
                                        },
                                    },
                                    error: {
                                        iconTheme: {
                                            primary: '#ef4444',
                                            secondary: '#fff',
                                        },
                                    },
                                    duration: 3000,
                                }}
                            />

                        </PlayerProvider>
                    </ThemeProvider>
                </LanguageProvider>
            </UserProvider>
        </div>
    );
}

export default App;