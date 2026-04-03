const fs = require('fs');
const path = require('path');

// Colors
// Green (Success/Open): bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400
// Red (Danger/Closed): bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400

const files = [
    'src/components/seeker/MyApplicationsView.jsx',
    'src/components/HirerHome.jsx',
    'src/components/hirer/ApplicationsView.jsx',
    'src/components/hirer/DisplayProfile.jsx',
    'src/components/hirer/ManageJobsView.jsx'
];

function processFile(filePath) {
    const fullPath = path.join('d:', 'HoodHireFrontend', 'hoodhire', filePath);
    if (!fs.existsSync(fullPath)) {
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Currently some of these were replaced with Navy/Powder Blue or Amber in the previous task. Let's find exactly what they are.
    // In ManageJobsView.jsx:
    // job.Status === 'open' ? 'bg-[#EEF4ED] text-[#007744] dark:bg-[#0B2545]/30 dark:text-[#8DA9C4] border-[#8DA9C4]/40 dark:border-[#0B2545]/50'
    // Let's replace status badges logic more robustly or just do simple regex for the specific lines.

    // ManageJobsView Open
    content = content.replace(/job\.Status === 'open' \? 'bg-white text-\[#007744\].*?' :/g,
        "job.Status === 'open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : ");
    // ManageJobsView Closed
    content = content.replace(/job\.Status === 'filled' \? 'bg-amber-100 text-amber-700.*?' :/g,
        "job.Status === 'filled' || job.Status === 'closed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/40' :");

    // ManageJobsView Status toggle
    content = content.replace(/\{`text-\[10px\] font-bold uppercase tracking-wider \$\{job\.Status === 'open' \? 'text-\[#134074\]' : 'text-slate-500 dark:text-slate-400'\}`\}/g,
        "{`text-[10px] font-bold uppercase tracking-wider ${job.Status === 'open' ? 'text-emerald-600' : 'text-rose-600'}`}");
    content = content.replace(/job\.Status === 'open' \? 'bg-\[#134074\]' : 'bg-slate-300 dark:bg-slate-600'/g,
        "job.Status === 'open' ? 'bg-emerald-500' : 'bg-rose-500'");

    // ApplicationsView Open
    content = content.replace(/job\.Status === 'open' \? 'bg-\[#8DA9C4\]\/20 text-\[#0B2545\].*?' :/g,
        "job.Status === 'open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :");
    content = content.replace(/job\.Status === 'filled' \? 'bg-amber-100 text-amber-700.*?' :/g,
        "job.Status === 'filled' || job.Status === 'closed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :");

    // ApplicationsView Application Accepted / Rejected (Assuming 'filled'/'rejected' etc)
    content = content.replace(/app\.Status === 'accepted' \? 'bg-\[#8DA9C4\]\/20 text-\[#0B2545\].*?' :/g,
        "app.Status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : app.Status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :");

    // DisplayProfile 
    content = content.replace(/applicationStatus === 'accepted' \? 'bg-\[#8DA9C4\]\/20 text-\[#0B2545\].*?' :/g,
        "applicationStatus === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : applicationStatus === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :");

    fs.writeFileSync(fullPath, content, 'utf8');
}

files.forEach(processFile);
console.log('Status colors replaced successfully.');
