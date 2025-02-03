import jwt from "jsonwebtoken";
import { connectToDatabase } from "../../lib/mongodb"; 
const SECRET_KEY = "your_secret_key";
import { ObjectId } from 'mongodb';

export const GET = async (req) => {
    const url = new URL(req.url);
    const reportId = url.searchParams.get('id');  // Get the report ID from query parameters
console.log(reportId,"reportId")
    if (!reportId) {
      return new Response(
        JSON.stringify({ success: false, message: "Report ID is required" }),
        { status: 400 }
      );
    }

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

      const db = await connectToDatabase();
      const collection = db.collection("files");

      // Fetch the report for the specific ID and user
      const report = await collection.findOne({ 
        _id: new ObjectId(reportId),
        userId: new ObjectId(userIdFromToken)
      });

      if (!report) {
        return new Response(
          JSON.stringify({ success: false, message: "Report not found" }),
          { status: 404 }
        );
      }

      // Extract data from the merged file
      const rawData = report.data; // Assuming data is stored as an array

      // Step 1: Extract unique dates
      const uniqueDates = Array.from(
        new Set(rawData.map(({ creationDate }) => creationDate?.split("T")[0]))
      ).sort();

      // Step 2: Group data by vendorStyle (Customer)
      const groupedData = {};

      rawData.forEach(({ vendorStyle, creationDate, qtyOrdered }) => {
        if (!vendorStyle) return;

        const formattedDate = creationDate.split("T")[0];

        if (!groupedData[vendorStyle]) {
          groupedData[vendorStyle] = { Customer: vendorStyle, Total: 0 };
        }

        if (!groupedData[vendorStyle][formattedDate]) {
          groupedData[vendorStyle][formattedDate] = 0;
        }

        groupedData[vendorStyle][formattedDate] += qtyOrdered;
        groupedData[vendorStyle].Total += qtyOrdered;
      });

      // Step 3: Convert grouped data to an array
      const finalData = Object.values(groupedData).map((entry) => {
        uniqueDates.forEach((date) => {
          if (!entry[date]) entry[date] = 0;
        });

        // Move Total column to the end
        const { Total, ...rest } = entry;
        return { ...rest, Total };
      });

      return new Response(JSON.stringify({ success: true, data: finalData }), {
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid or expired token" }),
        { status: 401 }
      );
    }
};
