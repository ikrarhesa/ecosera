import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

const REPLACEMENTS = [
  // Replace className="foo" style={{ color: UI.BRAND.PRIMARY }}
  // with className="foo text-brand-primary"
  { 
    regex: /className="([^"]+)"\s*style=\{\{\s*color:\s*UI\.BRAND\.PRIMARY\s*\}\}/g, 
    replacement: 'className="$1 text-brand-primary"' 
  },
  // Replace className={`foo`} style={{ color: UI.BRAND.PRIMARY }}
  {
    regex: /className=\{`([^`]+)`\}\s*style=\{\{\s*color:\s*UI\.BRAND\.PRIMARY\s*\}\}/g,
    replacement: 'className={`$1 text-brand-primary`}'
  }
];

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.tsx', '.ts', '.jsx', '.js'].includes(ext)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  REPLACEMENTS.forEach(({ regex, replacement }) => {
    newContent = newContent.replace(regex, replacement);
  });

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath.replace(SRC_DIR, 'src')}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) walkDir(fullPath);
    else processFile(fullPath);
  }
}

walkDir(SRC_DIR);
console.log('Inline style migration complete.');
