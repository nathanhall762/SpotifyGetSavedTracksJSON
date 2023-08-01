const fs = require('fs');

function createTrackIDStrings(trackIDs, maxTracksPerString = 100) {
  const trackIDStrings = [];
  let currentString = [];

  for (const trackID of trackIDs) {
    currentString.push(`spotify:track:${trackID}`);

    if (currentString.length === maxTracksPerString) {
      trackIDStrings.push(currentString.join(','));
      currentString = [];
    }
  }

  if (currentString.length > 0) {
    trackIDStrings.push(currentString.join(','));
  }

  return trackIDStrings;
}

function readTrackIDsFromFile(filename) {
  try {
    const data = fs.readFileSync(filename, 'utf8');
    return data.split('\n').map((trackID) => trackID.trim());
  } catch (err) {
    console.error('Error reading the file:', err);
    return [];
  }
}

const filename = 'filteredCSV.csv';
const trackIDs = readTrackIDsFromFile(filename);

// Call the function to create track ID strings
const resultingStrings = createTrackIDStrings(trackIDs);

// Print or use the resulting strings as needed
resultingStrings.forEach((string) => {
  console.log(`string--------------------------------------------------------------------------${string}`);
});
