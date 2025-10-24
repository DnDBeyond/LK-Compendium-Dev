const fs = require('fs');
const path = require('path');

const tooltipDataDir = __dirname;
const thirdPartyDir = path.join(tooltipDataDir, '3p-data');
const tooltipMap = {};
const tooltipSet = new Set();

// Helper: load terms from a .json file if it exists
function loadTermsFromFile(filePath) {
  if (fs.existsSync(filePath)) {
    return require(filePath);
  }
  return [];
}

// Get all unique root JSON filenames (excluding index.js)
const baseFiles = fs.readdirSync(tooltipDataDir)
  .filter(file => file.endsWith('.json') && file !== 'index.js')
  .map(file => path.basename(file, '.json'));

// Also include matching files from 3p-data
if (fs.existsSync(thirdPartyDir)) {
  const thirdPartyFiles = fs.readdirSync(thirdPartyDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.basename(file, '.json'));

  for (const file of thirdPartyFiles) {
    if (!baseFiles.includes(file)) {
      baseFiles.push(file);
    }
  }
}

for (const key of baseFiles) {
  const baseFilePath = path.join(tooltipDataDir, `${key}.json`);
  const thirdPartyFilePath = path.join(thirdPartyDir, `${key}.json`);

  const baseTerms = loadTermsFromFile(baseFilePath);
  const thirdPartyTerms = loadTermsFromFile(thirdPartyFilePath);

  // Merge and deduplicate terms (case-insensitive)
  const seen = new Set();
  const combined = [];

  for (const term of [...baseTerms, ...thirdPartyTerms]) {
    const lower = term.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      combined.push(term);
      tooltipSet.add(lower);
    }
  }
  tooltipMap[key] = combined.sort((a, b) => b.length - a.length);
}

module.exports = {
  tooltipMap,
  tooltipSet
};
