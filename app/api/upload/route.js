import jwt from "jsonwebtoken";
import { mergeExcelRows } from "../../lib/mergeExcel";
import { connectToDatabase } from "../../lib/mongodb"; 
const SECRET_KEY = "your_secret_key";
import { ObjectId } from 'mongodb';
import * as XLSX from "xlsx";

export const POST = async (req) => {
  const cookies = req.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .find((cookie) => cookie.trim().startsWith("authToken="));

  if (!token) {
    return new Response(
      JSON.stringify({ success: false, message: "No token provided" }),
      { status: 401 }
    );
  }

  const authToken = token.split("=")[1];
  try {
    const decoded = jwt.verify(authToken, SECRET_KEY);
    const userId = decoded.userId;

    const formData = await req.formData();
    const files = formData.getAll("files");

    if (files.length !== 3) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please upload exactly 3 files",
        }),
        { status: 400 }
      );
    }

    const originalFiles = [];
    const rowsFromFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      originalFiles.push({ name: file.name, size: file.size });

      // Read Excel file and extract headers
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });

      if (jsonData.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `File "${file.name}" is empty.`,
          }),
          { status: 400 }
        );
      }

      // Extract headers from first row
      const headers = Object.keys(jsonData[0]);

      // Validate required column for each file
      if (i === 0 && !headers.includes("Order Number")) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `File "${file.name}" is missing the required column "Order Number". Please upload a correct file.`,
          }),
          { status: 400 }
        );
      }

      if (i === 1 && !headers.includes("Customer reference")) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `File "${file.name}" is missing the required column "Customer Reference". Please upload a correct file.`,
          }),
          { status: 400 }
        );
      }

      if (i === 2 && !headers.includes("PO Number")) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `File "${file.name}" is missing the required column "PO Number". Please upload a correct file.`,
          }),
          { status: 400 }
        );
      }

      rowsFromFiles.push({ name: file.name, data: buffer });
    }

    // Merge all rows from all files
    const mergedRows = await mergeExcelRows(rowsFromFiles);

    // Save merged file metadata to MongoDB
    const db = await connectToDatabase();
    const collection = db.collection("files");

    const mergedFileDetails = {
      userId: new ObjectId(userId),
      name: "mergedFile",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: JSON.stringify(mergedRows).length,
      uploadedAt: new Date(),
      originalFiles,
      mergedAt: new Date(),
      data: mergedRows,
    };

    // Insert merged file metadata into MongoDB
    const result = await collection.insertOne(mergedFileDetails);

    // Return the merged file details with the MongoDB ObjectId
    const { data, ...fileDetailsWithoutData } = mergedFileDetails;
   console.log(data)
    return new Response(
      JSON.stringify({
        success: true,
        fileDetails: { ...fileDetailsWithoutData, _id: result.insertedId.toString() },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: "Invalid or expired token" }),
      { status: 401 }
    );
  }
};

export const GET = async (req) => {
  const cookies = req.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .find((cookie) => cookie.trim().startsWith("authToken="));

  if (!token) {
    return new Response(
      JSON.stringify({ success: false, message: "No token provided" }),
      { status: 401 }
    );
  }

  const authToken = token.split("=")[1];

  try {
    const decoded = jwt.verify(authToken, SECRET_KEY);
    const userIdFromToken = decoded.userId;

    const userIdFromQuery = req.url.split("?userId=")[1];

    if (!userIdFromQuery) {
      return new Response(
        JSON.stringify({ success: false, message: "User ID is required" }),
        { status: 400 }
      );
    }

    // Ensure the authenticated user is requesting their own files
    if (userIdFromToken !== userIdFromQuery) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized access" }),
        { status: 403 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection("files");
    const files = await collection.find({ userId: new ObjectId(userIdFromToken) }).toArray();

    // Remove 'data' field from each file
    const filteredFiles = files.map(({ ...fileWithoutData }) => fileWithoutData);
    return new Response(JSON.stringify({ success: true, files: filteredFiles }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: "Invalid or expired token" }),
      { status: 401 }
    );
  }
};

