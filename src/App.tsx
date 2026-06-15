import Cursor from './components/Cursor/Cursor';
import './styles/theme.module.css';
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./components/AppRoutes/AppRoutes";
import { UserProvider } from "./context/UserContext";

function App() {
    return (
        <div className="App">
            <UserProvider>
                <LanguageProvider>
                    <ThemeProvider>

                        <AppRoutes />
                        <Cursor />

                    </ThemeProvider>
                </LanguageProvider>
            </UserProvider>
        </div>
    );
}

export default App;