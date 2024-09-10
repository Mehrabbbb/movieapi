import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';

const baseUrl = 'http://server2.ftpbd.net/FTP-2/English%20Movies/2024/A%20Chef%27s%20Deadly%20Revenge%20%282024%29%201080p%20WEBRip';

async function fetchmovieFile(url) {
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
            if (imgElement && imgElement.alt === 'file') {
                // Find the 'a' tag within 'td.fb-n' of this row
                const linkElement = row.querySelector('td.fb-n a');
                
                if (linkElement) {
                    // Extract the 'href' attribute and inner HTML
                    const link = linkElement.href;                    
                    // Store the result
                    links.push({link:link});
                }
            }
        });

        return links;

    } catch (error) {
        console.error(`Error fetching movie list for :`, error);
        return [];
    }
}



fetchmovieFile(baseUrl);
