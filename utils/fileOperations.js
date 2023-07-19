const fs = require("fs");

// Function to save JSON data to a file
function saveJsonToFile(filename, jsonData) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, jsonData, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Data saved to ${filename} successfully.`);
        resolve();
      }
    });
  });
}

// Function to read JSON data from a file
function readJsonFromFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}

module.exports = { saveJsonToFile, readJsonFromFile };
