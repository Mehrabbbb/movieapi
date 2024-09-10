import fs from 'fs';
import path from 'path';

// Directory paths (can be set via environment variables or CLI arguments)
const inputDir = process.env.INPUT_DIR || 'src/moviedb';
const outputDir = process.env.OUTPUT_DIR || 'update';

// Define the base URL to prepend
const baseUrl = "http://server{segment}.ftpbd.net";

// Function to read and parse JSON file
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading or parsing file ${filePath}:`, error);
    return null;
  }
}

// Function to write JSON data to a file
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated and saved to ${filePath}`);
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error);
  }
}

// Function to prepend the base URL
function prependBaseUrl(link) {
  const match = link.match(/\/FTP-(\d+)\//);
  if (match) {
    const segmentNumber = match[1];
    // Construct the new URL with the base URL
    return `${baseUrl.replace("{segment}", segmentNumber)}${link}`;
  }
  return link;
}

// Process all JSON files in the input directory
async function processJsonFiles() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Read all files in the input directory
  fs.readdir(inputDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      process.exit(1);
    }

    // Filter out only JSON files
    const jsonFiles = files.filter(file => path.extname(file) === '.json');

    if (jsonFiles.length === 0) {
      console.log('No JSON files found in the directory.');
      return;
    }

    // Process each JSON file
    jsonFiles.forEach(file => {
      const filePath = path.join(inputDir, file);
      const jsonData = readJsonFile(filePath);

      if (jsonData) {
        // Handle JSON with nested structure
        Object.keys(jsonData).forEach(key => {
          const yearData = jsonData[key];

          if (!Array.isArray(yearData)) {
            console.error(`Invalid JSON structure in file ${file} for key ${key}: Expected an array.`);
            return;
          }

          // Update all links in the year data
          yearData.forEach(item => {
            if (item.link && typeof item.link === 'string') {
              item.link = prependBaseUrl(item.link);
            } else {
              console.warn('Skipping item with missing or invalid link:', item);
            }
          });
        });

        // Write updated data to a new file in the output directory
        const updatedFilePath = path.join(outputDir, file);
        writeJsonFile(updatedFilePath, jsonData);
      }
    });
  });
}

// Execute the processing function
processJsonFiles();
