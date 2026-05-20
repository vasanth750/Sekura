import { useRef, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

import defaultProfile from "../../assets/acc.jpeg";

export default function ProfileButton({
  profileOpen,
  setProfileOpen,
  user,
  logout,
}) {
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") || defaultProfile
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem("profileImage", reader.result);
    };

    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = () => {
    setProfileImage(defaultProfile);
    localStorage.removeItem("profileImage");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profileImage");

    setProfileOpen(false);

    logout();
  };

  return (
    <>
      <button
        onClick={() => setProfileOpen(true)}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-gray-300 cursor-pointer"
      >
        <img
          src={profileImage}
          alt="profile"
          className="w-full h-full object-cover"
        />
      </button>

      {profileOpen && (
        <div
          onMouseDown={() => setProfileOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-white shadow-2xl z-50 p-6 transition-transform duration-300 ${
          profileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-blue-600">
            Profile
          </h2>

          <button
            onClick={() => setProfileOpen(false)}
            className="text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col h-[90%]">
          <div className="mt-8">
            <div className="flex flex-col items-center">
              <img
                src={profileImage}
                alt="profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              <p className="mt-4 text-sm text-gray-500 font-medium">
                Add your profile photo
              </p>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                >
                  Change Photo
                </button>

                <button
                  onClick={removeProfilePhoto}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Username
                </p>

                <h2 className="text-base font-semibold text-gray-800 mt-1">
                  {user?.name || "User"}
                </h2>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Email
                </p>

                <p className="text-sm font-medium text-gray-700 mt-1 break-all">
                  {user?.email || "user@gmail.com"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}