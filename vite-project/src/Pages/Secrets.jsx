export default function Secrets() {
    return (
        <>
            <div className="w-full flex justify-between">
                <div>
                    <h1 className="text-3xl text-black-500 font-bold m-4">Secrets Management</h1>
                    <p className='w-[650px] mt-2 text-gray-600 rounded m-4'>Securely manage, monitor, and rotate your application's environment variables, API keys,
                        and certificates across all clusters.
                    </p>
                </div>
                <div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer m-5 mt-10">
                        + Add New Secret
                    </button>
                </div>
            </div>

            <div className='w-14000px] h-[74px] rounded-lg border border-gray-600 m-4 flex justify-between'>
                <div>
                    <h2 className='text-2xl text-black-500 font-bold m-4'>Credential register</h2>
                </div>
                <div>
                    <input type='text'
                        placeholder="⌕  Search Secrets"
                        className='border border-blue-300 rounded-lg w-[400px] h-[40px] px-4 m-4 ml-14'
                    />
                </div>
            </div>
            
        </>
    );
}