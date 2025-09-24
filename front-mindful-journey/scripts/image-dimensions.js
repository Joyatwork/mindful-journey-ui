const fs = require('fs');
function getPngSize(path){
  const buf = fs.readFileSync(path);
  if (buf.length < 24) throw new Error('file too small');
  if (buf.toString('ascii',0,8) !== '\u0089PNG\r\n\x1a\n') throw new Error('not a PNG');
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height, size: buf.length };
}
function getJpegSize(path){
  const buf = fs.readFileSync(path);
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) throw new Error('not a JPEG');
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xFF) { offset++; continue; }
    const marker = buf[offset+1];
    // SOF markers range: 0xC0-0xCF, excluding 0xC4,0xC8,0xCC
    if (marker === 0xDA) break; // start of scan
    const len = buf.readUInt16BE(offset+2);
    if (marker >= 0xC0 && marker <= 0xCF && ![0xC4,0xC8,0xCC].includes(marker)){
      const height = buf.readUInt16BE(offset+5);
      const width = buf.readUInt16BE(offset+7);
      return { width, height, size: buf.length };
    }
    offset += 2 + len;
  }
  throw new Error('SOF marker not found');
}

const pngPath = 'public/visuals/annual/Joyatwork.png';
const jpgPath = 'public/visuals/annual/logo-Joyatwork.jpg';

try{
  const p = getPngSize(pngPath);
  console.log('PNG', pngPath, `${p.width}x${p.height}`, `${p.size} bytes`);
}catch(e){
  console.error('PNG error:', e.message || e);
}

try{
  const j = getJpegSize(jpgPath);
  console.log('JPG', jpgPath, `${j.width}x${j.height}`, `${j.size} bytes`);
}catch(e){
  console.error('JPG error:', e.message || e);
}
