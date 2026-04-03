const fs = require('fs');
const path = require('path');

const targetFiles = [
    'src/components/seeker/SeekerProfileView.jsx',
    'src/components/JobDetails.jsx' // Note: This might be shared, but the user requested job details. We'll verify if it's the right one.
];

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
    content = content.replace(/#f0faf5/ig, '#ffffff'); // Was Mint, now White 
    content = content.replace(/#dff5ea/ig, '#ffffff'); // Background tints -> white

    // 2. Replace Tailwind Emerald Colors
    content = content.replace(/emerald-500/g, '[#134074]');
    content = content.replace(/emerald-600/g, '[#13315C]');
    content = content.replace(/emerald-400/g, '[#8DA9C4]');
    content = content.replace(/emerald-700/g, '[#0B2545]');
    content = content.replace(/emerald-50\b/g, 'white');
    content = content.replace(/emerald-100/g, '[#8DA9C4]/20');
    content = content.replace(/emerald-200/g, '[#8DA9C4]/40');
    content = content.replace(/emerald-900/g, '[#0B2545]');
    content = content.replace(/emerald-800/g, '[#13315C]');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

targetFiles.forEach(processFile);
console.log('Color replacement complete.');
