export default function dashBoard() {

  const stats = [
    {
      title: "Total Secrets",
      value: "0"
    },
    {
      title: "Team Members",
      value: "0"
    },
    {
      title: "Active Links",
      value: "0"
    },
    {
      title: "Expiring Soon",
      value: "0"
    },
  ];
  const secrets = [];
  return (

    <div className='w-full'>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome!</h1>
          <h3 className="text-gray-500 text-xl">
            make your stuff secure.
          </h3>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            Create Sharelinks
          </button>
          <button className="px-2 py-2 bg-blue-600 text-white rounded-lg">
            New Secret
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-8 w-full">
        {stats.map((item, index) => (
          <div
            key={index}
            className="border rounded-2xl p-5 shadow-sm"
          >
            <h3 className="text-black-950 font-bold">
              {item.title}
            </h3>
            <h1 className="text-3xl font-bold mt-2">
              {item.value}
            </h1>
          </div>
        ))}
       <div className=" w-full grid grid-cols-4 gap-4 border-b pb-3 mb-4 text-sm text-gray-500 font-medium">
          <p>Secret Name</p>
          <p>Environment</p>
          <p>Last Accessed</p>
          <p>Actions</p>
        </div>
      </div>

    </div>
  );



}