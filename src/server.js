const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Debug: List all files in current directory
console.log('📁 Current directory:', __dirname);
console.log('📄 Files in directory:');
try {
    const files = fs.readdirSync(__dirname);
    files.forEach(file => {
        console.log('   -', file);
    });
} catch(err) {
    console.error('Error reading directory:', err);
}

// Check if index.html exists
const indexPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexPath)) {
    console.log('✅ index.html found at:', indexPath);
} else {
    console.log('❌ index.html NOT found at:', indexPath);
    console.log('   Looking for alternative HTML files...');
    try {
        const files = fs.readdirSync(__dirname);
        const htmlFiles = files.filter(f => f.toLowerCase().endsWith('.html'));
        htmlFiles.forEach(f => console.log('   Found HTML file:', f));
    } catch(err) {}
}

// Serve static files from current directory
app.use(express.static(__dirname));

// Handle all routes - serve index.html (or fallback)
app.get('*', (req, res) => {
    // Try multiple possible paths
    const possiblePaths = [
        path.join(__dirname, 'index.html'),
        path.join(__dirname, 'Index.html'),
        path.join(__dirname, 'INDEX.html'),
        path.join(__dirname, 'Index.HTML'),
        path.join(__dirname, 'src', 'index.html'),
        path.join(__dirname, 'public', 'index.html')
    ];
    
    let foundPath = null;
    for (const tryPath of possiblePaths) {
        if (fs.existsSync(tryPath)) {
            foundPath = tryPath;
            break;
        }
    }
    
    if (foundPath) {
        console.log('✅ Serving:', foundPath);
        res.sendFile(foundPath);
    } else {
        console.error('❌ No HTML file found!');
        res.status(404).send(`
            <h1>404 - File Not Found</h1>
            <p>Looking for index.html but couldn't find it.</p>
            <h2>Available files:</h2>
            <ul>
                ${fs.readdirSync(__dirname).map(f => `<li>${f}</li>`).join('')}
            </ul>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`✅ App running on port ${PORT}`);
});
