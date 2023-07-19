const fs = require("fs");
const { type } = require("os");

// Read the CSV data from the file 'filteredCSV.csv'
fs.readFile("filteredCSV.csv", "utf8", (err, csvData) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  // Split the CSV data into an array of lines
  const lines = csvData.split("\n");

  // Get the header line (first line) and split it into an array of column names
  const headers = lines[0].split(",");

  // Find the index of the 'track.id' column
  const trackIdIndex = headers.indexOf("track.id");

  // Initialize an empty array to store the track IDs
  const trackIds = [];

  // Iterate through each line (starting from the second line) to extract the track IDs
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(",");
    const trackId = currentLine[trackIdIndex];
    trackIds.push(trackId);
  }

  // Convert trackIds to a string format spotify:track:trackId1,spotify:track:trackId2,...
    trackIdsString = trackIds.map((trackId) => `spotify:track:${trackId}`).join(",");

  // Now, 'trackIds' contains all the track IDs from the CSV in an array
  console.log(trackIdsString);
});
