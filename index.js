const express = require("express");
const spotifyApi = require("./utils/spotifyApi");
const { saveJsonToFile, readJsonFromFile } = require("./utils/fileOperations");
const createCSV = require("./utils/csvConverter");
const fs = require("fs");
const csvCombiner = require("./utils/csvCombiner");

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

    // Get tracks in the signed-in user's Your Music library
    for (let i = 0; i < 1300; i += 50) {
      try {
        const data = await spotifyApi.getMySavedTracks({
          limit: 50,
          offset: i,
        });
        console.log(data.body.items);

        // Save data.body.items to a JSON file
        const savedTracksData = data.body.items;
        const jsonData = JSON.stringify(savedTracksData, null, 2); // Format with 2 spaces for better readability
        const filename = "saved_tracks.json";

        // Write the data to a JSON file
        await saveJsonToFile(filename, jsonData);

        // Call the function to get audio features and merge with saved tracks data
        await getAudioFeaturesAndMerge(filename);

        // Read the merged data from the JSON file
        const mergedData = await readJsonFromFile(filename);
        console.log("Merged data:", mergedData);

        // Create the CSV
        await createCSV(`output${i}.csv`, mergedData);

        // Store the generated CSV file names to be used for combining later
        inputFiles.push(`output${i}.csv`);
      } catch (err) {
        console.log("Something went wrong!", err);
      }
    }

    // Combine the CSV files
    const outputFile = "combined_output.csv";

    try {
      const combinedData = await csvCombiner.combineCSVFiles(inputFiles);
      await csvCombiner.writeCombinedCSV(outputFile, combinedData);
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // Function to get audio features and merge with saved tracks data
  async function getAudioFeaturesAndMerge(filename) {
    try {
      // Read the saved tracks data from the JSON file
      const data = await fs.promises.readFile(filename, "utf8");
      const savedTracksData = JSON.parse(data);

      // Extract track IDs from the saved tracks data
      const trackIds = savedTracksData.map((track) => track.track.id);

      // Get audio features for the track IDs
      const audioFeatures = await spotifyApi.getAudioFeaturesForTracks(
        trackIds
      );

      // Merge the audio features with the saved tracks data
      const mergedData = savedTracksData.map((track) => {
        const audioFeature = audioFeatures.body.audio_features.find(
          (feature) => feature.id === track.track.id
        );
        return {
          ...track,
          acousticness: audioFeature.acousticness,
          danceability: audioFeature.danceability,
          energy: audioFeature.energy,
          instrumentalness: audioFeature.instrumentalness,
          key: audioFeature.key,
          liveness: audioFeature.liveness,
          loudness: audioFeature.loudness,
          mode: audioFeature.mode,
          speechiness: audioFeature.speechiness,
          tempo: audioFeature.tempo,
          time_signature: audioFeature.time_signature,
          valence: audioFeature.valence,
        };
      });

      // Write the merged data back to the JSON file
      const mergedJsonData = JSON.stringify(mergedData, null, 2); // Format with 2 spaces for better readability
      await fs.promises.writeFile(filename, mergedJsonData);

      console.log("Audio features successfully merged with saved tracks data.");
    } catch (error) {
      console.error("Error:", error);
    }
  }
});

// 

app.listen(8888, () =>
  console.log(
    "HTTP Server up. Now go to http://localhost:8888/login in your browser."
  )
);
