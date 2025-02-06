/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from "jsonwebtoken";
import { mergeExcelRows } from "../../lib/mergeExcel";
import { connectToDatabase } from "../../lib/mongodb";
const SECRET_KEY = "your_secret_key";
import { ObjectId } from "mongodb";
import * as XLSX from "xlsx";

export const POST = async (req) => {
  const cookies = req.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .find((cookie) => cookie.trim().startsWith("authToken="))
    ?.split("=")[1];

  if (!token) {
    return new Response(
      JSON.stringify({ success: false, message: "No token provided" }),
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
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

    // Validate and read files
    const originalFiles = await Promise.all(
      files.map(async (file, index) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });

        if (!jsonData.length) {
          throw new Error(`File "${file.name}" is empty.`);
        }

        const headers = Object.keys(jsonData[0]);
        const requiredColumns = [
          "Order Number",
          "Customer reference",
          "PO Number",
        ];

        if (!headers.includes(requiredColumns[index])) {
          throw new Error(
            `File "${file.name}" is missing the required column "${requiredColumns[index]}".`
          );
        }

        return { name: file.name, size: file.size, data: buffer };
      })
    );

    // Merge all rows from all files
    const mergedRows = await mergeExcelRows(
      originalFiles.map((file) => ({ name: file.name, data: file.data }))
    );

    // Save merged file metadata to MongoDB
    const db = await connectToDatabase();
    const collection = db.collection("files");

    const mergedFileDetails = {
      userId: new ObjectId(userId),
      name: "mergedFile",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: JSON.stringify(mergedRows).length,
      uploadedAt: new Date(),
      originalFiles: originalFiles.map(({ name, size }) => ({ name, size })),
      mergedAt: new Date(),
      data: mergedRows,
    };

    const result = await collection.insertOne(mergedFileDetails);

    // Exclude 'data' field from the response before sending it to the client
    const { data, ...fileDetailsWithoutData } = mergedFileDetails;

    return new Response(
      JSON.stringify({
        success: true,
        fileDetails: {
          ...fileDetailsWithoutData,
          _id: result.insertedId.toString(),
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Invalid or expired token",
      }),
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
    const files = await collection
      .find({ userId: new ObjectId(userIdFromToken) })
      .toArray();

    // Remove 'data' field from each file
    // const filteredFiles = files.map(({ ...fileWithoutData }) => fileWithoutData);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const filteredFiles = files.map(
      ({ data, ...fileWithoutData }) => fileWithoutData
    );

    return new Response(
      JSON.stringify({ success: true, files: filteredFiles }),
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
