const fs = require('fs');
function dump(path) {
    try {
        const buf = fs.readFileSync(path);
        console.log('FILE:', path);
        console.log('SIZE:', buf.length, 'bytes');
        const head = buf.slice(0, 64);
        console.log('HEAD (hex):', head.toString('hex').match(/.{1,2}/g).slice(0, 64).join(' '));
        console.log('HEAD (ascii):', head.toString('ascii').replace(/[\x00-\x1F\x7F-\xFF]/g, '.'));
        console.log('---');
    } catch (e) {
        console.error('ERROR reading', path, e.message || e);
    }
}

dump('public/visuals/annual/Joyatwork.png');
dump('public/visuals/annual/logo-Joyatwork.jpg');
