// "use client";

// import { useState, ChangeEvent, FormEvent, useEffect, MouseEvent } from "react";
// import Cookies from "js-cookie";
// import { useRouter } from "next/navigation";
// import * as XLSX from "xlsx";
// interface UploadedDocument {
//   name: string;
//   uploadedAt: string;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   data: { [key: string]: any }[]; 
// }

// export default function FileUpload() {
//   const [files, setFiles] = useState<(File | null)[]>([null, null, null]); 
//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [uploadedDocuments, setUploadedDocuments] = useState<
//     UploadedDocument[]
//   >([]);
//   const [isFetching, setIsFetching] = useState<boolean>(true);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [userName, setUserName] = useState<string | null>(null);
//   const router = useRouter();

//   const handleFileChange = (
//     index: number,
//     e: ChangeEvent<HTMLInputElement>
//   ) => {
//     const selectedFile = e.target.files ? e.target.files[0] : null;
//     console.log(selectedFile, "selectedFile");

//     if (selectedFile) {
//       // Check if the file is an Excel file (MIME type or file extension)
//       const allowedTypes = [
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx MIME type
//       ];
//       const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

//       if (
//         !allowedTypes.includes(selectedFile.type) ||
//         fileExtension !== "xlsx"
//       ) {
//         setError("Only .xlsx files are allowed.");
//         return; // Exit if the file is not an Excel file
//       }

//       // If the file is valid, update the state
//       const updatedFiles = [...files];
//       updatedFiles[index] = selectedFile;
//       setFiles(updatedFiles);
//       setError(null); // Clear any previous error
//     }
//   };

//   const handleRemoveFile = (index: number, e: MouseEvent) => {
//     e.stopPropagation(); // Prevent triggering the file input
//     const updatedFiles = [...files];
//     updatedFiles[index] = null;
//     setFiles(updatedFiles);

//     // Reset the file input value so that user can select the same file again
//     const fileInput = document.getElementById(
//       `file-input-${index}`
//     ) as HTMLInputElement;
//     if (fileInput) fileInput.value = "";
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   const handleDrop = (index: number, e: React.DragEvent) => {
//     e.preventDefault();
//     const file = e.dataTransfer.files[0];
//     if (file) {
//       // Check if the file is an Excel file
//       const allowedTypes = [
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       ];
//       const fileExtension = file.name.split(".").pop()?.toLowerCase();

//       if (!allowedTypes.includes(file.type) || fileExtension !== "xlsx") {
//         setError("Only .xlsx files are allowed.");
//         return;
//       }

//       const updatedFiles = [...files];
//       updatedFiles[index] = file;
//       setFiles(updatedFiles);
//       setError(null);
//     }
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     if (files.some((file) => file === null)) {
//       setError("Please select all 3 files.");
//       return;
//     }

//     // Define the correct order of files
//     const orderedFiles: (File | null)[] = [
//       files[0], // Estore(R) file - First box
//       files[1], // CIN & DATA(R) file - Second box
//       files[2], // SPS DATA(R) file - Third box
//     ];

//     // Create a new FormData object and append the files in the desired order
//     const formData = new FormData();
//     orderedFiles.forEach((file) => {
//       if (file) formData.append("files", file);
//     });

//     try {
//       setIsUploading(true);
//       const response = await fetch("/api/upload", {
//         method: "POST",
//         body: formData,
//       });
//       const data = await response.json();
//       setIsUploading(false);
//       if (data.success) {
//         setFiles([null, null, null]);
//         fetchFileDetails();
//         setSuccess("Files uploaded successfully.");
//         setIsModalOpen(false);
//       } else {
//         setError("Please upload file in mention format and order.");
//         setTimeout(() => setError(null), 5000);
//       }
//     } catch {
//       setIsUploading(false);
//       setError("Error uploading files. Please try again.");
//     }
//   };

//   // const handleDownload = (
//   //   data: { vendorStyle: string; creationDate: string; qtyOrdered: number }[]
//   // ) => {
//   //   if (!data.length) {
//   //     console.log("No data available");
//   //     return;
//   //   }

//   //   // Step 1: Extract unique dates
//   //   const uniqueDates = Array.from(
//   //     new Set(data.map(({ creationDate }) => creationDate?.split("T")[0]))
//   //   ).sort();

//   //   // Step 2: Group data by vendorStyle (Customer), ensuring no empty keys
//   //   const groupedData: Record<
//   //     string,
//   //     { Customer: string; Total: number; [key: string]: number | string }
//   //   > = {};

//   //   data.forEach(({ vendorStyle, creationDate, qtyOrdered }) => {
//   //     if (!vendorStyle) return; // Ignore rows with missing vendorStyle

//   //     const formattedDate = creationDate.split("T")[0];

//   //     if (!groupedData[vendorStyle]) {
//   //       groupedData[vendorStyle] = { Customer: vendorStyle, Total: 0 };
//   //     }

//   //     if (!groupedData[vendorStyle][formattedDate]) {
//   //       groupedData[vendorStyle][formattedDate] = 0;
//   //     }

//   //     groupedData[vendorStyle][formattedDate] =
//   //       (groupedData[vendorStyle][formattedDate] as number) + qtyOrdered;
//   //     groupedData[vendorStyle].Total += qtyOrdered;
//   //   });

//   //   // Step 3: Convert grouped data to an array for Excel
//   //   const finalData = Object.values(groupedData).map((entry) => {
//   //     uniqueDates.forEach((date) => {
//   //       if (!entry[date]) entry[date] = 0;
//   //     });

//   //     // Move Total column to the end
//   //     const { Total, ...rest } = entry;
//   //     return { ...rest, Total };
//   //   });

//   //   // Step 4: Convert to Excel format and download
//   //   const ws = XLSX.utils.json_to_sheet(finalData);
//   //   const wb = XLSX.utils.book_new();
//   //   XLSX.utils.book_append_sheet(wb, ws, "Modified Data");

//   //   XLSX.writeFile(wb, "ModifiedData.xlsx");
//   // };
//   const handleDownload = (data: { [key: string]: any }[], fileName: string) => {
//     if (!data.length) {
//       console.log("No data available");
//       return;
//     }
  
//     // Convert data to a worksheet
//     const ws = XLSX.utils.json_to_sheet(data);
  
//     // Create a new workbook and append the sheet
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
//     // Generate the Excel file and trigger the download
//     XLSX.writeFile(wb, `${fileName}.xlsx`);
//   };
  
//   const handleLogout = () => {
//     Cookies.remove("authToken");
//     Cookies.remove("authToken", { path: "" });
//     localStorage.removeItem("userId");
//     localStorage.removeItem("userName");
//     router.push("/login");
//   };

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

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedUserName = localStorage.getItem("userName");
//       setUserName(storedUserName);
//     }
//   }, []);

//   return (
//     <div className="main_body min-h-screen bg-gray-100  relative w-full  ">
//       {/* Header */}
//       <div className="header">
//         <div className="text-xl font-semibold">Welcome to Dashboard</div>
//         <div className="header_nav">
//           <ul>
//             <li>
//               <a href="/dashboard">Dashboard</a>
//             </li>
//             <li>
//               <a href="/dashboard">Reports</a>
//             </li>
//             <li>
//               <a href="/dashboard">Settings</a>
//             </li>
//           </ul>
//         </div>
//         <div className="flex items-center space-x-4">
//           <span className="text-lg">{userName || "Guest"}</span>
//           <button
//             onClick={handleLogout}
//             className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-500 transition"
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//       <div className="main_file_wrapper">
//         {/* Upload Button */}
//         <div className=" Upload_button_wrapper">
//           <button
//             onClick={() => {
//               setFiles([null, null, null]);
//               setIsModalOpen(true);
//               setSuccess(null);
//               setError(null);
//             }}
//             className=""
//           >
//             Upload Documents
//           </button>
//         </div>
//         <div className="file_box_wrapper">
//           {/* Modal */}
//           {isModalOpen && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//               <div className="bg-white m-2  p-8 rounded-lg shadow-lg w-full sm:w-96">
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="absolute  top-12  h-8 right-4 text-red-600 w-8 bg-white text-xl  rounded-full p-2 m-2 shadow-md hover:bg-gray-200 transition items-center justify-center flex"
//                 >
//                   &times;
//                 </button>

//                 <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
//                   Upload Files 
//                 </h2>

//                 {/* File Upload Boxes */}
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div className="grid grid-cols-1 gap-4">
//                     {/* File Box 1 */}
//                     <div
//                       className="flex flex-col items-center space-y-2 border-2 border-dashed border-gray-400 p-4 rounded-lg cursor-pointer"
//                       onDragOver={handleDragOver}
//                       onDrop={(e) => handleDrop(0, e)}
//                       onClick={() =>
//                         document.getElementById(`file-input-0`)?.click()
//                       }
//                     >
//                       <input
//                         id={`file-input-0`}
//                         type="file"
//                         onChange={(e) => handleFileChange(0, e)}
//                         className="hidden"
//                         accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//                       />
//                       <div className="text-center">
//                         {files[0] ? (
//                           <p className="text-lg text-gray-500">
//                             {files[0]?.name}
//                           </p>
//                         ) : (
//                           <p className="text-sm text-gray-500">
//                             Please upload Estore(R) file
//                           </p>
//                         )}
//                       </div>
//                       {files[0] && (
//                         <button
//                           type="button"
//                           onClick={(e) => handleRemoveFile(0, e)}
//                           className="text-red-500 font-semibold"
//                         >
//                           Remove
//                         </button>
//                       )}
//                     </div>

//                     {/* File Box 2 */}
//                     <div
//                       className="flex flex-col items-center space-y-2 border-2 border-dashed border-gray-400 p-4 rounded-lg cursor-pointer"
//                       onDragOver={handleDragOver}
//                       onDrop={(e) => handleDrop(1, e)}
//                       onClick={() =>
//                         document.getElementById(`file-input-1`)?.click()
//                       }
//                     >
//                       <input
//                         id={`file-input-1`}
//                         type="file"
//                         onChange={(e) => handleFileChange(1, e)}
//                         className="hidden"
//                         accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//                       />
//                       <div className="text-center">
//                         {files[1] ? (
//                           <p className="text-lg text-gray-500">
//                             {files[1]?.name}
//                           </p>
//                         ) : (
//                           <p className="text-sm text-gray-500">
//                             Please upload CIN & DATA(R) file
//                           </p>
//                         )}
//                       </div>
//                       {files[1] && (
//                         <button
//                           type="button"
//                           onClick={(e) => handleRemoveFile(1, e)}
//                           className="text-red-500 font-semibold"
//                         >
//                           Remove
//                         </button>
//                       )}
//                     </div>

//                     {/* File Box 3 */}
//                     <div
//                       className="flex flex-col items-center space-y-2 border-2 border-dashed border-gray-400 p-4 rounded-lg cursor-pointer"
//                       onDragOver={handleDragOver}
//                       onDrop={(e) => handleDrop(2, e)}
//                       onClick={() =>
//                         document.getElementById(`file-input-2`)?.click()
//                       }
//                     >
//                       <input
//                         id={`file-input-2`}
//                         type="file"
//                         onChange={(e) => handleFileChange(2, e)}
//                         className="hidden"
//                         accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//                       />
//                       <div className="text-center">
//                         {files[2] ? (
//                           <p className="text-lg text-gray-500">
//                             {files[2]?.name}
//                           </p>
//                         ) : (
//                           <p className="text-sm text-gray-500">
//                             Please upload SPS DATA(R) file
//                           </p>
//                         )}
//                       </div>
//                       {files[2] && (
//                         <button
//                           type="button"
//                           onClick={(e) => handleRemoveFile(2, e)}
//                           className="text-red-500 font-semibold"
//                         >
//                           Remove
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {/* Error Message */}
//                   {error && (
//                     <p className="text-red-500 text-center mt-2">{error}</p>
//                   )}

//                   {/* Submit Button */}
//                   <button
//                     type="submit"
//                     disabled={
//                       isUploading || files.some((file) => file === null)
//                     }
//                     className={`w-full py-2 px-4 rounded-lg text-white ${
//                       isUploading || files.some((file) => file === null)
//                         ? "bg-gray-400 cursor-not-allowed"
//                         : "bg-indigo-600 hover:bg-indigo-700"
//                     }`}
//                   >
//                     {isUploading ? "Uploading..." : "Upload Files"}
//                   </button>
//                 </form>

//                 {/* Success Message */}
//                 {success && (
//                   <p className="text-green-500 text-center mt-4">{success}</p>
//                 )}
//               </div>
//             </div>
//           )}
//           {/* Uploaded Documents */}
//           {isFetching ? (
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
//                     <button
//                       onClick={() => handleDownload(doc.data as { vendorStyle: string; creationDate: string; qtyOrdered: number }[])}
//                       className="mt-4 bg-green-700 text-white px-4 py-2 rounded-lg transition"
//                     >
//                       Download File
//                     </button>
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
//         </div>
//       </div>
//     </div>
//   );
// }
