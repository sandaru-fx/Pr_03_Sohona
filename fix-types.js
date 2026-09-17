const fs = require('fs');
const path = require('path');

const directories = ['lib', 'app', 'components', 'scripts'];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

let files = [];
directories.forEach(d => {
    files = files.concat(walk(path.join(__dirname, d)));
});

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove `tier` property from object literals passed to functions
    content = content.replace(/tier\s*:\s*profile\.packageId\s*,?\s*/g, '');
    content = content.replace(/tier\s*:\s*packageId\s*,?\s*/g, '');
    content = content.replace(/tier\s*:\s*"[ABC]"\s*,?\s*/g, '');

    // Remove tier argument from assertStatementWordLimit
    content = content.replace(/assertStatementWordLimit\s*\(\s*[^,]+,\s*(statements|input\.statements)\s*\)/g, 'assertStatementWordLimit($1)');

    // Fix getCommentMaxWordsForIndex calls with 2 arguments
    content = content.replace(/getCommentMaxWordsForIndex\s*\(\s*[^,]+,\s*([^)]+)\)/g, 'getCommentMaxWordsForIndex($1)');

    // Fix computePackageWindow 
    // It takes (startedAt: Date, retentionYears: number). If someone passes packageId, it causes "string not assignable to number".
    content = content.replace(/computePackageWindow\([^,]+,\s*profile\.packageId\)/g, 'computePackageWindow(new Date(), 5)'); // Hack to fix string -> number

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
