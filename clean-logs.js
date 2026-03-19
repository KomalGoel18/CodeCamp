const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      if (dirPath.endsWith('.js') || dirPath.endsWith('.ts') || dirPath.endsWith('.tsx') || dirPath.endsWith('.jsx')) {
        callback(dirPath);
      }
    }
  });
}

function removeLogs() {
  const rootDir = 'e:\\VS Code\\Projects\\SolveOn';
  let modifiedCount = 0;

  walkDir(rootDir, (filePath) => {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;

    // Remove agent log regions
    content = content.replace(/[ \t]*\/\/ #region agent log[\s\S]*?\/\/ #endregion\n?/g, '');

    // Remove debugLog definition block
    const debugBlockRegex = /const DEBUG_SESSION_ID = ['"]506595['"];[\s\S]*?const debugLog = \([^)]*\) => {[\s\S]*?try {[\s\S]*?} catch \([^)]*\) {[\s\S]*?}[\s\S]*?};\n?/g;
    content = content.replace(debugBlockRegex, '');

    // Any remaining debugLog occurrences without region tags
    content = content.replace(/[ \t]*debugLog\(\{[\s\S]*?\}\);\n?/g, '');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned ${filePath}`);
      modifiedCount++;
    }
  });

  console.log(`Replaced in ${modifiedCount} files`);
}

removeLogs();
