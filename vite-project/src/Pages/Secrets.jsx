import { useState } from "react";

export default function Secrets() {

<<<<<<< Updated upstream
    const [secrets, setSecrets] = useState([
        {
        secretName:'vasant',
        roleAccess:'Production',
        status:'Active',
        lastUpdated:'00.00'
    }
    ]);

    return (

        <div className="w-full bg-gray-50 p-4 md:p-8">
=======
    const [secrets, setSecrets] = useState([]);

    return (

        <div className="w-full min-h-screen bg-gray-50 p-4 md:p-8">
>>>>>>> Stashed changes

            {/* Top Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

                {/* Left Side */}
                <div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Secrets Management
                    </h1>

                    <p className="max-w-2xl mt-3 text-gray-600 text-sm md:text-base">
                        Securely manage, monitor, and rotate your application's
                        environment variables, API keys, and certificates
                        across all clusters.
                    </p>

                </div>
                <div className="w-full items-center">

                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer text-sm font-semibold">
                        + Add New Secret
                    </button>

                </div>

            </div>

            {/* Search & Filter Section */}
            <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col lg:flex-row justify-between items-center gap-4">

                {/* Search */}
                <input
                    type="text"
                    placeholder="⌕ Search by secret name, value, or tags..."
                    className="w-full lg:w-[400px] h-[45px] px-4 rounded-xl border border-gray-300 outline-none"
                />

            </div>

            {/* Table Section */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">

                {/* Table Header */}
                <div className="p-6 border-b border-gray-200">

                    <h2 className="text-xl font-bold text-gray-800">
                        Credentials Registry
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                        Showing active secrets in your workspace.
                    </p>

                </div>

                {/* Table */}
                <div className="min-w-[600px]">

                    {/* Header Row */}
                    <div className="grid grid-cols-5 bg-gray-100 text-gray-600 text-sm font-semibold border-b">

                        <div className="p-4">Secret Name</div>

                        <div className="p-4">Role Access</div>

                        <div className="p-4">Status</div>

                        <div className="p-4">Last Updated</div>

                        <div className="p-4 text-center">Actions</div>

                    </div>

                    {/* Dynamic Rows */}
                    {
                        secrets.map((secret, index) => (

<<<<<<< Updated upstream
                            <div key={index} className="grid grid-cols-5 items-center border-b hover:bg-gray-50 transition-all text-sm">
=======
                            <div key={index} className="grid grid-cols-7 items-center border-b hover:bg-gray-50 transition-all text-sm">
>>>>>>> Stashed changes

                                <div className="p-4">
                                    {secret.secretName}
                                </div>

                                <div className="p-4">
                                    {secret.roleAccess}
                                </div>

                                <div className="p-4">
                                    {secret.status}
                                </div>

                                <div className="p-4">
                                    {secret.lastUpdated}
                                </div>

                                <div className="p-4 flex justify-center gap-3">

                                    <button className="text-blue-600 hover:text-blue-800">
                                        Edit
                                    </button>

                                    <button className="text-red-500 hover:text-red-700">
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))
                    }

                </div>

            </div>

        </div>

    );
}