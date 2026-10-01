const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
    let fp = path.join(__dirname, filePath);
    if (!fs.existsSync(fp)) return;
    let content = fs.readFileSync(fp, 'utf8');
    let newContent = content.replace(regex, replacement);
    if (content !== newContent) {
        fs.writeFileSync(fp, newContent, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
}

// app/admin/profiles/[id]/page.tsx
replaceInFile(
    'app/admin/profiles/[id]/page.tsx', 
    /import \{\s*formatPackageAdminLabel,\s*getPackageDefinition,\s*\} from "@\/lib\/packages";/g, 
    'import { SHARED_PACKAGE_LIMITS } from "@/lib/packages";'
);
replaceInFile(
    'app/admin/profiles/[id]/page.tsx', 
    /const pkg = getPackageDefinition\(profile\.packageId\);/g, 
    'const limits = SHARED_PACKAGE_LIMITS;'
);
replaceInFile(
    'app/admin/profiles/[id]/page.tsx', 
    /\{formatPackageAdminLabel\(profile\.packageId\)\}/g, 
    '{profile.package.name}'
);
replaceInFile(
    'app/admin/profiles/[id]/page.tsx', 
    /\{pkg\.label\}/g, 
    '{profile.package.name}'
);
replaceInFile(
    'app/admin/profiles/[id]/page.tsx', 
    /pkg\.limits\./g, 
    'limits.'
);

// app/admin/packages/AdminPackagesClient.tsx
replaceInFile(
    'app/admin/packages/AdminPackagesClient.tsx',
    /transition: \{ type: "spring", stiffness: 300, damping: 25 \}/g,
    'transition: { type: "spring", stiffness: 300, damping: 25 } as any'
);

// components/setup/SetupFlow.tsx
replaceInFile(
    'components/setup/SetupFlow.tsx',
    /transition: \{ type: "spring", stiffness: 300, damping: 30 \}/g,
    'transition: { type: "spring", stiffness: 300, damping: 30 } as any'
);
replaceInFile(
    'components/setup/SetupFlow.tsx',
    /transition=\{\{ type: "spring", stiffness: 300, damping: 30 \}\}/g,
    'transition={{ type: "spring", stiffness: 300, damping: 30 } as any}'
);

// lib/validators/profile.ts
replaceInFile(
    'lib/validators/profile.ts',
    /\.min\(1, \{ required_error: "Display name is required" \}\)/g,
    '.min(1, { message: "Display name is required" })'
);

