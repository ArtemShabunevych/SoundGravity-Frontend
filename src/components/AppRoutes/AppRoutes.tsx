import  {useContext} from 'react'
import {UserContext} from "../../context/UserContext";
import {Route, Routes} from "react-router-dom";
import {privateRoutes, publicRoute} from "../../router/routes";
import AuthPage from "../../pages/AuthPage";
import MainLayout from "../../layouts/MainLayout.js";
import MainPage from "../../pages/MainPage.tsx";

function AppRoutes() {

    const {isAuth} = useContext(UserContext)


    return (
        isAuth ? (
            <Routes>
                <Route path="/auth" element={<AuthPage />}/>
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
                    <Route path="*" element={<MainPage />} />
                </Route>
            </Routes>
        ) : (
            <Routes>
                <Route path="/auth" element={<AuthPage />}/>
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