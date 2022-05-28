import { Route, Routes, BrowserRouter } from 'react-router-dom'
import React from 'react'
import HomePage from '../../pages/HomePage/HomePage'
import LoginPage from '../../pages/LoginPage/LoginPage'
import { AuthProvider, RequireAuth } from '../../utils/auth'

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
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default Router