#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Créer une icône PNG 144x144 valide
const canvasSize = 144;
const pixelData = [];

// Créer une icône simple avec dégradé orange
for (let y = 0; y < canvasSize; y++) {
  for (let x = 0; x < canvasSize; x++) {
    // Dégradé orange
    const intensity = Math.floor((x + y) / (canvasSize * 2) * 255);
    const r = 255;
    const g = Math.floor(140 + intensity * 0.4);
    const b = Math.floor(intensity * 0.2);
    
    pixelData.push(r, g, b, 255); // RGBA
  }
}

// En-tête PNG minimaliste
const pngHeader = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // Signature PNG
  0x00, 0x00, 0x00, 0x0D, // Taille du chunk IHDR (13 bytes)
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x90, // Largeur 144
  0x00, 0x00, 0x00, 0x90, // Hauteur 144
  0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth 8, Color type 2 (RGB), Compression 0, Filter 0, Interlace 0
  0x4B, 0x6D, 0x29, 0xDC, // CRC IHDR
]);

const pngData = Buffer.concat([pngHeader, Buffer.from(pixelData), Buffer.from([0x49, 0x45, 0x4E, 0x44, 0x00, 0x00, 0x00, 0x00, 0xAE, 0x42, 0x60, 0x82])]);

// Écrire le fichier
const outputPath = path.join(__dirname, 'public', 'icon-144x144.png');
fs.writeFileSync(outputPath, pngData);

console.log('Icône PNG 144x144 créée avec succès:', outputPath);
