import {Route, Routes, BrowserRouter} from 'react-router-dom';
import React from "react";
import AnotherPage from "../AnotherPage/AnotherPage";
import HomePage from "../HomePage/HomePage";
const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/test"} element={<AnotherPage/>}/>
                <Route path={""} element={<HomePage/>}/>
            </Routes>
        </BrowserRouter>
    )
}
export default Router