const fs = require('fs');
const path = require('path');

const targetFiles = [
    'src/components/hirer/HirerJobDetails.jsx'
];

// 134074 - Regal Navy (Primary)
// 13315C - Oxford Navy (Hover)
// 0B2545 - Prussian Blue (Darkest)
// 8DA9C4 - Powder Blue (Light Accent)
// EEF4ED - Mint Cream (Lightest/White replacement)

function processFile(filePath) {
    const fullPath = path.join('d:', 'HoodHireFrontend', 'hoodhire', filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${filePath} (not found)`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Replace Hex Colors
    content = content.replace(/#009966/ig, '#134074'); // Primary
    content = content.replace(/#008855/ig, '#13315C'); // Hover
    content = content.replace(/#dff5ea/ig, '#EEF4ED'); // Emerald-50 eq
    content = content.replace(/#f0faf5/ig, '#EEF4ED');
    content = content.replace(/#00cf8a/ig, '#8DA9C4');

    // 2. Replace Tailwind Emerald Colors
    content = content.replace(/emerald-500/g, '[#134074]');
    content = content.replace(/emerald-600/g, '[#13315C]');
    content = content.replace(/emerald-400/g, '[#8DA9C4]');
    content = content.replace(/emerald-700/g, '[#0B2545]');
    content = content.replace(/emerald-50\b/g, '[#EEF4ED]');
    content = content.replace(/emerald-100/g, '[#8DA9C4]/20');
    content = content.replace(/emerald-200/g, '[#8DA9C4]/40');
    content = content.replace(/emerald-900/g, '[#0B2545]');
    content = content.replace(/emerald-800/g, '[#13315C]');

    // 3. Replace bg-white with the Mint Cream color #EEF4ED
    content = content.replace(/\bbg-white\b/g, 'bg-[#EEF4ED]');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

targetFiles.forEach(processFile);
console.log('Color replacement complete.');
