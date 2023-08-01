const fs = require('fs');

function readJSONFile(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData).tracks.items.map(item => item.track.id);
}

function findUniqueSongs(file1Path, file2Path) {
  const file1Songs = readJSONFile(file1Path);
  const file2Songs = readJSONFile(file2Path);

  // Using Set to easily perform array comparison
  const file1Set = new Set(file1Songs);
  const file2Set = new Set(file2Songs);

  // Finding the difference between the two sets
  const uniqueSongs = file1Songs.filter(songId => !file2Set.has(songId));

  return uniqueSongs;
}

// Example usage:
const file1Path = '125to132.json';
const file2Path = '4starsandup.json';
const result = findUniqueSongs(file1Path, file2Path);
console.log('Unique Songs:', result);
console.log('Count of Unique Songs:', result.length);

const formattedString = result.map(id => `spotify:track:${id}`).join(',');
console.log('Example value:', formattedString);
