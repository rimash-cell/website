import fs from 'fs';
const s = fs.readFileSync('customtypes/work/index.json','utf8');
let inStr=false; let esc=false; let stack=[];
for(let i=0;i<s.length;i++){
  const c=s[i];
  if(inStr){
    if(esc){ esc=false; continue; }
    if(c==='\\') { esc=true; continue; }
    if(c==='"') { inStr=false; continue; }
    continue;
  }
  if(c==='"'){ inStr=true; continue; }
  if(c==='{'||c==='[') stack.push({c,i});
  if(c==='}'||c===']'){
    const last=stack.pop();
    if(!last){ console.log('unmatched closing at',i); break; }
  }
}
if(stack.length) console.log('unclosed at',stack.length, stack[stack.length-1]); else console.log('braces balanced');
