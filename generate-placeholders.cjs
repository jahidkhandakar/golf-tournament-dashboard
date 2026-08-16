const fs = require('fs');
const path = require('path');
const dirs = [
  'coaches', 'swing-categories', 'content', 'analytics', 'notifications', 'subscriptions', 'settings'
];
const basePath = path.join(process.cwd(), 'src/view/admin');
dirs.forEach(dir => {
  const dirPath = path.join(basePath, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  
  const componentName = dir.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const title = dir.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const content = `export default function ${componentName}() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">${title}</h1>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p>Content goes here.</p>
      </div>
    </div>
  );
}`;
  fs.writeFileSync(path.join(dirPath, 'index.tsx'), content);
});
console.log('done');
