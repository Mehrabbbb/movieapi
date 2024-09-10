import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { getMoviesByYear , getmovieFile , searchMovies} from './staticdb.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors({
    origin: '*', // Allow all origins
}));


app.get('/api/movielist', async (req, res) => {
    try {
        // Fetch HTML content from the remote server
        const response = await fetch('http://server2.ftpbd.net/FTP-2/English%20Movies/2024/');

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
                    links.push({ name: name, link: link });
                }
            }
        });

        // Send the collected links as JSON response
        res.json(links);

    } catch (error) {
        console.error('Error fetching movie list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


















// Route to get movies by type and year
app.get('/api/movies/:type/:year', async (req, res) => {
    try {
        // Extract route parameters from the request
        const { type, year } = req.params;
    
        // Validate year parameter
        const yearNumber = parseInt(year, 10);

        if (isNaN(yearNumber)) {
            return res.status(400).json({ error: 'Invalid year format' });
        }

        // Call the function to get movies
        let movies = getMoviesByYear(yearNumber, type);

       
        movies =  removeLinkFromMovies(movies)
     
        // Respond with the movies data
        res.json(movies);
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/:category/:year/:title', async (req, res) => {
    const { category, year, title } = req.params;

    try {
        // Validate year parameter
        const yearNumber = parseInt(year, 10);

        if (isNaN(yearNumber)) {
            return res.status(400).json({ error: 'Invalid year format' });
        }

        // Call the function to get movies
        // Ensure that `type` is defined or replace it with the correct parameter
        const movies = await getmovieFile(category, yearNumber, title); 

        // Respond with the movies data
        res.json(movies);
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});






app.get('/api/:category/:search', async (req, res) => {
    const { category, search } = req.params;

    try {

        // Call the function to get movies
        // Ensure that `type` is defined or replace it with the correct parameter
        let movies =  searchMovies(category,search); 
       
        movies =  removeLinkFromMovies(movies)

        // Respond with the movies data
        res.json(movies);
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





// Function to remove the 'link' property from each movie
const removeLinkFromMovies = (movies) => {
    return movies.map(movie => {
      const { link, ...rest } = movie; // Destructure and exclude 'link'
      return rest; // Return the new object without 'link'
    });
  };












app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});