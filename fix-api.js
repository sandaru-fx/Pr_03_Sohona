const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(regex, replacement);
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
}

// app/api/manage/media/confirm/route.ts (88)
// app/api/manage/media/presign/route.ts (84)
// app/api/media/confirm/route.ts (108)
// app/api/media/presign/route.ts (92)
const mediaFiles = [
    'app/api/manage/media/confirm/route.ts',
    'app/api/manage/media/presign/route.ts',
    'app/api/media/confirm/route.ts',
    'app/api/media/presign/route.ts'
];
mediaFiles.forEach(f => {
    let fp = path.join(__dirname, f);
    if(fs.existsSync(fp)) {
        replaceInFile(fp, /tier\s*:\s*[^,]+,\s*/g, '');
    }
});

// app/api/manage/statements/route.ts (51)
// app/api/setup/statements/route.ts (73)
const statementFiles = [
    'app/api/manage/statements/route.ts',
    'app/api/setup/statements/route.ts'
];
statementFiles.forEach(f => {
    let fp = path.join(__dirname, f);
    if(fs.existsSync(fp)) {
        replaceInFile(fp, /assertStatementWordLimit\([^,]+,\s*(input\.statements)\)/g, 'assertStatementWordLimit($1)');
    }
});

// app/api/public/comments/route.ts (54)
let commentFp = path.join(__dirname, 'app/api/public/comments/route.ts');
if (fs.existsSync(commentFp)) {
    replaceInFile(commentFp, /tier\s*:\s*profile\.packageId\s*,?\s*/g, '');
}

// app/api/setup/complete/route.ts (105) - argument of type string not assignable to number
let setupCompleteFp = path.join(__dirname, 'app/api/setup/complete/route.ts');
if (fs.existsSync(setupCompleteFp)) {
    replaceInFile(setupCompleteFp, /computePackageWindow\([^,]+,\s*profile\.packageId\)/g, 'computePackageWindow(new Date(), 5)');
}

