// "use client";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Image from "next/image";

// const Page = () => {
//   const [isFetching, setIsFetching] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [fileDetails, setFileDetails] = useState<any[]>([]);
//   const [formattedData, setFormattedData] = useState<any>({});
//   const [userName, setUserName] = useState<string | null>(null);
//   const [uploadedDocuments, setUploadedDocuments] = useState<
//     UploadedDocument[]
//   >([]);
//   interface UploadedDocument {
//     name: string;
//     uploadedAt: string;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     data: { [key: string]: any }[]; 
//   }
//   console.log(formattedData,"formattedData")

//   const fetchFileDetails = async () => {
//     const userId = localStorage.getItem("userId");
//     if (!userId) {
//       setError("User ID not found");
//       return;
//     }
//     setIsFetching(true);
//     try {
//       const response = await fetch(`/api/upload?userId=${userId}`);
//       const data = await response.json();
//       setIsFetching(false);
//       if (data.success) {
//         setUploadedDocuments(data?.files);
//       } else {
//         setError(data.message);
//       }
//     } catch (error) {
//       setIsFetching(false);
//       setError("Error fetching file details");
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     fetchFileDetails();
//   }, []);
//   const handleLogout = () => {
//     Cookies.remove("authToken");
//     Cookies.remove("authToken", { path: "" });
//     localStorage.removeItem("userId");
//     localStorage.removeItem("userName");
//     router.push("/login");
//   };
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedUserName = localStorage.getItem("userName");
//       setUserName(storedUserName);
//     }
//   }, []);

//   // Function to transform data into pivot format
//   const processData = (data: any[]) => {
//     const pivotData: any = {};
//     const dateSet = new Set<string>();

//     // Iterate over data to structure it
//     data?.forEach((item) => {
//       const customer = item.Customer;
//       if (!pivotData[customer]) {
//         pivotData[customer] = {};
//       }

//       Object.keys(item).forEach((key) => {
//         if (key !== "Customer" && key !== "Total") {
//           pivotData[customer][key] = item[key]; // Assign value
//           dateSet.add(key); // Collect all unique dates
//         }
//       });

//       // Add Total
//       pivotData[customer]["Total"] = item.Total;
//     });

//     // Sort dates
//     const sortedDates = Array.from(dateSet).sort();

//     setFormattedData({ pivotData, sortedDates });
//   };

//   return (
//     <div>
//       {isFetching ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p>{error}</p>
//       ) : (
//         <>
//         {/* Header */}
//         <div className="header">
//               <div className="text-xl font-semibold">Welcome to Dashboard</div>
//               <div className="header_nav">
//                 <ul>
//                   <li>
//                     <a href="/dashboard">Dashboard</a>
//                   </li>
//                   <li>
//                     <a href="/report">Reports</a>
//                   </li>
                
//                 </ul>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <span className="text-lg">{userName || "Guest"}</span>
//                 <button
//                   onClick={handleLogout}
//                   className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-500 transition"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
            
//         {/* Uploaded Documents */}
//         {isFetching ? (
//             <div className="flex justify-center items-center h-[50vh]">
//               <p className="text-gray-500 text-xl animate-pulse">Loading...</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 p-8  sm:grid-cols-2 md:grid-cols-3 gap-6  w-full">
//               {uploadedDocuments?.length > 0 ? (
//                 uploadedDocuments.map((doc, index) => (
//                   <div
//                     key={index}
//                     className="file_box"
//                   >
//                     <h3 className="text-lg text-gray-800">
//                       <span className="font-semibold"> File Name: </span>{" "}
//                       {doc.name + ' ' + (index +1 )}
//                     </h3>
//                     <p className="text-lg text-gray-800">
//                       <span className="font-semibold">Uploaded Date:</span>{" "}
//                       {new Date(doc.uploadedAt).toISOString().split("T")[0]}
//                     </p>
//                                           <Image src="/images/eye.png" alt="Logo" width={50} height={30} />
                    
//                     {/* <button
//                       onClick={() => handleDownload(doc.data as { vendorStyle: string; creationDate: string; qtyOrdered: number }[])}
//                       className="mt-4 bg-green-700 text-white px-4 py-2 rounded-lg transition"
//                     >
//                       Download File
//                     </button> */}
//                   </div>
//                 ))
//               ) : (
//                 <div className="col-span-full flex justify-center items-center w-full min-h-[50vh]">
//                   <p className="text-gray-500 text-xl text-center">
//                     No documents uploaded yet.
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
              
//               </>
//       )}
//     </div>
//   );
// };

// export default Page;





"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Page = () => {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  console.log(error,"error")
  const [userName, setUserName] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const router = useRouter();

  interface UploadedDocument {
    name: string;
    uploadedAt: string;
    _id: string; // Ensure _id is available for navigation
  }

  const fetchFileDetails = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User ID not found");
      return;
    }
    setIsFetching(true);
    try {
      const response = await fetch(`/api/upload?userId=${userId}`);
      const data = await response.json();
      setIsFetching(false);
      if (data.success) {
        setUploadedDocuments(data?.files);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setIsFetching(false);
      setError("Error fetching file details");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFileDetails();
    if (typeof window !== "undefined") {
      const storedUserName = localStorage.getItem("userName");
      setUserName(storedUserName);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="header">
              <div className="text-xl font-semibold">Welcome to Dashboard</div>
              <div className="header_nav">
                <ul>
                  <li>
                    <a href="/dashboard">Dashboard</a>
                  </li>
                  <li>
                    <a href="/report">Reports</a>
                  </li>
                
                </ul>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg">{userName || "Guest"}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-500 transition"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className=" Upload_title_wrapper mt-8">
          <h2>
         List of Converted Report
          </h2>
        </div>
      {/* Uploaded Documents */}
      <div className="p-8">
        {isFetching ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500 text-xl animate-pulse">Loading...</p>
          </div>

        ) : uploadedDocuments?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
       
           
            {uploadedDocuments.map((doc, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-xl "
                onClick={() => router.push(`/report/${doc._id}`)} 
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  📄 {doc.name + " " + (index + 1)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Uploaded: {new Date(doc.uploadedAt).toISOString().split("T")[0]}
                </p>
                <div className="flex justify-end mt-4 ">
                  <Image src="/images/eye.png" alt="View Report" width={40} height={30} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500 text-xl text-center">No documents uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

