import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from "../components/Chat";
import Login from "../components/Login";
import PrivateRoute from "./PrivateRoute";


const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                <Route path="*" element={<Login />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;