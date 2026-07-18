const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('f:/Sprout SACCO/sproutcapitalsacco/forms');
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('className="sm:max-w-[425px]"')) {
    content = content.replace(/className=\"sm:max-w-\[425px\]\"/g, 'className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto"');
    fs.writeFileSync(file, content);
    count++;
    console.log('Updated: ' + file);
  }
});
console.log('Total files updated: ' + count);
