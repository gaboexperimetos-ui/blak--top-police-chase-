/* =========================================================================
 * IMPORTADOR DE ASSETS ORIGINALES (Node puro, cero dependencias)
 *
 *   node tools/import-assets.js
 *
 * Lee blacktop-police-chase-assets/models/*.obj y textures/*.png y genera
 * src/original-assets.js con TODO embebido (OBJ como texto, PNG como data
 * URI). Así el juego sigue funcionando con file:// y sin ninguna petición de
 * red, que es el requisito de jugar sin wifi.
 *
 * Si la carpeta está vacía genera un módulo vacío y el juego usa las
 * siluetas procedurales como hasta ahora. En cuanto llegan los .obj reales,
 * este script los convierte y BTP.ObjMesh los usa en lugar de las cajas.
 * ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'blacktop-police-chase-assets');
const OUT = path.join(ROOT, 'src', 'original-assets.js');

function listDir(dir, ext) {
  const full = path.join(SRC, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.toLowerCase().endsWith(ext)).sort();
}

const objs = listDir('models', '.obj');
const pngs = listDir('textures', '.png');
const models = {}, textures = {};

objs.forEach(f => {
  const name = path.basename(f, '.obj');
  models[name] = fs.readFileSync(path.join(SRC, 'models', f), 'utf8');
});
pngs.forEach(f => {
  const name = path.basename(f, '.png');
  textures[name] = 'data:image/png;base64,' +
    fs.readFileSync(path.join(SRC, 'textures', f)).toString('base64');
});

const banner = '/* GENERADO POR tools/import-assets.js — NO EDITAR A MANO.\n' +
  '   Assets embebidos para funcionar sin red y con file://. */\n';
fs.writeFileSync(OUT, banner + 'window.BTP_ORIGINAL_ASSETS = ' +
  JSON.stringify({ models: models, textures: textures }) + ';\n');

console.log('Modelos .obj importados : ' + objs.length);
console.log('Texturas .png importadas: ' + pngs.length);
console.log('Generado                : src/original-assets.js (' +
  (fs.statSync(OUT).size / 1024).toFixed(1) + ' KB)');
if (!objs.length) console.log('Sin modelos reales: el juego usa siluetas procedurales.');
