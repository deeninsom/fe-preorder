import fs from 'fs';
import path from 'path';

const pagesDir = 'd:/dev/saas/distributions/frontend-distribution/src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix main container
  content = content.replace(
    /<div style=\{\{\s*padding:\s*20,\s*display:\s*"flex",\s*flexDirection:\s*"column",\s*gap:\s*16\s*\}\}>/,
    '<div className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden">'
  );

  // Fix headers with space-between
  content = content.replace(
    /<div style=\{\{\s*display:\s*"flex",\s*alignItems:\s*"center",\s*justifyContent:\s*"space-between"\s*\}\}>/g,
    '<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">'
  );
  
  // Wrap tables if not already wrapped
  if (content.includes('<table ')) {
    content = content.replace(
      /(<table[\s\S]*?<\/table>)/g,
      (match) => {
        return `<div className="overflow-x-auto">\n${match}\n</div>`;
      }
    );
    // If it was already in a div with overflow hidden (some tables are wrapped with border-radius), we should put overflow-x-auto on that wrapper.
    // Let's replace the wrapper's overflow: "hidden" with className="overflow-x-auto".
    content = content.replace(
      /overflow:\s*"hidden"/g,
      'overflow: "hidden", overflowX: "auto"' // just add overflowX auto inline
    );
  }

  // Settings page uses padding: 20 directly.
  content = content.replace(
    /<div style=\{\{\s*padding:\s*20/g,
    '<div className="p-4 md:p-5" style={{ ' // just roughly append it
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
