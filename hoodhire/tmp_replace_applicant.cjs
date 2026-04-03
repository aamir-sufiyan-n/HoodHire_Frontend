const fs = require('fs');
const path = require('path');

const targetFiles = [
    'src/components/seeker/SeekerProfileView.jsx',
];

function processFile(filePath) {
    const fullPath = path.join('d:', 'HoodHireFrontend', 'hoodhire', filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${filePath} (not found)`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Currently SeekerProfileView.jsx has a ton of orange styling because it wasn't fully converted
    // earlier (my previous grep didn't target orange).
    // Let's replace the orange theme with Powder Blue and White Smoke.

    // Replace oranges with powder blue
    content = content.replace(/orange-500/g, '[#8DA9C4]'); // Powder blue
    content = content.replace(/orange-600/g, '[#13315C]'); // Oxford Navy (darker text/borders)
    content = content.replace(/orange-400/g, '[#8DA9C4]');
    content = content.replace(/orange-700/g, '[#0B2545]'); // Prussian Blue

    // Replace light oranges with White Smoke
    content = content.replace(/bg-orange-50\b/g, 'bg-[#F5F5F5]'); // White Smoke
    content = content.replace(/orange-100/g, '[#F5F5F5]');

    // Replace Amber with Navy for consistency over locked states
    content = content.replace(/amber-500/g, '[#8DA9C4]');
    content = content.replace(/amber-700/g, '[#134074]');
    content = content.replace(/amber-50\b/g, '[#EEF4ED]'); // Mint
    content = content.replace(/amber-200/g, '[#8DA9C4]/40');
    content = content.replace(/amber-900/g, '[#0B2545]');
    content = content.replace(/amber-600/g, '[#134074]');
    content = content.replace(/amber-[0-9]{3}/g, '[#8DA9C4]');

    // Let's ensure rounded-3xl becomes rounded-md 
    content = content.replace(/rounded-3xl/g, 'rounded-md');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

targetFiles.forEach(processFile);
console.log('Orange to Powder Blue / White Smoke replacement complete.');
