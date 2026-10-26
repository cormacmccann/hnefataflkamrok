import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const files=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(tsx|ts)$/.test(p)&&!p.includes('/ui/')&&!p.includes('/i18n/')&&!p.includes('/integrations/'))files.push(p)}}
walk('src');
const phrases=new Set();
const add=s=>{s=s.replace(/\s+/g,' ').trim();if(s&&/[A-Za-z]/.test(s)&&!/^https?:|^@\/|^\.\.?\//.test(s)&&s.length<2500&&!s.includes('background:')&&!s.includes('border-radius:'))phrases.add(s)};
for(const file of files){const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 function visit(n){
  if(ts.isJsxElement(n)&&/^(style|script)$/i.test(n.openingElement.tagName.getText(ast)))return;
  if(ts.isTemplateExpression(n)) {
    let parent=n.parent, attr; while(parent&&!ts.isSourceFile(parent)){if(ts.isJsxAttribute(parent)){attr=parent.name.getText(ast);break}parent=parent.parent}
    const literal=n.head.text+n.templateSpans.map(span=>span.literal.text).join('');
    if((!attr||/^(aria-label|title|placeholder|alt|rules|disclaimer|diceLabel|label|name|status|description|caption|closeLabel)$/.test(attr))&&/[A-Za-z]{3}/.test(literal)&&literal.replace(/[^A-Za-z]/g,'').length>7&&!/[{};]|https?:|className/.test(literal))add(n.head.text+n.templateSpans.map((span,i)=>'{v'+i+'}'+span.literal.text).join(''));
  }
  if(ts.isJsxText(n))add(n.text);
  if(ts.isStringLiteralLike(n)){
   let cur=n.parent,attr,jsx=false,call;while(cur&&!ts.isSourceFile(cur)){if(ts.isJsxAttribute(cur)){attr=cur.name.getText(ast);break}if(ts.isJsxExpression(cur))jsx=true;if(ts.isCallExpression(cur)&&!call)call=cur;cur=cur.parent}
   if(attr&&/^(aria-label|title|placeholder|alt|rules|disclaimer|diceLabel|label|name|status|description|caption|closeLabel)$/.test(attr))add(n.text);
   else if(!attr&&jsx&&!/^([#.[\]/]|(?:[a-z0-9]+[-:][a-z0-9/]+)(?:\s|$))/.test(n.text)&&!n.text.includes('className'))add(n.text);
   else if(call&&call.expression.getText(ast)==='tr'&&call.arguments[0]===n)add(n.text);
   else if(ts.isPropertyAssignment(n.parent)&&/^(history|description|origin|region|era|disclaimer|rules|label|attestation|note|title|name|winReason)$/.test(n.parent.name.getText(ast).replace(/["']/g,'')))add(n.text);
   else if(n.text.includes(' ')&&!attr&&!/^(?:[.#\[]|https?:|(?:select|insert|update|delete)\b)/i.test(n.text)&&!/(?:^|\s)(?:bg|text|flex|grid|px|py|items|justify|border|rounded|shadow|w|h|max|min)-[a-z0-9]/.test(n.text))add(n.text);
  }
  ts.forEachChild(n,visit);
 }visit(ast);
}
const result=[...phrases].filter(s=>!/^([a-z]+(?:-[a-z]+)+|[0-9.]+|[a-z]+-[0-9]+)$/.test(s)).sort();
const output=process.argv[2]??path.join(os.tmpdir(),'tafl-ui-phrases.json');
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(`${result.length} candidate phrases extracted to ${output}; review before adding to the curated source catalog.`);
