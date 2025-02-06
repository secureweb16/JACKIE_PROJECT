/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Headers from "@/app/components/Headers";

// Define types for the data and state
interface FileDetail {
  Customer: string;
  Total: number;
  [key: string]: number | string; 
}

interface PivotData {
  [customer: string]: {
    [date: string]: number;
    Total: number;
  };
}

const Page = () => {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<FileDetail[]>([]);
  console.log(fileDetails,"fileDetails")
  const [formattedData, setFormattedData] = useState<{ pivotData: PivotData; sortedDates: string[] }>({ pivotData: {}, sortedDates: [] });
  const [id, setId] = useState<string | null>(null);

  const fetchFileDetails = async () => {
    if (!id) {
      setError("ID not found");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("User ID not found");
      return;
    }
    setIsFetching(true);
    try {
      const response = await fetch(`/api/files?id=${id}`);
      const data = await response.json();
      setFileDetails(data.data);
      processData(data.data);
      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      setError("Error fetching file details");
      console.error(error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathId = window.location.pathname.split("/").pop();
      setId(pathId || null);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchFileDetails(); 
    }
  }, [id]); 




  // Function to transform data into pivot format
  const processData = (data: FileDetail[]) => {
    const pivotData: PivotData = {};
    const dateSet = new Set<string>();

    // Iterate over data to structure it
    data?.forEach((item) => {
      const customer = item.Customer;
      if (!pivotData[customer]) {
        pivotData[customer] = { Total: 0 };
      }

      Object.keys(item).forEach((key) => {
        if (key !== "Customer" && key !== "Total") {
          if (typeof item[key] === "number") {
            pivotData[customer][key] = item[key] as number; // Assign value
          }
          dateSet.add(key); // Collect all unique dates
        }
      });

      // Add Total
      pivotData[customer]["Total"] = item.Total;
    });

    // Sort dates
    const sortedDates = Array.from(dateSet).sort();

    setFormattedData({ pivotData, sortedDates });
  };

  // Function to handle download of the table as an Excel file
  const handleDownload = () => {
    const { pivotData, sortedDates } = formattedData;

    // Prepare headers for Excel
    const headers = ["Customer", ...sortedDates, "Total"];
    const rows: (string | number)[][] = [];

    // Prepare the rows for each customer
    Object.keys(pivotData || {}).forEach((customer) => {
      const row: (string | number)[] = [customer];
      sortedDates.forEach((date) => {
        row.push(pivotData[customer][date] || 0); // Add value for each date or 0 if not available
      });
      row.push(pivotData[customer]["Total"] || 0); // Add Total
      rows.push(row);
    });

    // Create a worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pivot Table");

    // Download the Excel file
    XLSX.writeFile(wb, "pivot_table.xlsx");
  };

  return (
    <div>
      {isFetching ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          {/* Header */}
       <Headers/>

          {/* Pivot Table */}
          <div className="relative w-[90%] mx-auto ">
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDownload}
                className="bg-green-700 text-white px-2 py-2 rounded-lg transition"
              >
                Download File
              </button>
            </div>
            <table className="pivot-table m-4 mr-2 p-2 border-collapse ">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Customer</th>
                  {formattedData.sortedDates?.map((date) => (
                    <th key={date} className="px-4 py-2 border">
                      {date}
                    </th>
                  ))}
                  <th className="px-4 py-2 border">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(formattedData.pivotData || {}).map(
                  (customer, index) => (
                    <tr
                      key={customer}
                      className={index % 2 === 0 ? "even-row" : "odd-row"}
                    >
                      <td className="customer px-4 py-2 border">{customer}</td>
                      {formattedData.sortedDates?.map((date) => (
                        <td key={date} className="px-4 py-2 border">
                          {formattedData.pivotData[customer][date] || 0}
                        </td>
                      ))}
                      <td className="total px-4 py-2 border">
                        {formattedData.pivotData[customer]["Total"] || 0}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
