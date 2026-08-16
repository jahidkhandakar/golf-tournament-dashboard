import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/header/sidebar/index.js";
import Header from "../../Components/header/index.js";

export default function DashboardLayout() {
    const [navOpened, setNavOpened] = useState<boolean>(false);
    return (
        <div className="flex min-h-screen h-full">
            {/* side bar  */}
            <Sidebar navOpened={navOpened} setNavOpened={setNavOpened} />

            {/* top and children content  */}
            <div
                className={`flex flex-col flex-1 min-w-0 lg:ml-64 transition-all duration-300`}
            >
                <Header navOpened={navOpened} setNavOpened={setNavOpened} />
                {/* min-h-[calc(100vh-48px)]  */}
                <main className="overflow-y-auto overflow-x-hidden w-full min-h-[calc(100vh-178px)] h-full bg-[var(--color-soft-grey)] font-sans p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}