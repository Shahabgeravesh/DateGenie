const fs = require('fs');
const path = require('path');

// Create professional app icons for DateUnveil that meet Apple and Android guidelines

const createIconSVG = (size) => {
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B8A;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FF8E53;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B8A;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F8F9FA;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF4757;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B8A;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bgGradient)"/>
  
  <!-- Main card with shadow -->
  <rect x="${padding + innerSize * 0.15}" y="${padding + innerSize * 0.2}" 
        width="${innerSize * 0.7}" height="${innerSize * 0.6}" 
        rx="${innerSize * 0.08}" fill="url(#cardGradient)" filter="url(#shadow)"/>
  
  <!-- Card number -->
  <text x="${size/2}" y="${padding + innerSize * 0.45}" 
        font-family="Arial, sans-serif" font-size="${innerSize * 0.25}" 
        font-weight="bold" text-anchor="middle" fill="#FF6B8A">42</text>
  
  <!-- Heart icon with gradient -->
  <path d="M ${padding + innerSize * 0.25} ${padding + innerSize * 0.75} 
           Q ${padding + innerSize * 0.2} ${padding + innerSize * 0.65} 
             ${padding + innerSize * 0.25} ${padding + innerSize * 0.55}
           Q ${padding + innerSize * 0.3} ${padding + innerSize * 0.65} 
             ${padding + innerSize * 0.25} ${padding + innerSize * 0.75} Z" 
        fill="url(#heartGradient)" filter="url(#glow)"/>
  
  <!-- Sparkle elements -->
  <circle cx="${padding + innerSize * 0.8}" cy="${padding + innerSize * 0.3}" 
          r="${innerSize * 0.03}" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="${padding + innerSize * 0.85}" cy="${padding + innerSize * 0.25}" 
          r="${innerSize * 0.02}" fill="#FFFFFF" opacity="0.7"/>
  <circle cx="${padding + innerSize * 0.75}" cy="${padding + innerSize * 0.35}" 
          r="${innerSize * 0.015}" fill="#FFFFFF" opacity="0.8"/>
  
  <!-- Small decorative elements -->
  <circle cx="${padding + innerSize * 0.3}" cy="${padding + innerSize * 0.25}" 
          r="${innerSize * 0.015}" fill="#FFFFFF" opacity="0.6"/>
  <circle cx="${padding + innerSize * 0.35}" cy="${padding + innerSize * 0.2}" 
          r="${innerSize * 0.01}" fill="#FFFFFF" opacity="0.4"/>
</svg>`;
};

const createAdaptiveIconSVG = (size) => {
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B8A;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FF8E53;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B8A;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F8F9FA;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF4757;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B8A;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Main card -->
  <rect x="${padding + innerSize * 0.15}" y="${padding + innerSize * 0.2}" 
        width="${innerSize * 0.7}" height="${innerSize * 0.6}" 
        rx="${innerSize * 0.08}" fill="url(#cardGradient)"/>
  
  <!-- Card number -->
  <text x="${size/2}" y="${padding + innerSize * 0.45}" 
        font-family="Arial, sans-serif" font-size="${innerSize * 0.25}" 
        font-weight="bold" text-anchor="middle" fill="#FF6B8A">42</text>
  
  <!-- Heart icon -->
  <path d="M ${padding + innerSize * 0.25} ${padding + innerSize * 0.75} 
           Q ${padding + innerSize * 0.2} ${padding + innerSize * 0.65} 
             ${padding + innerSize * 0.25} ${padding + innerSize * 0.55}
           Q ${padding + innerSize * 0.3} ${padding + innerSize * 0.65} 
             ${padding + innerSize * 0.25} ${padding + innerSize * 0.75} Z" 
        fill="url(#heartGradient)"/>
  
  <!-- Sparkle elements -->
  <circle cx="${padding + innerSize * 0.8}" cy="${padding + innerSize * 0.3}" 
          r="${innerSize * 0.03}" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="${padding + innerSize * 0.85}" cy="${padding + innerSize * 0.25}" 
          r="${innerSize * 0.02}" fill="#FFFFFF" opacity="0.7"/>
</svg>`;
};

const createSplashIconSVG = (size) => {
  const padding = size * 0.15;
  const innerSize = size - (padding * 2);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B8A;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FF8E53;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B8A;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F8F9FA;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF4757;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B8A;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bgGradient)"/>
  
  <!-- Main card -->
  <rect x="${padding + innerSize * 0.15}" y="${padding + innerSize * 0.2}" 
        width="${innerSize * 0.7}" height="${innerSize * 0.6}" 
        rx="${innerSize * 0.08}" fill="url(#cardGradient)" filter="url(#shadow)"/>
  
  <!-- Card number -->
  <text x="${size/2}" y="${padding + innerSize * 0.45}" 
        font-family="Arial, sans-serif" font-size="${innerSize * 0.25}" 
        font-weight="bold" text-anchor="middle" fill="#FF6B8A">42</text>
  
  <!-- Heart icon -->
  <path d="M ${padding + innerSize * 0.25} ${padding + innerSize * 0.75} 
           Q ${padding + innerSize * 0.2} ${padding + innerSize * 0.65} 
             ${padding + innerSize * 0.25} ${padding + innerSize * 0.55}
           Q ${padding + innerSize * 0.3} ${padding + innerSize * 0.65} 
             ${padding + innerSize * 0.25} ${padding + innerSize * 0.75} Z" 
        fill="url(#heartGradient)"/>
  
  <!-- App name -->
  <text x="${size/2}" y="${padding + innerSize * 0.95}" 
        font-family="Arial, sans-serif" font-size="${innerSize * 0.08}" 
        font-weight="bold" text-anchor="middle" fill="#FFFFFF">DateUnveil</text>
  
  <!-- Sparkle elements -->
  <circle cx="${padding + innerSize * 0.8}" cy="${padding + innerSize * 0.3}" 
          r="${innerSize * 0.04}" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="${padding + innerSize * 0.85}" cy="${padding + innerSize * 0.25}" 
          r="${innerSize * 0.025}" fill="#FFFFFF" opacity="0.7"/>
  <circle cx="${padding + innerSize * 0.75}" cy="${padding + innerSize * 0.35}" 
          r="${innerSize * 0.02}" fill="#FFFFFF" opacity="0.8"/>
</svg>`;
};

const createFaviconSVG = (size) => {
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B8A;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FF8E53;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B8A;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F8F9FA;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF4757;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B8A;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bgGradient)"/>
  
  <!-- Main card -->
  <rect x="${padding + innerSize * 0.15}" y="${padding + innerSize * 0.2}" 
        width="${innerSize * 0.7}" height="${innerSize * 0.6}" 
        rx="${innerSize * 0.08}" fill="url(#cardGradient)"/>
  
  <!-- Card number -->
  <text x="${size/2}" y="${padding + innerSize * 0.45}" 
        font-family="Arial, sans-serif" font-size="${innerSize * 0.25}" 
        font-weight="bold" text-anchor="middle" fill="#FF6B8A">42</text>
  
  <!-- Heart icon -->
  <path d="M ${padding + innerSize * 0.25} ${padding + innerSize * 0.75} 
           Q ${padding + innerSize * 0.2} ${padding + innerSize * 0.65} 
             ${padding + innerSize * 0.25} ${padding + innerSize * 0.55}
           Q ${padding + innerSize * 0.3} ${padding + innerSize * 0.65} 
             ${padding + innerSize * 0.25} ${padding + innerSize * 0.75} Z" 
        fill="url(#heartGradient)"/>
</svg>`;
};

// Create the assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Generate SVG files
const iconSizes = {
  'icon.png': 1024,
  'adaptive-icon.png': 1024,
  'splash-icon.png': 1242,
  'favicon.png': 196
};

console.log('Creating professional app icons for DateUnveil...');

// Create SVG files for each icon type
Object.entries(iconSizes).forEach(([filename, size]) => {
  let svgContent;
  
  switch (filename) {
    case 'icon.png':
      svgContent = createIconSVG(size);
      break;
    case 'adaptive-icon.png':
      svgContent = createAdaptiveIconSVG(size);
      break;
    case 'splash-icon.png':
      svgContent = createSplashIconSVG(size);
      break;
    case 'favicon.png':
      svgContent = createFaviconSVG(size);
      break;
  }
  
  const svgPath = path.join(assetsDir, filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`Created ${filename.replace('.png', '.svg')}`);
});

console.log('\n✅ Professional app icons created successfully!');
console.log('\n🎨 Design Features:');
console.log('• Modern gradient background (pink to orange)');
console.log('• Clean white card with subtle shadow');
console.log('• Card number "42" representing date ideas');
console.log('• Heart icon with gradient for romance theme');
console.log('• Sparkle elements for visual appeal');
console.log('• Rounded corners meeting platform guidelines');
console.log('\n📱 Platform Compliance:');
console.log('• Apple: Rounded corners, no transparency, proper sizing');
console.log('• Android: Adaptive icon support, proper safe zones');
console.log('• Web: Favicon with proper scaling');
console.log('\n🔄 Next Steps:');
console.log('1. Convert SVG to PNG using online tools or design software');
console.log('2. Replace existing PNG files in assets folder');
console.log('3. Test on both iOS and Android devices');
console.log('\n📏 Required PNG Sizes:');
console.log('- icon.png: 1024x1024 (iOS/Android main icon)');
console.log('- adaptive-icon.png: 1024x1024 (Android adaptive icon)');
console.log('- splash-icon.png: 1242x2436 (iOS splash screen)');
console.log('- favicon.png: 196x196 (Web favicon)'); 