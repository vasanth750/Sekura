import { useState } from "react";
import AddSecret from "../popup-page/addSecret";
import CreateLink from "../popup-page/createLinks";

export default function Secrets() {

    const [secrets, setSecrets] = useState([
        {
            secretName: 'vasant',
            accessRole: 'Production',
            status: 'Active',
            lastUpdated: '00.00'
        }
    ]);

    const [showSecretPopup, setShowSecretPopup] = useState(false);
    const [showLinkPopup, setShowLinkPopup] = useState(false);

    return (

        <div className="w-full p-4 md:p-8 lg:px-20">

            {/* Secret Popup */}
            {
                showSecretPopup && (
                    <AddSecret closePopup={() => setShowSecretPopup(false)} />
                )
            }

            {/* Create Link Popup */}
            {
                showLinkPopup && (
                    <CreateLink closePopup={() => setShowLinkPopup(false)} />
                )
            }

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
                        across all your clusters.
                    </p>

                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer text-sm font-semibold sm:w-[170px]"
                        onClick={() => setShowSecretPopup(true)}
                    >
                        + Add New Secret
                    </button>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer text-sm font-semibold"
                        onClick={() => setShowLinkPopup(true)}
                    >
                        + Create Access Link
                    </button>

                </div>

            </div>

            {/* Search Section */}
            <div className="mt-8 bg-white border border-gray-300 rounded-2xl p-4 flex flex-col lg:flex-row justify-between items-center gap-4">

                <input
                    type="text"
                    placeholder="⌕ Search secrets by name, tags, or role..."
                    className="w-full lg:w-[400px] h-[45px] px-4 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                />

            </div>

            {/* Table Section */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-300 overflow-hidden">

                {/* Table Header */}
                <div className="p-6 border-b border-gray-200">

                    <h2 className="text-xl font-bold text-gray-800">
                        Credentials Registry
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                        Displaying active secrets in your workspace.
                    </p>

                </div>

                {/* Table */}
                <div className="overflow-x-auto">

                    {/* Header Row */}
                    <div className="grid grid-cols-5 bg-blue-600 text-white text-sm font-semibold min-w-[700px]">

                        <div className="p-4">
                            Secret Name
                        </div>

                        <div className="p-4">
                            Access Role
                        </div>

                        <div className="p-4">
                            Status
                        </div>

                        <div className="p-4">
                            Last Updated
                        </div>

                        <div className="p-4 text-center">
                            Actions
                        </div>

                    </div>

                    {/* Dynamic Rows */}
                    {
                        secrets.map((secret, index) => (

                            <div
                                key={index}
                                className="grid grid-cols-5 items-center border-b border-gray-200 hover:bg-gray-50 transition-all text-sm last:border-b-0 min-w-[700px]"
                            >

                                <div className="p-4">
                                    {secret.secretName}
                                </div>

                                <div className="p-4">
                                    {secret.accessRole}
                                </div>

                                <div className="p-4">
                                    {secret.status}
                                </div>

                                <div className="p-4">
                                    {secret.lastUpdated}
                                </div>

                                <div className="p-4 flex justify-center gap-3">

                                    <button className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                                        Edit
                                    </button>

                                    <button className="text-red-500 hover:text-red-700 font-medium cursor-pointer">
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