const fs = require('fs');
const path = require('path');

// Créer une icône PNG 144x144 ultra-simple et garantie valide
const width = 144;
const height = 144;

// Créer un buffer pour l'image PNG
const createPNG = () => {
  // Signature PNG
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // Bit depth
  ihdrData[9] = 2;  // Color type (RGB)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter method
  ihdrData[12] = 0; // Interlace method
  
  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdr = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // Length
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.from([ihdrCrc >> 24, (ihdrCrc >> 16) & 0xFF, (ihdrCrc >> 8) & 0xFF, ihdrCrc & 0xFF])
  ]);
  
  // Créer des données pixel simples (dégradé orange)
  const pixelData = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const intensity = (x + y) / (width + height);
      const r = 249;  // Orange SmartManager
      const g = Math.floor(115 + intensity * 40);
      const b = Math.floor(22 + intensity * 20);
      pixelData.push(r, g, b, 255); // RGBA
    }
  }
  
  // Ajouter filtre PNG (0 = None) pour chaque ligne
  const filteredData = [];
  for (let y = 0; y < height; y++) {
    filteredData.push(0); // Filtre None
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      filteredData.push(pixelData[idx], pixelData[idx + 1], pixelData[idx + 2], pixelData[idx + 3]);
    }
  }
  
  // IDAT chunk (sans compression pour simplifier)
  const idatData = Buffer.from(filteredData);
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), idatData]));
  const idat = Buffer.concat([
    Buffer.from([idatData.length >> 24, (idatData.length >> 16) & 0xFF, (idatData.length >> 8) & 0xFF, idatData.length & 0xFF]),
    Buffer.from('IDAT'),
    idatData,
    Buffer.from([idatCrc >> 24, (idatCrc >> 16) & 0xFF, (idatCrc >> 8) & 0xFF, idatCrc & 0xFF])
  ]);
  
  // IEND chunk
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
  
  // Assembler le PNG
  return Buffer.concat([signature, ihdr, idat, iend]);
};

// Calcul CRC32 simple
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Créer et sauvegarder l'icône
const pngBuffer = createPNG();
fs.writeFileSync(path.join(__dirname, 'public', 'icon-144x144.png'), pngBuffer);
console.log('✅ Icône PNG 144x144 créée avec succès');
console.log(`📏 Taille: ${pngBuffer.length} bytes`);
console.log(`🎨 Couleur: Orange SmartManager (#f97316)`);
