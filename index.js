const express = require("express");
const spotifyApi = require("./utils/spotifyApi");
const { saveJsonToFile, readJsonFromFile } = require("./utils/fileOperations");
const createCSV = require("./utils/csvConverter");
const fs = require("fs");
const csvCombiner = require("./utils/csvCombiner");
const { type } = require("os");

// This file is copied from: https://github.com/thelinmichael/spotify-web-api-node/blob/master/examples/tutorial/00-get-access-token.js

// Scopes for spotify api authorization grant types
const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "app-remote-control",
  "user-read-email",
  "user-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-read-private",
  "playlist-modify-private",
  "user-library-modify",
  "user-library-read",
  "user-top-read",
  "user-read-playback-position",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
];

// Instantiate the express app
const app = express();

// TODO: Add a redirect to home page (app.get('/'))

// Login endpoint
app.get("/login", (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Callback endpoint after login success
app.get("/callback", async (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  const inputFiles = [];

  // Authorization
  spotifyApi.authorizationCodeGrant(code).then(async (data) => {
    const access_token = data.body["access_token"];
    const refresh_token = data.body["refresh_token"];
    const expires_in = data.body["expires_in"];

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    console.log("access_token:", access_token);
    console.log("refresh_token:", refresh_token);

    console.log(
      `Sucessfully retreived access token. Expires in ${expires_in} s.`
    );
    res.send("Success! You can now close the window.");

    setInterval(async () => {
      const data = await spotifyApi.refreshAccessToken();
      const access_token = data.body["access_token"];

      console.log("The access token has been refreshed!");
      console.log("access_token:", access_token);
      spotifyApi.setAccessToken(access_token);
    }, (expires_in / 2) * 1000);

    // Read the CSV data from the file 'filteredCSV.csv'
    // fs.readFile("filteredCSV.csv", "utf8", (err, csvData) => {
    //   if (err) {
    //     console.error("Error reading the file:", err);
    //     return;
    //   }

    //   // Split the CSV data into an array of lines
    //   const lines = csvData.split("\n");

    //   // Get the header line (first line) and split it into an array of column names
    //   const headers = lines[0].split(",");

    //   // Find the index of the 'track.id' column
    //   const trackIdIndex = headers.indexOf("track.id");

    //   // Initialize an empty array to store the track IDs
    //   const trackIds = [];

    //   // Iterate through each line (starting from the second line) to extract the track IDs
    //   for (let i = 1; i < lines.length; i++) {
    //     const currentLine = lines[i].split(",");
    //     const trackId = currentLine[trackIdIndex];
    //     trackIds.push(trackId);
    //   }

    //   // Convert trackIds to a string format spotify:track:trackId1,spotify:track:trackId2,...
    //   trackIdsString = trackIds
    //     .map((trackId) => `spotify:track:${trackId}`)
    //     .join(",");

    //   // Now, 'trackIds' contains all the track IDs from the CSV in an array
    //   console.log(trackIdsString);

    //   // Use trackIdsString to add Items to Playlist with playlist_id = 7kPsYLA4b3SjCZXhXpJJ7E
    //   spotifyApi
    //     .addTracksToPlaylist("7kPsYLA4b3SjCZXhXpJJ7E", trackIdsString)
    //     .then(
    //       function (data) {
    //         console.log("Added tracks to playlist!");
    //       },
    //       function (err) {
    //         console.log("Something went wrong!", err);
    //       }
    //     );
    // });
  });

  // Function to get audio features and merge with saved tracks data
  // async function getAudioFeaturesAndMerge(filename) {
  //   try {
  //     // Read the saved tracks data from the JSON file
  //     const data = await fs.promises.readFile(filename, "utf8");
  //     const savedTracksData = JSON.parse(data);

  //     // Extract track IDs from the saved tracks data
  //     const trackIds = savedTracksData.map((track) => track.track.id);

  //     // Get audio features for the track IDs
  //     const audioFeatures = await spotifyApi.getAudioFeaturesForTracks(
  //       trackIds
  //     );

  //     // Merge the audio features with the saved tracks data
  //     const mergedData = savedTracksData.map((track) => {
  //       const audioFeature = audioFeatures.body.audio_features.find(
  //         (feature) => feature.id === track.track.id
  //       );
  //       return {
  //         ...track,
  //         acousticness: audioFeature.acousticness,
  //         danceability: audioFeature.danceability,
  //         energy: audioFeature.energy,
  //         instrumentalness: audioFeature.instrumentalness,
  //         key: audioFeature.key,
  //         liveness: audioFeature.liveness,
  //         loudness: audioFeature.loudness,
  //         mode: audioFeature.mode,
  //         speechiness: audioFeature.speechiness,
  //         tempo: audioFeature.tempo,
  //         time_signature: audioFeature.time_signature,
  //         valence: audioFeature.valence,
  //       };
  //     });

  //     // Write the merged data back to the JSON file
  //     const mergedJsonData = JSON.stringify(mergedData, null, 2); // Format with 2 spaces for better readability
  //     await fs.promises.writeFile(filename, mergedJsonData);

  //     console.log("Audio features successfully merged with saved tracks data.");
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // }
});

//

app.listen(8888, () =>
  console.log(
    "HTTP Server up. Now go to http://localhost:8888/login in your browser."
  )
);
