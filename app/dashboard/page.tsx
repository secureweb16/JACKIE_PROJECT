/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, ChangeEvent, FormEvent, useEffect, MouseEvent } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import Image from "next/image";
import Headers from "../components/Headers";
interface UploadedDocument {
  name: string;
  uploadedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: { [key: string]: any }[];
}

export default function FileUpload() {
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    console.log(selectedFile, "selectedFile");

    if (selectedFile) {
      // Check if the file is an Excel file (MIME type or file extension)
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx MIME type
      ];
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

      if (
        !allowedTypes.includes(selectedFile.type) ||
        fileExtension !== "xlsx"
      ) {
        setError("Only .xlsx files are allowed.");
        return; // Exit if the file is not an Excel file
      }

      // If the file is valid, update the state
      const updatedFiles = [...files];
      updatedFiles[index] = selectedFile;
      setFiles(updatedFiles);
      setError(null); // Clear any previous error
    }
  };

  const handleRemoveFile = (index: number, e: MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the file input
    const updatedFiles = [...files];
    updatedFiles[index] = null;
    setFiles(updatedFiles);

    // Reset the file input value so that user can select the same file again
    const fileInput = document.getElementById(
      `file-input-${index}`
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      // Check if the file is an Excel file
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (!allowedTypes.includes(file.type) || fileExtension !== "xlsx") {
        setError("Only .xlsx files are allowed.");
        return;
      }

      const updatedFiles = [...files];
      updatedFiles[index] = file;
      setFiles(updatedFiles);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.some((file) => file === null)) {
      setError("Please select all 3 files.");
      return;
    }

    // Define the correct order of files
    const orderedFiles: (File | null)[] = [
      files[0], // Estore(R) file - First box
      files[1], // CIN & DATA(R) file - Second box
      files[2], // SPS DATA(R) file - Third box
    ];

    // Create a new FormData object and append the files in the desired order
    const formData = new FormData();
    orderedFiles.forEach((file) => {
      if (file) formData.append("files", file);
    });

    try {
      setIsUploading(true);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setIsUploading(false);
      if (data.success) {
        setFiles([null, null, null]);
        fetchFileDetails();
        toast.success("Files Upload Successfully");

        setSuccess("Files uploaded successfully.");
        router.push("/report");
        setIsModalOpen(false);
      } else {
        toast.error(
          "Invalid file type! Please upload a correct file in the box."
        );
        setFiles([null, null, null]);

        setTimeout(() => setError(null), 5000);
      }
    } catch {
      toast.error("Somethng went wrong please try again  ");
      setFiles([null, null, null]);

      setIsUploading(false);
      setError("Error uploading files. Please try again.");
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("authToken", { path: "" });
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    toast.success("Logout successful!");

    router.push("/login");
  };

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
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserName = localStorage.getItem("userName");
      setUserName(storedUserName);
    }
  }, []);

  return (
    <div className="main_body min-h-screen bg-gray-100  relative w-full  ">
      {/* Header */}
      <Headers />
      <div className="main_file_wrapper">
        {/* Upload Button */}
        <div className=" Upload_title_wrapper">
          <h2>Generate your report</h2>
        </div>
        <div className="file_box_wrapper">
          {/* Modal */}

          <div className="flex justify-center items-center z-50">
            <div className="bg-white m-2  p-8 rounded-lg shadow-lg w-full">
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                Upload Files
              </h2>

              {/* File Upload Boxes */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* File Box 1 */}
                  <div
                    className="file_upload_field flex flex-col items-center space-y-2 border-2 border-dashed border-gray-400 p-4 rounded-lg cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(0, e)}
                    onClick={() =>
                      document.getElementById(`file-input-0`)?.click()
                    }
                  >
                    <input
                      id={`file-input-0`}
                      type="file"
                      onChange={(e) => handleFileChange(0, e)}
                      className="hidden"
                      accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />
                    <span className="icon">
                      <Image
                        src="/images/cloud_upload_icon.png"
                        alt="Logo"
                        width={150}
                        height={50}
                      />
                    </span>
                    <div className="text-center">
                      {files[0] ? (
                        <p className="text-lg text-gray-500">
                          {files[0]?.name}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Please upload Estore(R) file
                        </p>
                      )}
                    </div>
                    {files[0] && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFile(0, e)}
                        className="text-red-500 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* File Box 2 */}
                  <div
                    className="file_upload_field flex flex-col items-center space-y-2 border-2 border-dashed border-gray-400 p-4 rounded-lg cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(1, e)}
                    onClick={() =>
                      document.getElementById(`file-input-1`)?.click()
                    }
                  >
                    <input
                      id={`file-input-1`}
                      type="file"
                      onChange={(e) => handleFileChange(1, e)}
                      className="hidden"
                      accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />
                    <span className="icon">
                      <Image
                        src="/images/cloud_upload_icon.png"
                        alt="Logo"
                        width={150}
                        height={50}
                      />
                    </span>
                    <div className="text-center">
                      {files[1] ? (
                        <p className="text-lg text-gray-500">
                          {files[1]?.name}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Please upload CIN & DATA(R) file
                        </p>
                      )}
                    </div>
                    {files[1] && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFile(1, e)}
                        className="text-red-500 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* File Box 3 */}
                  <div
                    className="file_upload_field flex flex-col items-center space-y-2 border-2 border-dashed border-gray-400 p-4 rounded-lg cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(2, e)}
                    onClick={() =>
                      document.getElementById(`file-input-2`)?.click()
                    }
                  >
                    <input
                      id={`file-input-2`}
                      type="file"
                      onChange={(e) => handleFileChange(2, e)}
                      className="hidden"
                      accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />
                    <span className="icon">
                      <Image
                        src="/images/cloud_upload_icon.png"
                        alt="Logo"
                        width={150}
                        height={50}
                      />
                    </span>
                    <div className="text-center">
                      {files[2] ? (
                        <p className="text-lg text-gray-500">
                          {files[2]?.name}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Please upload SPS DATA(R) file
                        </p>
                      )}
                    </div>
                    {files[2] && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFile(2, e)}
                        className="text-red-500 font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-red-500 text-center mt-2">{error}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploading || files.some((file) => file === null)}
                  className={`main_upload_button w-full py-2 px-4 rounded-lg text-white ${
                    isUploading || files.some((file) => file === null)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {isUploading ? "Uploading..." : "Upload Files"}
                </button>
              </form>

              {/* Success Message */}
              {success && (
                <p className="text-green-500 text-center mt-4">{success}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
