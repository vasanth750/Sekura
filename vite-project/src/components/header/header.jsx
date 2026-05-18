import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";
import ProfileButton from "./profile";

function NavLinks({
  links,
  location,
  setProfileOpen,
  setSidebarOpen,
  mobile = false,
}) {
  return (
    <>
      {links.map(([name, path]) => (
        <Link
          key={path}
          to={path}
          onClick={() => {
            setProfileOpen(false);
            if (mobile) setSidebarOpen(false);
          }}
          className={`font-bold text-sm lg:text-base transition-colors ${
            location.pathname === path
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          {name}
        </Link>
      ))}
    </>
  );
}

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const links = [
    ["Dashboard", "/dashBoard"],
    ["Secrets", "/secrets"],
    ["Request", "/request"],
  ];

  const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  setProfileOpen(false);
  setSidebarOpen(false);

  navigate("/login", { replace: true });
};

  return (
    <header className="w-full h-16 sm:h-20 border-b bg-white sticky top-0 z-50">
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="flex lg:hidden items-center w-full relative">
          <button onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-7 h-7" />
          </button>

          <Link
            to="/dashBoard"
            className="absolute left-1/2 -translate-x-1/2"
          >
            <h1 className="text-3xl font-bold text-blue-600">
              Sekura
            </h1>
          </Link>

          <div className="ml-auto">
            <ProfileButton
              profileOpen={profileOpen}
              setProfileOpen={setProfileOpen}
              user={user}
              logout={logout}
            />
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between w-full">
          <Link to="/dashBoard">
            <h1 className="text-4xl font-bold text-blue-600">
              Sekura
            </h1>
          </Link>

          <nav className="flex gap-8">
            <NavLinks
              links={links}
              location={location}
              setProfileOpen={setProfileOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </nav>

          <ProfileButton
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
            user={user}
            logout={logout}
          />
        </div>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-5 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-blue-600">
            Sekura
          </h2>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-5 mt-6">
          <NavLinks
            mobile
            links={links}
            location={location}
            setProfileOpen={setProfileOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </nav>
      </div>
    </header>
  );
}