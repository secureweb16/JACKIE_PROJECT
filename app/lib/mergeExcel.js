import * as XLSX from "xlsx";

export const mergeExcelRows = async (files) => {
  const orderDetails = [];

  console.log(
    "Files received:",
    files.map((file) => file.name)
  );

  try {
    // Process First File: Orders (Order Number, Order Status, Creation Date, CustomerTag)
    const firstWorkbook = XLSX.read(files[0].data, { type: "buffer" });
    const firstSheet = firstWorkbook.Sheets[firstWorkbook.SheetNames[0]];
    const firstJsonData = XLSX.utils.sheet_to_json(firstSheet, {
      defval: null,
    });

    const firstFileOrders = firstJsonData.map((row) => ({
      orderNumber: String(row["Order Number"]).trim(),
      orderStatus: row["Order Status"],
      creationDate: row["Creation Date"]
        ? new Date(row["Creation Date"]).toISOString().split("T")[0]
        : null,
      customerTag: row["Name"],
    }));
    // console.log(firstFileOrders, "firstFileOrders");

    // Process Second File: Mapping Customer Reference → Order # and Customer
    const secondWorkbook = XLSX.read(files[1].data, { type: "buffer" });
    const secondSheet = secondWorkbook.Sheets[secondWorkbook.SheetNames[0]];
    const secondJsonData = XLSX.utils.sheet_to_json(secondSheet, {
      defval: null,
    });

    const customerReferenceMap = {};
    secondJsonData.forEach((row) => {
      const customerReference = String(row["Customer reference"]).trim();
      const orderNumber = String(row["Order #"]).trim();
      const customer = row["Customer"];

      if (customerReference && orderNumber) {
        customerReferenceMap[customerReference] = {
          orderNumber,
          customer,
        };
      }
    });

    // Process Third File: Mapping PO Number → Qty Ordered, Vendor Style
    const thirdWorkbook = XLSX.read(files[2].data, { type: "buffer" });
    const thirdSheet = thirdWorkbook.Sheets[thirdWorkbook.SheetNames[0]];
    const thirdJsonData = XLSX.utils.sheet_to_json(thirdSheet, {
      defval: null,
    });

    // console.log("Third file headers:", Object.keys(thirdJsonData[0] || {}));

    const poNumberMap = {};
    thirdJsonData.forEach((row) => {
      const poNumber = String(row["PO Number"]).trim();
      // console.log(poNumber, "poNumber");
      const qtyOrdered = row["Qty Ordered"];
      const vendorStyle = row["Vendor Style"];
      // console.log(vendorStyle, "vendorStyle");
    

      if (poNumber) {
        poNumberMap[poNumber] = { qtyOrdered, vendorStyle };
      }
    // console.log(`Mapping PO Number: ${poNumber} → Vendor Style: ${vendorStyle}`);

    });

    // Merge Data from All Three Files
    firstFileOrders.forEach((order) => {
      const customerReferenceEntry = Object.entries(customerReferenceMap).find(
        ([, value]) => value.orderNumber === order.orderNumber
      );

      if (customerReferenceEntry) {
        const [customerReference, { customer }] = customerReferenceEntry;
        const poDetails = poNumberMap[customerReference];
        // console.log(poDetails, "poDetails");
        // console.log(`Order: ${order.orderNumber}, PO: ${customerReference}, Vendor Style: ${poDetails?.vendorStyle}`);

        if (poDetails) {
          orderDetails.push({
            orderNumber: order.orderNumber,
            orderStatus: order.orderStatus,
            creationDate: order.creationDate,
            customerTag: order.customerTag,
            customer,
            qtyOrdered: poDetails.qtyOrdered,
            vendorStyle: poDetails.vendorStyle,
          });
        } else {
          // console.log(`No matching PO found for Order ${order.orderNumber}`);
        }
      }
    });
  } catch (error) {
    console.error("Error processing files:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error processing the files" }),
      { status: 500 }
    );
  }

  return orderDetails;
};
