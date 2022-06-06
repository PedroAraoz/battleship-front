import {BrowserRouter, Route, Routes} from "react-router-dom"
import React from "react"
import HomePage from "../../pages/HomePage/HomePage"
import LoginPage from "../../pages/LoginPage/LoginPage"
import {AuthProvider, RequireAuth} from "../../utils/auth"
import GamePage from "../../pages/GamePage/GamePage"
import ContinuePage from "../../pages/ContinuePage/ContinuePage"
import NotFoundPage from "../../pages/NotFoundPage/NotFoundPage"

const Router = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path={"/"} element={<LoginPage />} />
                    <Route path={"/home"} element={
                        <RequireAuth>
                            <HomePage />
                        </RequireAuth>
                    } />
                    <Route path={"/continue/:gameId"} element={
                        <RequireAuth>
                            <ContinuePage />
                        </RequireAuth>
                    } />
                    <Route path={"/game/:gameId"} element={
                        <RequireAuth>
                            <GamePage />
                        </RequireAuth>
                    } />
                    <Route path={"*"} element={<NotFoundPage />}/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default Router