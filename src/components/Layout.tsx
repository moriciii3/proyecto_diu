import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LightbulbPage from "../pages/LightbulbPage";

import NavBar from "../components/Navbar";

function Layout() {
    return (
        <BrowserRouter>
            <div className="layout">
                <h1 className="layout__title">Interfaz energética</h1>
                <NavBar />
                <div className="layout__page">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/lightbulb" element={<LightbulbPage />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default Layout;
