const fs = require('fs');
const path = require('path');

// Créer un favicon.ico simple basé sur votre logo
// Pour l'instant, on va créer un fichier SVG qui sera compatible

const svgFavicon = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#10b981"/>
  <text x="16" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">SM</text>
</svg>`;

const svgApple = `<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="32" fill="#10b981"/>
  <text x="96" y="110" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">SmartManager</text>
</svg>`;

// Écrire les fichiers
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svgFavicon);
fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.svg'), svgApple);

console.log('✅ Favicon SVG créé!');
