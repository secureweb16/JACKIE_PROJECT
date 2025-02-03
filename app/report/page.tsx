"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Headers from "../components/Headers";

const Page = () => {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  console.log(error, "error");
  const [userName, setUserName] = useState<string | null>(null);
  console.log(userName, "userName");
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);
  const router = useRouter();

  interface UploadedDocument {
    name: string;
    uploadedAt: string;
    _id: string;
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Headers />
      <div className=" Upload_title_wrapper mt-8">
        <h2>List of Converted Report</h2>
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
                <p className="text-sm text-gray-800 mt-1">
                  <span className="font-semibold text-gray-800">
                    Uploaded At:
                  </span>{" "}
                  {new Date(doc.uploadedAt).toISOString().split("T")[0]}
                </p>
                <div className="flex justify-end mt-4 ">
                  <Image
                    src="/images/eye.png"
                    alt="View Report"
                    width={40}
                    height={30}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500 text-xl text-center">
              No documents uploaded yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
