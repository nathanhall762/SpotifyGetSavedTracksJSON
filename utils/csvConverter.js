const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function createCSV(filename, records) {
  try {
    // Log the records to check if the data is correct
    console.log("Records to be written to CSV:", records);

    // Define the CSV header
    const csvWriter = createCsvWriter({
      path: filename,
      headerIdDelimiter: ".",
      header: [
        "track.name",
        "track.id",
        "track.album.album_type",
        "track.album.name",
        "track.album.release_date",
        "track.artists.name",
        "track.artists.id",
        "track.duration_ms",
        "track.popularity",
        "acousticness",
        "danceability",
        "energy",
        "instrumentalness",
        "key",
        "liveness",
        "loudness",
        "mode",
        "speechiness",
        "tempo",
        "time_signature",
        "valence",
        "track.external_urls.spotify",
        "track.uri",
      ].map((key) => ({ id: key, title: key })),
    });

    // Write the records to the CSV file
    await csvWriter.writeRecords(records);

    console.log("CSV file successfully created!");
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = createCSV;
