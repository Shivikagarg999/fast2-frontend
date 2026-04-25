const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

async function generate() {
  const input = path.join(__dirname, '..', 'public', 'logo.jpeg');
  const out = path.join(__dirname, '..', 'public', 'favicon.ico');

  if (!fs.existsSync(input)) {
    console.error('Input image not found:', input);
    process.exit(1);
  }

  try {
    const sizes = [16, 32, 48, 64];
    const pngBuffers = [];

    for (const size of sizes) {
      const buf = await sharp(input)
        .resize(size, size, { fit: 'cover' })
        .png()
        .toBuffer();
      pngBuffers.push(buf);
    }

    const icoBuffer = await toIco(pngBuffers);
    fs.writeFileSync(out, icoBuffer);
    console.log('Generated', out);
  } catch (err) {
    console.error('Failed to generate favicon.ico', err);
    process.exit(1);
  }
}

generate();
