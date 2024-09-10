import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';

const baseUrl = 'http://server3.ftpbd.net/FTP-3/Bangla%20Collection/BANGLA/Kolkata%20Bangla%20Movies/';

async function fetchMoviesForYear(year) {
    const url = `${baseUrl}(${year})/`;
    try {
        // Fetch HTML content from the remote server
        const response = await fetch(url);

        // Check if the response status is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the HTML content
        const data = await response.text();

        // Parse the HTML with JSDOM
        const dom = new JSDOM(data);
        const document = dom.window.document;

        // Initialize an empty array to store the results
        let links = [];

        // Select all 'tr' elements in the document
        let rows = document.querySelectorAll('tr');

        // Iterate over each 'tr' element
        rows.forEach(row => {
            // Find the 'img' tag within 'td.fb-i' of this row
            const imgElement = row.querySelector('td.fb-i img');
            
            // Check if the 'img' tag exists and its 'alt' attribute is 'folder'
            if (imgElement && imgElement.alt === 'folder') {
                // Find the 'a' tag within 'td.fb-n' of this row
                const linkElement = row.querySelector('td.fb-n a');
                
                if (linkElement) {
                    // Extract the 'href' attribute and inner HTML
                    const link = linkElement.href;
                    const name = linkElement.textContent.trim();
                    
                    // Store the result
                    links.push({ name: name, link: link ,year:year,category:'kolkata'});
                }
            }
        });

        return links;

    } catch (error) {
        console.error(`Error fetching movie list for year ${year}:`, error);
        return [];
    }
}

async function fetchAllMovies() {
    let allMovies = {};

    for (let year = 2000; year <= 2024; year++) {
        console.log(`Fetching data for year ${year}...`);
        const movies = await fetchMoviesForYear(year);
        allMovies[year] = movies;
    }

    // Save the collected data to a JSON file
    fs.writeFileSync('movies_data.json', JSON.stringify(allMovies, null, 2), 'utf-8');
    console.log('Data successfully saved to movies_data.json');
}

// Execute the function to fetch and save movie data
fetchAllMovies();
