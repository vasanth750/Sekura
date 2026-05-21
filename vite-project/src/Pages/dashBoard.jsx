import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchSecrets = async () => {
      try {
        setError("");
        setLoading(true);

        const response = await api.get("/api/encrypted-secrets");

        setSecrets(response.data.secrets || []);
      }

      catch (error) {
        setError(
          error.response?.data?.message || "Unable to load dashboard secrets"
        );
      }

      finally {
        setLoading(false);
      }
    };

    fetchSecrets();
  }, [navigate]);

  const recentSecrets = secrets.slice(0, 5);

  const stats = [
    { title: "Total Secrets", value: secrets.length },
    { title: "Active Links", value: "0" },
    { title: "Expiring Soon", value: "0" },
  ];

  return (
    <div className="bg-gray-50 p-4 rounded-xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:my-5 lg:mx-20">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome!
          </h1>

          <h3 className="text-gray-500 text-base md:text-xl">
            make your stuff secure.
          </h3>
        </div>

        <div className="flex flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/secrets")}
            className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            New Secret
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 md:m-8 lg:mx-20">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white border rounded-2xl p-5 shadow-sm"
          >
            <h3 className="font-bold text-gray-800">
              {item.title}
            </h3>

            <h1 className="text-3xl font-bold mt-2">
              {item.value}
            </h1>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border overflow-hidden md:m-8 lg:mx-20">
        <div className="p-5 border-b">
          <h1 className="text-2xl font-bold text-gray-900">
            Recent Secrets
          </h1>

          <h3 className="text-gray-500 text-sm md:text-base">
            Recently accessed or updated credentials across your environments.
          </h3>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[650px]">
            <div className="grid grid-cols-[3fr_2fr_2fr_1fr] gap-4 bg-blue-600 px-5 py-3 text-sm text-white font-bold">
              <p>Secret Name</p>
              <p>Type</p>
              <p>Last Updated</p>
              <p>Actions</p>
            </div>

            {
              loading && (
                <div className="px-5 py-4 text-sm text-gray-500">
                  Loading recent secrets...
                </div>
              )
            }

            {
              error && (
                <div className="px-5 py-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              )
            }

            {
              !loading && !error && recentSecrets.length === 0 && (
                <div className="px-5 py-4 text-sm text-gray-500">
                  No secrets stored yet.
                </div>
              )
            }

            {
              !loading && !error && recentSecrets.map((secret) => (
                <div
                  key={secret._id || secret.id}
                  className="grid grid-cols-[3fr_2fr_2fr_1fr] gap-4 items-center px-5 py-4 border-b last:border-b-0"
                >
                  <p className="font-semibold text-gray-800">
                    {secret.title}
                  </p>

                  <p className="capitalize">
                    {secret.type}
                  </p>

                  <p>
                    {
                      new Date(
                        secret.updatedAt || secret.createdAt
                      ).toLocaleString()
                    }
                  </p>

                  <button
                    onClick={() => navigate("/secrets")}
                    className="text-left text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    View
                  </button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
