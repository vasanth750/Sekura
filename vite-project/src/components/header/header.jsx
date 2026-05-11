import profile from "../../assets/acc.jpeg";

export default function Header() {
    return (
        <header className="flex items-center w-full border-b bg-white px-6 py-3 sticky top-0 z-50">
            
            {/* Logo: Fixed size, won't shrink */}
            <div className="flex-none">
                <h1 className="text-xl font-bold text-blue-600">
                    Sekura
                </h1>
            </div>

            <nav className="flex-1 flex justify-evenly items-center px-10 text-gray-600 font-medium">
                <a href="#" className="hover:text-blue-600 transition-all cursor-pointer">Dashboard</a>
                <a href="#" className="hover:text-blue-600 transition-all cursor-pointer">Secrets</a>
                <a href="#" className="hover:text-blue-600 transition-all cursor-pointer">Sharelinks</a>
                <a href="#" className="hover:text-blue-600 transition-all cursor-pointer">Auditlogs</a>
                <a href="#" className="hover:text-blue-600 transition-all cursor-pointer">Team</a>
                <a href="#" className="hover:text-blue-600 transition-all cursor-pointer">Settings</a>
            </nav>

            {/* Profile Section: Fixed size */}
            <div className="flex-none">
                <button className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 hover:ring-2 ring-blue-100 transition-all">
                    <img 
                        src={profile} 
                        alt="User Profile" 
                        className="w-full h-full object-cover" 
                    />
                </button>
            </div>

        </header>
    );
}