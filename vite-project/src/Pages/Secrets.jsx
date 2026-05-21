import { useEffect, useState } from "react";
import AddSecret from "../popup-page/addSecret";
import CreateLink from "../popup-page/createLinks";
import api from "../api";

export default function Secrets() {

    const [secrets, setSecrets] = useState([]);
    const [showSecretPopup, setShowSecretPopup] = useState(false);
    const [showLinkPopup, setShowLinkPopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewedSecret, setViewedSecret] = useState(null);
    const [actionLoading, setActionLoading] = useState("");

    const fetchSecrets = async () => {
        try {
            setError("");
            setLoading(true);

            const response = await api.get("/api/encrypted-secrets");

            setSecrets(response.data.secrets || []);
        }

        catch (error) {
            setError(
                error.response?.data?.message || "Unable to load secrets"
            );
        }

        finally {
            setLoading(false);
        }
    };

    const addSecretToList = (secret) => {
        setSecrets((currentSecrets) => [
            secret,
            ...currentSecrets
        ]);
    };

    const viewSecret = async (secretId) => {
        try {
            setError("");
            setActionLoading(secretId);

            const response = await api.get(
                `/api/encrypted-secrets/${secretId}/decrypt`
            );

            setViewedSecret(response.data.secret);
        }

        catch (error) {
            setError(
                error.response?.data?.message || "Unable to decrypt secret"
            );
        }

        finally {
            setActionLoading("");
        }
    };

    const deleteSecret = async (secretId) => {
        const shouldDelete = window.confirm(
            "Delete this secret permanently?"
        );

        if (!shouldDelete) {
            return;
        }

        try {
            setError("");
            setActionLoading(secretId);

            await api.delete(`/api/encrypted-secrets/${secretId}`);

            setSecrets((currentSecrets) =>
                currentSecrets.filter((secret) =>
                    (secret._id || secret.id) !== secretId
                )
            );

            if ((viewedSecret?._id || viewedSecret?.id) === secretId) {
                setViewedSecret(null);
            }
        }

        catch (error) {
            setError(
                error.response?.data?.message || "Unable to delete secret"
            );
        }

        finally {
            setActionLoading("");
        }
    };

    useEffect(() => {
        fetchSecrets();
    }, []);

    return (

        <div className="w-full p-4 md:p-8 lg:px-20">

            {/* Secret Popup */}
            {
                showSecretPopup && (
                    <AddSecret
                        closePopup={() => setShowSecretPopup(false)}
                        onSecretCreated={addSecretToList}
                    />
                )
            }

            {/* Create Link Popup */}
            {
                showLinkPopup && (
                    <CreateLink closePopup={() => setShowLinkPopup(false)} />
                )
            }

            {/* View Secret Popup */}
            {
                viewedSecret && (
                    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">

                        <div className="bg-white w-full max-w-[560px] rounded-2xl p-6 shadow-xl">

                            <div className="flex justify-between items-center gap-4">

                                <h2 className="text-2xl font-bold text-gray-800">
                                    {viewedSecret.title}
                                </h2>

                                <button
                                    onClick={() => setViewedSecret(null)}
                                    className="text-gray-500 hover:text-red-500 text-xl cursor-pointer"
                                >
                                    x
                                </button>

                            </div>

                            <label className="block mt-5 text-sm font-medium text-gray-700">
                                Decrypted Secret
                            </label>

                            <textarea
                                readOnly
                                value={viewedSecret.value}
                                className="mt-2 w-full min-h-[140px] border border-gray-300 rounded-xl px-4 py-3 outline-none bg-gray-50 text-gray-900"
                            />

                            <button
                                onClick={() => setViewedSecret(null)}
                                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all cursor-pointer"
                            >
                                Close
                            </button>

                        </div>

                    </div>
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
            <div className="mt-8 bg-white border border-black-900 rounded-2xl p-4 flex flex-col lg:flex-row justify-between items-center gap-4">

                <input
                    type="text"
                    placeholder="⌕ Search secrets by name, tags, or role..."
                    className="w-full lg:w-[400px] h-[45px] px-4 rounded-xl border border-black-900 outline-none focus:ring-2 focus:ring-blue-500"
                />

            </div>

            {/* Table Section */}
            <div className="mt-8 bg-white rounded-2xl border border-black-900 overflow-hidden">

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
                    <div className="grid grid-cols-4 bg-blue-600 text-white text-sm font-semibold min-w-[700px]">

                        <div className="p-4">
                            Secret Name
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
                        loading && (
                            <div className="p-6 text-sm text-gray-500">
                                Loading secrets...
                            </div>
                        )
                    }

                    {
                        error && (
                            <div className="p-6 text-sm font-medium text-red-600">
                                {error}
                            </div>
                        )
                    }

                    {
                        !loading && !error && secrets.length === 0 && (
                            <div className="p-6 text-sm text-gray-500">
                                No secrets stored yet.
                            </div>
                        )
                    }

                    {
                        !loading && !error && secrets.map((secret) => (

                            <div
                                key={secret._id || secret.id}
                                className="grid grid-cols-4 items-center border-b border-gray-200 hover:bg-gray-50 transition-all text-sm last:border-b-0 min-w-[700px]"
                            >

                                <div className="p-4">
                                    {secret.title}
                                </div>

                                <div className="p-4">
                                    Active
                                </div>

                                <div className="p-4">
                                    {
                                        new Date(
                                            secret.updatedAt || secret.createdAt
                                        ).toLocaleString()
                                    }
                                </div>

                                <div className="p-4 flex justify-center gap-3">

                                    <button
                                        onClick={() => viewSecret(secret._id || secret.id)}
                                        disabled={actionLoading === (secret._id || secret.id)}
                                        className="text-blue-600 hover:text-blue-800 disabled:text-blue-300 font-medium cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {
                                            actionLoading === (secret._id || secret.id)
                                                ? "Loading"
                                                : "View"
                                        }
                                    </button>

                                    <button
                                        onClick={() => deleteSecret(secret._id || secret.id)}
                                        disabled={actionLoading === (secret._id || secret.id)}
                                        className="text-red-500 hover:text-red-700 disabled:text-red-300 font-medium cursor-pointer disabled:cursor-not-allowed"
                                    >
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
