const fs = require("fs");
const csvParser = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Function to read a CSV file and return its content as an array of objects
async function readCSV(filename) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filename)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

// Function to combine data from multiple CSV files into a single array
async function combineCSVFiles(filenames) {
  let combinedData = [];
  for (const filename of filenames) {
    const data = await readCSV(filename);
    combinedData = combinedData.concat(data);
  }
  return combinedData;
}

// Function to write the combined data to a new CSV file
async function writeCombinedCSV(filename, data) {
  const csvWriter = createCsvWriter({
    path: filename,
    header: Object.keys(data[0]).map((key) => ({ id: key, title: key })),
  });

  await csvWriter.writeRecords(data);
  console.log(`Combined data written to ${filename}`);
}

module.exports = {
  readCSV,
  combineCSVFiles,
  writeCombinedCSV,
};
