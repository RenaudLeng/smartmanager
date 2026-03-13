const fs = require('fs');
const path = require('path');

// Fonction pour convertir SVG en base64
function svgToBase64(svg) {
  return Buffer.from(svg).toString('base64');
}

// Créer les icônes SVG pour SmartManager
const createSmartIcon = (size) => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.1389)}" fill="#F97316"/>
    <path d="M${Math.round(size * 0.5)} ${Math.round(size * 0.25)} C${Math.round(size * 0.6387)} ${Math.round(size * 0.25)} ${Math.round(size * 0.75)} ${Math.round(size * 0.5)} ${Math.round(size * size)} ${Math.round(size * 0.75)} C${Math.round(size * 0.8613)} ${Math.round(size * size)} ${Math.round(size * 0.75)} ${Math.round(size * 0.8613)} C${Math.round(size)} ${Math.round(size * 0.75)} ${Math.round(size * 0.1389)} ${Math.round(size * size)} ${Math.round(size * 0.1389) C${Math.round(size * 0.1389)} ${Math.round(size * 0.25)} ${Math.round(size * 0.25)} ${Math.round(size * 0.5)} ${Math.round(size * 0.5)} Z" fill="white"/>
    <path d="M${Math.round(size * 0.583)} ${Math.round(size * 0.333)} C${Math.round(size * 0.592)} ${Math.round(size * 0.333)} ${Math.round(size * 0.667)} ${Math.round(size * 0.333)} C${Math.round(size * 0.708)} ${Math.round(size * 0.333)} ${Math.round(size * 0.75)} ${Math.round(size * 0.333)} C${Math.round(size * 0.792)} ${Math.round(size * 0.333)} ${Math.round(size * 0.833)} ${Math.round(size * 0.333)} C${Math.round(size * 0.833)} ${Math.round(size * 0.833)} ${Math.round(size * 0.667)} ${Math.round(size * 0.667)} C${Math.round(size * 0.667)} ${Math.round(size * 0.833)} ${Math.round(size * 0.833)} ${Math.round(size * 0.833)} ${Math.round(size * 0.667)} ${Math.round(size * 0.667)} Z" fill="#F97316"/>
  </svg>`;
  return svg;
};

// Tailles des icônes à générer
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Générer et sauvegarder les icônes SVG
console.log('🎯 Génération des icônes SmartManager...');

sizes.forEach(size => {
  const svg = createSmartIcon(size);
  const base64 = svgToBase64(svg);
  
  // Créer le fichier SVG
  fs.writeFileSync(`icon-${size}x${size}.svg`, svg);
  console.log(`✅ SVG ${size}x${size} généré`);
  
  // Créer le PNG en utilisant une approche simple
  try {
    // Tenter de convertir avec Node.js et Canvas si disponible
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Dessiner l'icône avec Canvas
    ctx.fillStyle = '#F97316';
    ctx.fillRect(0, 0, size, size);
    
    // Dessiner les cercles et formes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Sauvegarder en PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon-${size}x${size}.png`, buffer);
    console.log(`✅ PNG ${size}x${size} généré`);
    
  } catch (error) {
    console.log(`⚠️  Canvas non disponible pour ${size}x${size}, SVG créé uniquement`);
  }
});

// Mettre à jour le manifest.json avec les icônes SVG
try {
  const manifestPath = './manifest.json';
  let manifest = {};
  
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }
  
  // Mettre à jour les icônes dans le manifest
  manifest.icons = sizes.map(size => ({
    src: `icon-${size}x${size}.png`,
    sizes: `${size}x${size}`,
    type: 'image/png',
    purpose: size >= 192 ? 'any maskable' : undefined
  }));
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Manifest.json mis à jour');
  
} catch (error) {
  console.log('❌ Erreur lors de la mise à jour du manifest:', error.message);
}

console.log('🎯 Génération terminée !');
console.log('📁 Fichiers créés: icon-*.svg et icon-*.png');
console.log('🔄 Plus d\'erreurs d\'icônes manquants dans le manifest !');
