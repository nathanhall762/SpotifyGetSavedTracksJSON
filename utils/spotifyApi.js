const SpotifyWebApi = require("spotify-web-api-node");

// Instantiate the wrapper (credentials from Spotify Developer Dashboard)
var spotifyApi = new SpotifyWebApi({
    clientId: "38f1ee602dbe4bffbb05672320a597f1",
    clientSecret: "f0341666a7764b2dbe5dee8f8259812f",
    redirectUri: "http://localhost:8888/callback",
  });

  module.exports = spotifyApi;