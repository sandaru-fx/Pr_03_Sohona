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

    // Fix Prisma selects
    content = content.replace(/packageTier: true/g, 'packageId: true');
    content = content.replace(/profile\.packageTier/g, 'profile.packageId');
    
    // Fix getPackageLimits calls
    content = content.replace(/getPackageLimits\([^)]+\)/g, 'getPackageLimits()');

    // Fix getCommentMaxWordsForIndex calls (it used to take 2 args, now takes 1)
    // Replace `getCommentMaxWordsForIndex(profile.packageTier, index)` with `getCommentMaxWordsForIndex(index)`
    content = content.replace(/getCommentMaxWordsForIndex\([^,]+,\s*([^)]+)\)/g, 'getCommentMaxWordsForIndex($1)');

    // Fix computePackageWindow (takes date, retentionYears instead of tier)
    // Actually, in `api/setup/complete/route.ts` we might need to get retentionYears from DB.
    // We'll leave computePackageWindow for manual fix.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
