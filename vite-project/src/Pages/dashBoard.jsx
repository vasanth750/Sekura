import { useNavigate } from "react-router-dom";
export default function Dashboard() {
const navigate = useNavigate();
  const stats = [
    { title: "Total Secrets", value: "0" },
    { title: "Team Members", value: "0" },
    { title: "Active Links", value: "0" },
    { title: "Expiring Soon", value: "0" },
  ];

  return (

    <div className=" bg-gray-50 p-4 rounded-xl min-h-screen">

      {/* ================= TOP SECTION ================= */}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:m-8 lg:mx-20">

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
            +New Secret
          </button>

        </div>

      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8  md:m-8 lg:mx-20">

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

      {/* ================= RECENT SECRETS ================= */}

      <div className="mt-8 bg-white rounded-xl border overflow-hidden md:m-8 lg:mx-20">

        {/* Header */}

        <div className="p-5 border-b">

          <h1 className="text-2xl font-bold text-gray-900">
            Recent Secrets
          </h1>

          <h3 className="text-gray-500 text-sm md:text-base">
            Recently accessed or updated credentials across your environments.
          </h3>

        </div>

        {/* Table */}

        <div className="w-full overflow-x-auto">

          <div className="min-w-[650px]">

            {/* Table Heading */}

            <div className="grid grid-cols-[3fr_2fr_2fr_1fr] gap-4 bg-blue-600 px-5 py-3 text-sm text-white font-bold">

              <p>Secret Name</p>
              <p>Environment</p>
              <p>Last Accessed</p>
              <p>Actions</p>

            </div>

            {/* Row 1 */}

            <div className="grid grid-cols-[3fr_2fr_2fr_1fr] gap-4 items-center px-5 py-4 border-b">

              <p className="font-semibold text-gray-800">
                API_KEY
              </p>

              <p>Production</p>

              <p>2 hours ago</p>

              <p>-</p>

            </div>

            {/* Row 2 */}

            <div className="grid grid-cols-[3fr_2fr_2fr_1fr] gap-4 items-center px-5 py-4">

              <p className="font-semibold text-gray-800">
                DB_PASSWORD
              </p>

              <p>Development</p>

              <p>Yesterday</p>

              <p>-</p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}