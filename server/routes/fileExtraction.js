const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
// const upload = multer({ dest: "uploads/" });
global.parser_cloud = require("groupdocs-parser-cloud");
global.fs = require("fs");
global.serializer_1 = require("groupdocs-parser-cloud/lib/serializer");
const xlsx = require('xlsx');
const Datauri = require('datauri');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/extract-images", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileBuffer = req.file.buffer;
  // console.log(fileBuffer)

  // Read the Excel file
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  // console.log(workbook)

  // Get the first sheet of the workbook
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Process the sheet to find imported images
  const urls = processSheet(worksheet);

  // Return the URLs as the API response
  res.json({ urls });
});

function processSheet(worksheet) {
  const urls = [];

  // Loop through each cell in the sheet
  for (const cellAddress in worksheet) {
    if (cellAddress.startsWith('!')) continue; // Skip special sheet cells

    const cell = worksheet[cellAddress];

    // Check if the cell contains an image
    if (cell.t === 'd' && cell.v.startsWith('data:image/')) {
      const imageUrl = cell.v;
      
      // Convert the data URI to a buffer
      const buffer = Buffer.from(imageUrl.split(",")[1], 'base64');
      console.log(buffer)

      // Convert the buffer into a URL
      const url = `data:image/png;base64,${buffer.toString('base64')}`;
      urls.push(url);
    }
  }

  return urls;
}


module.exports = router;
