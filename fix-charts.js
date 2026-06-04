const fs = require('fs');
const path = require('path');

const dir = 'src/app/(admin)/admin/dashboard/components';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.endsWith('.tsx')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        // We replace hsl(var(--chart-X)) with var(--chart-X)
        // Also fix any other hsl wrappers for colors
        content = content.replace(/hsl\(var\((--chart-[1-5])\)\)/g, 'var($1)');
        fs.writeFileSync(filePath, content);
    }
});
console.log('Fixed charts.');
