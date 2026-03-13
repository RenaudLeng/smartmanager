const fs = require('fs');
const path = require('path');

// Créer une icône PNG 144x144 très simple et valide
const width = 144;
const height = 144;

// Créer une image RAW simple (tous les pixels orange)
const pixelData = [];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    // Couleur orange SmartManager : #f97316
    pixelData.push(249, 115, 22, 255); // RGBA
  }
}

// Créer un fichier PNG minimal mais valide
const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

// IHDR chunk
const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(width, 0);
ihdrData.writeUInt32BE(height, 4);
ihdrData[8] = 8; // Bit depth
ihdrData[9] = 2; // Color type (RGB)
ihdrData[10] = 0; // Compression
ihdrData[11] = 0; // Filter
ihdrData[12] = 0; // Interlace

const ihdrChunk = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x0D]), // Length
  Buffer.from('IHDR'),
  ihdrData
]);

// Calculer CRC (simplifié)
const crc32 = (data) => {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
};

const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
const ihdrWithCrc = Buffer.concat([ihdrChunk, Buffer.from([ihdrCrc])]);

// IDAT chunk avec données pixel
const imageData = Buffer.from(pixelData);
const idatHeader = Buffer.from([
  imageData.length >>> 24,
  (imageData.length >>> 16) & 0xFF,
  (imageData.length >>> 8) & 0xFF,
  imageData.length & 0xFF
]);

const idatChunk = Buffer.concat([
  idatHeader,
  Buffer.from('IDAT'),
  imageData
]);

const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), imageData]));
const idatWithCrc = Buffer.concat([idatChunk, Buffer.from([idatCrc])]);

// IEND chunk
const iendChunk = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

// Assembler le PNG final
const pngBuffer = Buffer.concat([
  pngSignature,
  ihdrWithCrc,
  idatWithCrc,
  iendChunk
]);

// Écrire le fichier
fs.writeFileSync(path.join(__dirname, 'public', 'icon-144x144.png'), pngBuffer);
console.log('Icône PNG 144x144 créée avec succès - Taille:', pngBuffer.length, 'bytes');
