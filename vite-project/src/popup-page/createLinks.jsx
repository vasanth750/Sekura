import { useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';

export default function CreateLink({ closePopup }) {

    const [secretName, setSecretName] = useState("");
    const [secretValue, setSecretValue] = useState("");
    const [expireTime, setExpireTime] = useState("");
    const [customTime, setCustomTime] = useState("");
    const [showSecret, setShowSecret] = useState(false);

    return (

        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-3">

            {/* Popup Container */}
            <div className="bg-white w-full max-w-[1100px] min-h-[500px] rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Create Secure Link
                    </h2>

                    <button
                        onClick={closePopup}
                        className="text-gray-500 hover:text-red-500 text-2xl cursor-pointer transition-all"
                    >
                        ✕
                    </button>

                </div>

                {/* Search Box */}
                <div className="relative mb-8">

                    <input
                        type="text"
                        placeholder="Search secret by name, tags, or environment..."
                        className="w-full border border-gray-300 rounded-2xl px-5 py-4 pl-14 outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    />

                    <Search
                        size={20}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Secret Name */}
                    <div className="flex flex-col gap-2">

                        <label className="text-sm font-semibold text-gray-700">
                            Secret Name
                        </label>

                        <input
                            type="text"
                            placeholder="Enter Secret Name"
                            value={secretName}
                            onChange={(e) => {
                                setSecretName(e.target.value);
                            }}
                            className="border border-gray-300 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    {/* Expiry Time */}
                    <div className="flex flex-col gap-2">

                        <label className="text-sm font-semibold text-gray-700">
                            Expiry Time
                        </label>

                        <select
                            value={expireTime}
                            onChange={(e) => {
                                setExpireTime(e.target.value);
                            }}
                            className="border border-gray-300 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">
                                Select Expiry Time
                            </option>

                            <option value="5 Minutes">
                                5 Minutes
                            </option>

                            <option value="30 Minutes">
                                30 Minutes
                            </option>

                            <option value="1 Hour">
                                1 Hour
                            </option>

                            <option value="24 Hours">
                                24 Hours
                            </option>

                            <option value="7 Days">
                                7 Days
                            </option>

                            <option value="Custom">
                                Custom Time
                            </option>

                        </select>

                    </div>

                </div>

                {/* Custom Time Input */}
                {
                    expireTime === "Custom" && (

                        <div className="mt-6 flex flex-col gap-2">

                            <label className="text-sm font-semibold text-gray-700">
                                Custom Expiry Time
                            </label>

                            <input
                                type="datetime-local"
                                value={customTime}
                                onChange={(e) => {
                                    setCustomTime(e.target.value);
                                }}
                                className="border border-gray-300 rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                        </div>

                    )
                }

                {/* Secret Section */}
                <div className="mt-8">

                    <label className="text-sm font-semibold text-gray-700">
                        Secret Value
                    </label>

                    <div className="relative mt-2">

                        <input
                            type={showSecret ? "text" : "password"}
                            placeholder="Enter Secret Value"
                            value={secretValue}
                            onChange={(e) => {
                                setSecretValue(e.target.value);
                            }}
                            className="w-full border border-gray-300 rounded-2xl px-4 py-4 pr-14 outline-none focus:ring-2 focus:ring-blue-500"
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

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10">

                    <button
                        onClick={closePopup}
                        className="px-6 py-4 rounded-2xl border border-gray-300 hover:bg-gray-100 transition-all font-semibold cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all cursor-pointer shadow-md">
                        Generate Secure Link
                    </button>

                </div>

            </div>

        </div>

    );
}