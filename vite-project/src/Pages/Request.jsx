import { useState } from "react";
import { Link2, Copy, CheckCircle2 } from "lucide-react";

export default function CreateRequestPage() {

    const [requestName, setRequestName] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [copied, setCopied] = useState(false);

    const handleGenerateLink = () => {

        // Temporary frontend link generation
        const uniqueId = Math.random().toString(36).substring(2, 10);

        const link =
            `${window.location.origin}/request/${uniqueId}`;

        setGeneratedLink(link);
    };

    const handleCopy = async () => {

        await navigator.clipboard.writeText(generatedLink);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex justify-center items-center p-4">

            {/* Main Card */}
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* Top Header */}
                <div className="bg-blue-600 text-white p-8">

                    <div className="flex items-center gap-4">

                        <div className="bg-white/20 p-3 rounded-2xl">

                            <Link2 size={32} />

                        </div>

                        <div>

                            <h1 className="text-3xl font-bold">
                                Create Request Link
                            </h1>

                            <p className="text-blue-100 mt-1">
                                Generate secure request links for collecting secrets safely.
                            </p>

                        </div>

                    </div>

                </div>

                {/* Content */}
                <div className="p-6 md:p-10">

                    <div className="space-y-6">

                        {/* Request Input */}
                        <div>

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                What is this request for?
                            </label>

                            <input
                                type="text"
                                placeholder="Example: Production Database Password"
                                value={requestName}
                                onChange={(e) => {
                                    setRequestName(e.target.value);
                                }}
                                className="w-full border border-gray-300 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 text-base"
                            />

                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerateLink}
                            disabled={!requestName}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition-all shadow-md cursor-pointer"
                        >
                            Generate Request Link
                        </button>

                        {/* Generated Link Section */}
                        {
                            generatedLink && (

                                <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 animate-in fade-in">

                                    <div className="flex items-center gap-2 mb-4">

                                        <CheckCircle2
                                            size={22}
                                            className="text-green-600"
                                        />

                                        <h2 className="text-lg font-bold text-gray-800">
                                            Request Link Generated
                                        </h2>

                                    </div>

                                    {/* Link Box */}
                                    <div className="flex flex-col md:flex-row gap-3">

                                        <input
                                            type="text"
                                            readOnly
                                            value={generatedLink}
                                            className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none"
                                        />

                                        <button
                                            onClick={handleCopy}
                                            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        >
                                            <Copy size={18} />

                                            {
                                                copied
                                                    ? "Copied"
                                                    : "Copy Link"
                                            }
                                        </button>

                                    </div>

                                </div>

                            )
                        }

                    </div>

                </div>

            </div>

        </div>

    );
}