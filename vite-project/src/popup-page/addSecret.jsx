    import { useState } from 'react';
    import { Eye, EyeOff } from 'lucide-react';

    export default function AddSecret({ closePopup }) {

        const [secretName, setSecretName] = useState("");
        const [secretValue, setSecretValue] = useState("");
        const [showSecret, setShowSecret] = useState(false);

        return (

            <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">

                <div className="bg-white w-[300px] sm:m-2 md:w-[600px] rounded-2xl p-6 shadow-xl">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-5">

                        <h2 className="text-2xl font-bold text-gray-800">
                            Add Secret
                        </h2>

                        <button
                            onClick={closePopup}
                            className="text-gray-500 hover:text-red-500 text-xl cursor-pointer"
                        >
                            ✕
                        </button>

                    </div>

                    {/* Form */}
                    <div className="flex flex-col gap-2">

                        {/* Secret Name */}
                        <label className="text-sm font-medium text-gray-700">
                            Secret Name
                        </label>

                        <input
                            type="text"
                            placeholder="Enter Secret Name"
                            value={secretName}
                            onChange={(e) => {
                                setSecretName(e.target.value);
                            }}
                            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Secret */}
                        <label className="text-sm font-medium text-gray-700 mt-3">
                            Secret
                        </label>

                        <div className="relative">

                            <input
                                type={showSecret ? "text" : "password"}
                                placeholder="Enter Secret"
                                value={secretValue}
                                onChange={(e) => {
                                    setSecretValue(e.target.value);
                                }}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            {/* Eye Button */}
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 cursor-pointer"
                                onMouseDown={() => setShowSecret(true)}
                                onMouseUp={() => setShowSecret(false)}
                                onMouseLeave={() => setShowSecret(false)}
                                onTouchStart={() => setShowSecret(true)}
                                onTouchEnd={() => setShowSecret(false)}
                            >
                                {
                                    showSecret ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )
                                }
                            </button>

                        </div>

                    </div>

                    {/* Save Button */}
                    <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all cursor-pointer">
                        Save Secret
                    </button>

                </div>

            </div>

        );
    }