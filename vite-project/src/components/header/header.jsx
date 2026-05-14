import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";
import profile from "../../assets/acc.jpeg";

export default function Header() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const user = {
    name: "Tharun",
    email: "tharun@gmail.com",
  };

  const links = [
    ["Dashboard", "/dashboard"],
    ["Secrets", "/secrets"],
    ["Sharelinks", "/sharelinks"],
    ["Auditlogs", "/auditlogs"],
    ["Team", "/team"],
  ];

  const logout = () => {
    setProfileOpen(false);
    setSidebarOpen(false);
    navigate("/login");
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      {links.map(([name, path]) => (
        <Link
          key={path}
          to={path}
          onClick={() => {
            setProfileOpen(false);

            if (mobile) {
              setSidebarOpen(false);
            }
          }}
          className={`font-bold text-sm lg:text-base transition-colors duration-200 ${
            location.pathname === path
              ? "text-blue-600"
              : "text-gray-600 hover:text-blue-600 active:text-blue-600"
          }`}
        >
          {name}
        </Link>
      ))}
    </>
  );

  const ProfileButton = () => (
    <div className="relative">

      <button
        onClick={() => setProfileOpen(!profileOpen)}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-gray-300"
      >
        <img
          src={profile}
          alt="profile"
          className="w-full h-full object-cover"
        />
      </button>

      {profileOpen && (

        <div className="absolute right-0 mt-3 w-64 sm:w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border p-4 z-50">

          <div className="flex flex-col items-center">

            <img
              src={profile}
              alt="profile"
              className="w-16 h-16 rounded-full object-cover border"
            />

            <h2 className="mt-3 text-sm sm:text-base font-bold">
              Username : {user.name}
            </h2>

            <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-600 break-all">
              Email : {user.email}
            </p>

            <button
              onClick={logout}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
            >
              Logout
            </button>

          </div>

        </div>

      )}

    </div>
  );

  return (

    <header className="w-full h-16 sm:h-20 border-b bg-white sticky top-0 z-50 box-border">

      <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center">

        {/* ================= MOBILE / TABLET HEADER ================= */}

        <div className="flex lg:hidden w-full items-center relative ">

          {/* Hamburger Left */}

          <button
            onClick={() => setSidebarOpen(true)}
            className="z-10"
          >
            <Bars3Icon className="w-7 h-7 text-black" />
          </button>

          {/* Center Logo */}

          <div className="absolute left-1/2 -translate-x-1/2">

            <Link
              to="/dashboard"
              onClick={() => setProfileOpen(false)}
            >
              <h1 className="text-3xl font-bold text-blue-600">
                Sekura
              </h1>
            </Link>

          </div>

          {/* Profile Right */}

          <div className="ml-auto mt-2">
            <ProfileButton />
          </div>

        </div>

        {/* ================= DESKTOP HEADER ================= */}

        <div className="hidden lg:flex w-full items-center justify-between">

          {/* Logo */}

          <Link
            to="/dashboard"
            onClick={() => setProfileOpen(false)}
          >
            <h1 className="text-4xl font-bold text-blue-600">
              Sekura
            </h1>
          </Link>

          {/* Navigation */}

          <nav className="flex items-center gap-6 xl:gap-10">
<<<<<<< Updated upstream
            <NavLinks />
=======
            {links.map(([name, path]) => (
              <Link
                key={path}
                to={path}
                onClick={() => {
                  setProfileOpen(false);

                  if (mobile) {
                    setSidebarOpen(false);
                  }
                }}
                className={`font-bold text-sm lg:text-base transition-colors duration-200 ${location.pathname === path
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600 active:text-blue-600"
                  }`}
              >
                {name}
              </Link>
            ))}
>>>> Stashed changes
          </nav>

          {/* Profile */}

          <ProfileButton />

        </div>

      </div>

      {/* ================= OVERLAY ================= */}

      {sidebarOpen && (

        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />

      )}

      {/* ================= SIDEBAR ================= */}

      <div
        className={`fixed top-0 left-0 h-full w-64 sm:w-72 max-w-[80vw] bg-white shadow-lg z-50 p-5
<<<<<<< Updated upstream
        transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
=======
        transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
>>>>>>> Stashed changes
      >

        {/* Sidebar Header */}

        <div className="flex justify-between items-center border-b pb-4">

          <h2 className="text-2xl font-bold text-blue-600">
            Sekura
          </h2>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-2xl font-bold"
          >
            ×
          </button>

        </div>

        {/* Sidebar Links */}

        <nav className="flex flex-col gap-5 mt-6">
          <NavLinks mobile={true} />
        </nav>

      </div>

    </header>

  );
}