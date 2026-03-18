import fs from 'fs';
const p = 'customtypes/work/index.json';
const s = fs.readFileSync(p);
console.log('bytes', s.length);
for(let i=0;i<s.length;i++) if (s[i]>127) console.log('non-ascii', i, s[i]);
try{
  const str = fs.readFileSync(p,'utf8');
  JSON.parse(str);
  console.log('parse OK');
}catch(e){
  console.error('parse error', e.message);
}
