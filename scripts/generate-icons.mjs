import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const faviconPath = join(process.cwd(), 'src/app/favicon.ico');
const publicDir = join(process.cwd(), 'public');

// Ensure public directory exists
import { mkdirSync } from 'fs';
try {
  mkdirSync(publicDir, { recursive: true });
} catch (error) {
  // Directory might already exist, that's fine
}

async function generateIcons() {
  try {
    console.log('Reading favicon from:', faviconPath);
    
    // Read the favicon file
    const faviconBuffer = readFileSync(faviconPath);
    
    // Generate apple-icon.png (180x180)
    console.log('Generating apple-icon.png (180x180)...');
    const appleIcon = await sharp(faviconBuffer)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    writeFileSync(join(publicDir, 'apple-icon.png'), appleIcon);
    console.log('✓ Created apple-icon.png');
    
    // Generate icon-192x192.png
    console.log('Generating icon-192x192.png (192x192)...');
    const icon192 = await sharp(faviconBuffer)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    writeFileSync(join(publicDir, 'icon-192x192.png'), icon192);
    console.log('✓ Created icon-192x192.png');
    
    // Generate icon-512x512.png
    console.log('Generating icon-512x512.png (512x512)...');
    const icon512 = await sharp(faviconBuffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    writeFileSync(join(publicDir, 'icon-512x512.png'), icon512);
    console.log('✓ Created icon-512x512.png');
    
    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

