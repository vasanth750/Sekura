import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function RequestPage() {

    const [secretValue, setSecretValue] = useState("");
    const [showSecret, setShowSecret] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {

        e.preventDefault();

        console.log({
            secret: secretValue
        });

        setSubmitted(true);
    };

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex justify-center items-center p-4">

            {/* Main Card */}
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">

                {/* Top Banner */}
                <div className="bg-blue-600 p-8 text-white">

                    <div className="flex items-center gap-3">

                        <ShieldCheck size={34} />

                        <div>

                            <h1 className="text-3xl font-bold">
                                Sekura Secret Request
                            </h1>

                            <p className="text-blue-100 mt-1 text-sm md:text-base">
                                Safely share confidential credentials using encrypted transmission.
                            </p>

                        </div>

                    </div>

                </div>

                {/* Form Section */}
                <div className="p-6 md:p-10">

                    {
                        !submitted ? (

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >

                                {/* Requested Secret */}
                                <div>

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Requested Secret
                                    </label>

                                    <input
                                        type="text"
                                        value="Production Database Password"
                                        disabled
                                        className="w-full bg-gray-100 border border-gray-300 rounded-2xl px-4 py-4 text-gray-500 font-medium"
                                    />

                                </div>

                                {/* Secret Input */}
                                <div>

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Enter Secret
                                    </label>

                                    <div className="relative">

                                        <input
                                            type={showSecret ? "text" : "password"}
                                            placeholder="Enter the requested secret"
                                            value={secretValue}
                                            onChange={(e) => {
                                                setSecretValue(e.target.value);
                                            }}
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-4 pr-14 outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                        />

                                        {/* Eye Button */}
                                        <button
                                            type="button"
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 cursor-pointer"
                                            onMouseDown={() => setShowSecret(true)}
                                            onMouseUp={() => setShowSecret(false)}
                                            onMouseLeave={() => setShowSecret(false)}
                                            onTouchStart={() => setShowSecret(true)}
                                            onTouchEnd={() => setShowSecret(false)}
                                        >
                                            {
                                                showSecret ? (
                                                    <EyeOff size={22} />
                                                ) : (
                                                    <Eye size={22} />
                                                )
                                            }
                                        </button>

                                    </div>

                                </div>

                                {/* Additional Notes */}
                                <div>

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Notes (Optional)
                                    </label>

                                    <textarea
                                        rows="4"
                                        placeholder="Add any additional information..."
                                        className="w-full border border-gray-300 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />

                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all shadow-md cursor-pointer"
                                >
                                    Submit Secret Securely
                                </button>

                            </form>

                        ) : (

                            /* Success Message */
                            <div className="flex flex-col items-center justify-center text-center py-10">

                                <div className="w-20 h-20 rounded-full bg-green-100 flex justify-center items-center mb-5">

                                    <ShieldCheck
                                        size={40}
                                        className="text-green-600"
                                    />

                                </div>

                                <h2 className="text-3xl font-bold text-gray-800">
                                    Secret Submitted
                                </h2>

                                <p className="text-gray-500 mt-3 max-w-md">
                                    Your confidential secret has been securely transmitted successfully.
                                </p>

                            </div>

                        )
                    }

                </div>

            </div>

        </div>

    );
}
