import { useContext } from 'react'
import { UserContext } from "../../context/UserContext";
import { Navigate, Route, Routes } from "react-router-dom";
import { privateRoutes, publicRoute } from "../../router/routes";
import AuthPage from "../../pages/AuthPage";
import AuthCallback from "../AuthCallback/AuthCallback";
import MainLayout from "../../layouts/MainLayout.js";

function OAuthRedirect() {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    if (token && refreshToken) {
        return <Navigate to={`/auth/callback?token=${token}&refreshToken=${refreshToken}`} replace />;
    }
    return <AuthPage />;
}

function AppRoutes() {
    const { isAuth, loading } = useContext(UserContext)

    if (loading) {
        return (
            <div style={{
                position: 'fixed', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#05060d', zIndex: 9999
            }}>
                <div style={{
                    width: 32, height: 32,
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#7fa8ff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        )
    }

    return (
        isAuth ? (
            <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/login" element={<AuthPage />} />
                <Route path="/auth/register" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/" element={<Navigate to="/tracks" replace />} />
                <Route element={<MainLayout />}>
                    {privateRoutes.map(route => {
                        const Component = route.component;
                        return (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={<Component />}
                            />
                        );
                    })}
                    <Route path="*" element={<Navigate to="/tracks" replace />} />
                </Route>
            </Routes>
        ) : (
            <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/login" element={<AuthPage />} />
                <Route path="/auth/register" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/tracks" element={<OAuthRedirect />} />
                <Route path="/tracks/create" element={<OAuthRedirect />} />
                <Route path="/track/:id" element={<OAuthRedirect />} />
                <Route path="/playlists" element={<OAuthRedirect />} />
                <Route path="/playlists/create" element={<OAuthRedirect />} />
                <Route path="/playlist/:id" element={<OAuthRedirect />} />
                <Route path="/user" element={<OAuthRedirect />} />
                <Route path="/user/:username" element={<OAuthRedirect />} />
                <Route path="/liked" element={<OAuthRedirect />} />
                <Route path="/settings" element={<OAuthRedirect />} />
                <Route element={<MainLayout />}>
                    {publicRoute.map(route => {
                        const Component = route.component;
                        return (
                            <Route
                                key={route.path}
                                path={route.path}
                                element={<Component />}
                            />
                        );
                    })}
                </Route>
                <Route path="*" element={<AuthPage />} />
            </Routes>
        )
    )
}

export default AppRoutes
