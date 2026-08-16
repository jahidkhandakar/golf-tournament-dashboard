import Navbar from "../../Components/shared/navbar/index.js";
import Footer from "../../Components/shared/footer/index.js";
import { Outlet } from "react-router-dom";


export default function MainLayout() {
    return (
        <div>
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    );
}

