const fs = require('fs');
const path = require('path');

const targetFiles = [
    'src/components/HirerHome.jsx',
    'src/components/HirerProfilePage.jsx',
    'src/components/hirer/ManageJobsView.jsx',
    'src/components/hirer/ApplicationsView.jsx',
    'src/components/hirer/PostJobModal.jsx',
    'src/components/hirer/DisplayProfile.jsx',
    'src/components/hirer/HirerJobDetails.jsx'
];

function processFile(filePath) {
    const fullPath = path.join('d:', 'HoodHireFrontend', 'hoodhire', filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${filePath} (not found)`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Revert bg-[#EEF4ED] back to bg-white
    content = content.replace(/bg-\[#EEF4ED\]/ig, 'bg-white');
    // Replace any leftover hex codes with plain white
    content = content.replace(/#EEF4ED/ig, '#ffffff');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

targetFiles.forEach(processFile);
console.log('Mint green to white replacement complete.');
