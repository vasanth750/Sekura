import { useState } from "react";
import profile from "../../assets/acc.jpeg";
import { Bars3Icon } from "@heroicons/react/24/outline";
export default function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className="w-full border-b bg-white sticky top-0 z-50">
            <div className="w-full px-8 py-4 flex items-center justify-between">

                {/* Logo */}
                <h1 className="text-4xl font-bold text-blue-600">
                    Sekura
                </h1>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-15 text-gray-600 font-semibold">
                    <a href="#" className="hover:text-blue-600 font-bold">Dashboard</a>
                    <a href="#" className="hover:text-blue-600 font-bold">Secrets</a>
                    <a href="#" className="hover:text-blue-600 font-bold">Sharelinks</a>
                    <a href="#" className="hover:text-blue-600 font-bold">Auditlogs</a>
                    <a href="#" className="hover:text-blue-600 font-bold">Team</a>
                    <a href="#" className="hover:text-blue-600 font-bold">Settings</a>
                </nav>

                {/* Profile + Hamburger */}
                <div className="flex items-center gap-3">



                    {/* Hamburger Button */}
                    <button
                        className="md:hidden"
                        onClick={() => setOpen(!open)}
                    >
                        <Bars3Icon className="w-7 h-7 text-black" />
                    </button>

                    {/* Sidebar Overlay */}
                    {open && (
                        <div
                            className="fixed inset-0 bg-black/40 z-40"
                            onClick={() => setOpen(false)}
                        ></div>
                    )}

                    {/* Sidebar */}
                    <div
                        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"
                            }`}
                    >

                        {/* Sidebar Header */}
                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-2xl font-bold text-blue-600">
                                Sekura
                            </h2>

                            <button
                                onClick={() => setOpen(false)}
                                className="text-2xl font-bold"
                            >
                                
                            </button>
                        </div>

                        {/* Sidebar Links */}
                        <nav className="flex flex-col p-5 gap-5 text-gray-700 font-semibold">
                            <a href="#" className="hover:text-blue-600 cursor-pointer">Dashboard</a>
                            <a href="#" className="hover:text-blue-600 cursor-pointer">Secrets</a>
                            <a href="#" className="hover:text-blue-600 cursor-pointer">Sharelinks</a>
                            <a href="#" className="hover:text-blue-600 cursor-pointer">Auditlogs</a>
                            <a href="#" className="hover:text-blue-600 cursor-pointer">Team</a>
                            <a href="#" className="hover:text-blue-600 cursor-pointer">Settings</a>
                        </nav>
                    </div>
                    {/* Profile */}
                    <button className="w-11 h-11 rounded-full overflow-hidden border border-gray-300 hover:ring-2 hover:ring-blue-200 transition">
                        <img
                            src={profile}
                            alt="profile"
                            className="w-full h-full object-cover"
                        />
                    </button>
                </div>
            </div>
        </header>
    );
}