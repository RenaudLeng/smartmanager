const fs = require('fs');
const path = require('path');

// Créer une icône PNG 144x144 simple avec un dégradé orange
const width = 144;
const height = 144;
const pixels = new Uint8Array(width * height * 4); // RGBA

// Remplir avec un dégradé orange
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    // Dégradé orange du centre vers les bords
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    const intensity = 1 - (distance / maxDistance);
    
    pixels[idx] = 255;     // R
    pixels[idx + 1] = Math.floor(140 + intensity * 60); // G
    pixels[idx + 2] = Math.floor(0 + intensity * 50);   // B
    pixels[idx + 3] = 255; // A
  }
}

// En-tête PNG minimaliste
const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

const ihdr = Buffer.alloc(25);
ihdr.writeUInt32BE(13, 0); // Length
ihdr.write('IHDR', 4); // Type
ihdr.writeUInt32BE(width, 8); // Width
ihdr.writeUInt32BE(height, 12); // Height
ihdr[16] = 8; // Bit depth
ihdr[17] = 2; // Color type (RGB)
ihdr[18] = 0; // Compression
ihdr[19] = 0; // Filter
ihdr[20] = 0; // Interlace

// CRC pour IHDR
const crcTable = [];
for (let i = 0; i < 256; i++) {
  let crc = i;
  for (let j = 0; j < 8; j++) {
    crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  crcTable[i] = crc;
}

function calculateCRC(buffer) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buffer.length; i++) {
    crc = crcTable[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const ihdrCrc = calculateCRC(ihdr.slice(4));
ihdr.writeUInt32BE(ihdrCrc, 21);

// Donées image avec filtre PNG
const imageData = Buffer.alloc(width * height * 4 + height);
for (let y = 0; y < height; y++) {
  imageData[y * (width * 4 + 1)] = 0; // Filtre None
  for (let x = 0; x < width; x++) {
    const srcIdx = (y * width + x) * 4;
    const dstIdx = y * (width * 4 + 1) + 1 + x * 4;
    imageData[dstIdx] = pixels[srcIdx];
    imageData[dstIdx + 1] = pixels[srcIdx + 1];
    imageData[dstIdx + 2] = pixels[srcIdx + 2];
    imageData[dstIdx + 3] = pixels[srcIdx + 3];
  }
}

// Compresser les données (simplifié - juste les copier)
const idat = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, imageData.length]),
  Buffer.from('IDAT'),
  imageData
]);

const idatCrc = calculateCRC(Buffer.concat([Buffer.from('IDAT'), imageData]));
const idatWithCrc = Buffer.concat([idat, Buffer.from([idatCrc])]);

// IEND
const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

// Assembler le PNG final
const pngBuffer = Buffer.concat([pngSignature, ihdr, idatWithCrc, iend]);

fs.writeFileSync(path.join(__dirname, 'public', 'icon-144x144.png'), pngBuffer);
console.log('Icône PNG 144x144 créée avec succès');
