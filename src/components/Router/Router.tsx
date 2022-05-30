import { Route, Routes, BrowserRouter } from 'react-router-dom'
import React from 'react'
import HomePage from '../../pages/HomePage/HomePage'
import LoginPage from '../../pages/LoginPage/LoginPage'
import { AuthProvider, RequireAuth } from '../../utils/auth'
import GamePage from '../../pages/GamePage/GamePage'
import ContinuePage from '../../pages/ContinuePage/ContinuePage'

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
                    <Route path={"/game"} element={
                        <RequireAuth>
                            <GamePage />
                        </RequireAuth>
                    } />
                    <Route path={"/continue"} element={
                        <RequireAuth>
                            <ContinuePage />
                        </RequireAuth>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default Router