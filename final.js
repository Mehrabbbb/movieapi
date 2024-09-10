import fs from 'fs';
import path from 'path';


// Path to the folder containing JSON files to update
const updateFolderPath = './update';
const convertToUrl = (name) => {
    // Replace spaces with hyphens and remove special characters
    let url = name
        .toLowerCase() // Convert to lowercase
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters (excluding spaces and hyphens)
        .trim() // Remove leading/trailing spaces
        .replace(/\s+/g, '-') // Replace multiple spaces with a single hyphen
        .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen


    return encodeURI(url);
};









const patternsToRemove = [
  /\b720p\b/i,
  /\b1080p\b/i,
  /\b4K\b/i,
  /\b2160p\b/i,
  /\bBlu-Ray\b/i,
  /\bBluRay\b/i,
  /\bWEBHDRip\b/i,
  /\bWEBRip\b/i,
  /\bWEB-Rip\b/i,
  /\bWEB-HD\b/i,
  /\bWEBHD-Rip\b/i,
  /\bDvDRip\b/i,
  /\bHDRip\b/i,
  /\bWebDL\b/i,
  /\bDVDrip\b/i,
  /\bWEB-DL\b/i,
  /\bSCam\b/i,
  /\bFull HD\b/i,
  /\bHD-TS\b/i,
  /\b\.720p\b/i,
  /\b\.1080p\b/i,
  /\b\.4K\b/i,
  /\b\.2160p\b/i,
  /\b\.Blu-Ray\b/i,
  /\b\.BluRay\b/i,
  /\b\.WEBHDRip\b/i,
  /\b\.WEBRip\b/i,
  /\b\.WEB-Rip\b/i,
  /\b\.WEB-HD\b/i,
  /\b\.WEBHD-Rip\b/i,
  /\b\.DvDRip\b/i,
  /\b\.HDRip\b/i,
  /\b\.WebDL\b/i,
  /\b\.DVDrip\b/i,
  /\b\.WEB-DL\b/i,
  /\b\.SCam\b/i,
  /\b\.Full HD\b/i,
  /\b\.HD-TS\b/i,
  /\b720p\b/i,
  /\b1080p\b/i,
  /\b4K\b/i,
  /\b2160p\b/i,
  /\[\s*\]/g // Pattern to remove empty square brackets
];



const resolutionRegex  = /\b(720p|1080p|4K|2160p)\b/i;
    const typeRegex  = /\b(Blu-Ray|BluRay|WEBHDRip|WEBRip|WEB-Rip|WEB-HD|WEBHD-Rip|DvDRip|HDRip|WebDL|DVDrip|WEB-DL|SCam|Full HD|HD-TS)\b/i;

// Function to clean video names by removing known patterns
// Function to trim video name
function trimVideoName(name) {
  let trimmedName = name;
  
  // Remove specified patterns
  patternsToRemove.forEach(pattern => {
    trimmedName = trimmedName.replace(pattern, '');
  });

  // Remove content within square brackets and the brackets themselves
  trimmedName = trimmedName.replace(/\[.*?\]/g, '');

  // Remove any extra spaces
  trimmedName = trimmedName.replace(/\s\s+/g, ' ').trim();

  return trimmedName;
}
// Function to extract resolution from a video name
function extractResolution(name) {
  const match = name.match(resolutionRegex);
  return match ? match[0] : 'Unknown';
}

// Function to extract type from a video name
function extractType(name) {
  const match = name.match(typeRegex);
  return match ? match[0] : 'Unknown';
}

// Function to process and clean video data
function processVideos(data) {
  for (const year in data) {
    data[year] = data[year].map(video => {
      const title = trimVideoName(video.name);
      const url = convertToUrl(title);
      return {
        ...video,
        url,
        title,
        resolution: extractResolution(video.name),
        type: extractType(video.name)
      };
    });
  }
}

// Function to get JSON files from a folder
function getJsonFilesFromFolder(folderPath) {
  return fs.readdirSync(folderPath).filter(file => path.extname(file) === '.json');
}

// Function to read a JSON file
function readJsonFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Function to write data back to a JSON file
function writeJsonFile(filePath, data) {
  const fileContent = JSON.stringify(data, null, 2); // Pretty print with 2 spaces
  fs.writeFileSync(filePath, fileContent, 'utf-8');
}

// Main processing function
function processFiles() {
  const jsonFiles = getJsonFilesFromFolder(updateFolderPath);

  jsonFiles.forEach(file => {
    const filePath = path.join(updateFolderPath, file);
    try {
      const jsonData = readJsonFile(filePath);
      if (typeof jsonData === 'object' && jsonData !== null) {
        processVideos(jsonData);
        writeJsonFile(filePath, jsonData);
        console.log(`Processed and updated file: ${file}`);
      } else {
        console.error(`Invalid JSON structure in file ${file}: Expected an object.`);
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  });
}

// Run the file processing
processFiles();
