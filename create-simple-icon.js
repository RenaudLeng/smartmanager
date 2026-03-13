const fs = require('fs');
const path = require('path');

// Créer une icône PNG très simple et valide
const width = 144;
const height = 144;

// Créer un canvas avec un simple carré orange
const canvas = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f97316"/>
  <rect x="20" y="20" width="104" height="104" fill="#ea580c" rx="8"/>
  <text x="72" y="80" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">SM</text>
</svg>
`;

// Convertir SVG en PNG simple (base64 data URL)
const base64Data = Buffer.from(canvas).toString('base64');
const pngData = Buffer.from(`data:image/svg+xml;base64,${base64Data}`, 'utf8');

// Créer un fichier PNG minimaliste valide
const pngHeader = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x90, // Width: 144
  0x00, 0x00, 0x00, 0x90, // Height: 144
  0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: 2 (RGB), Compression: 0, Filter: 0, Interlace: 0
  0x4B, 0x6D, 0x29, 0xDC, // CRC IHDR
]);

// Créer des données pixel simples (dégradé orange)
const pixelData = [];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    // Simple dégradé orange
    const intensity = (x + y) / (width + height);
    const r = 249;
    const g = Math.floor(115 + intensity * 40);
    const b = Math.floor(22 + intensity * 20);
    pixelData.push(r, g, b, 255); // RGBA
  }
}

// Ajouter les données pixel avec filtre PNG (0 = None)
const filteredData = [];
for (let y = 0; y < height; y++) {
  filteredData.push(0); // Filtre None
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    filteredData.push(pixelData[idx], pixelData[idx + 1], pixelData[idx + 2], pixelData[idx + 3]);
  }
}

// IDAT chunk (simplifié)
const idatData = Buffer.from(filteredData);
const idatHeader = Buffer.from([
  0x00, 0x00, 0x00, idatData.length, // Length
  0x49, 0x44, 0x41, 0x54 // IDAT
]);

// IEND chunk
const iendChunk = Buffer.from([
  0x00, 0x00, 0x00, 0x00, // Length: 0
  0x49, 0x45, 0x4E, 0x44, // IEND
  0xAE, 0x42, 0x60, 0x82  // CRC IEND
]);

// Assembler le PNG
const pngBuffer = Buffer.concat([
  pngHeader,
  idatHeader,
  idatData,
  iendChunk
]);

// Écrire le fichier
fs.writeFileSync(path.join(__dirname, 'public', 'icon-144x144.png'), pngBuffer);
console.log('Icône PNG 144x144 créée avec succès - Taille:', pngBuffer.length, 'bytes');
