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



                    {/* Mobile Hamburger */}
                    <button
                        className="md:hidden"
                        onClick={() => setOpen(!open)}
                    >
                        <Bars3Icon className="w-7 h-7 text-black z-80" ></Bars3Icon>
                    </button>
                    {open && (
                        <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg border p-4 flex flex-col gap-3 z-50">
                            <a href="#" className="hover:text-blue-600">Dashboard</a>
                            <a href="#" className="hover:text-blue-600">Secrets</a>
                            <a href="#" className="hover:text-blue-600">Sharelinks</a>
                            <a href="#" className="hover:text-blue-600">Auditlogs</a>
                            <a href="#" className="hover:text-blue-600">Team</a>
                            <a href="#" className="hover:text-blue-600">Settings</a>
                        </div>
                    )}
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