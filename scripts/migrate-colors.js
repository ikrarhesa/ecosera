import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');

// Regex patterns for replacement
const REPLACEMENTS = [
  // 1. Replace standard Tailwind blue classes with brand-primary
  { regex: /bg-blue-600/g, replacement: 'bg-brand-primary' },
  { regex: /text-blue-600/g, replacement: 'text-brand-primary' },
  { regex: /border-blue-600/g, replacement: 'border-brand-primary' },
  { regex: /accent-blue-600/g, replacement: 'accent-brand-primary' },
  { regex: /fill-blue-600/g, replacement: 'fill-brand-primary' },
  { regex: /stroke-blue-600/g, replacement: 'stroke-brand-primary' },
  { regex: /ring-blue-600/g, replacement: 'ring-brand-primary' },
  // Common hover and active variants
  { regex: /hover:bg-blue-600/g, replacement: 'hover:bg-brand-primary' },
  { regex: /hover:text-blue-600/g, replacement: 'hover:text-brand-primary' },
  { regex: /hover:border-blue-600/g, replacement: 'hover:border-brand-primary' },
  { regex: /focus:ring-blue-600/g, replacement: 'focus:ring-brand-primary' },
  { regex: /focus:border-blue-600/g, replacement: 'focus:border-brand-primary' },

  // Secondary/lighter blues mapping mapped to opacity or lower brand tiers if needed, but the plan is to replace 50s and 100s with opacity on brand-primary if we wanted, for now let's just replace the raw UI.BRAND.PRIMARY logic where possible:

  // 2. Replace arbitrary hex text classes
  { regex: /text-\[#041E42\]/g, replacement: 'text-brand-navy' },
  { regex: /bg-\[#041E42\]/g, replacement: 'bg-brand-navy' },

  // 3. Remove inline styles containing UI.BRAND.PRIMARY where they simply dictate color
  // Since transforming AST is complex, we will manually resolve inline styles for color and background color later or handle obvious ones
  // For example: style={{ color: UI.BRAND.PRIMARY }} -> We don't want to blindly delete this if there's no corresponding class applied.
];

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
    return;
  }

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
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

walkDir(SRC_DIR);
console.log('Migration script complete.');
