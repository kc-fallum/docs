import fs from 'fs';
import path from 'path';

export function getTypedocPlugins() {
  const plugins = [];
  const rootPath = path.resolve(__dirname, '..');
  
  // We want to scan frontend, backend, packages
  const searchDirs = ['frontend', 'backend', 'packages'];
  
  for (const dir of searchDirs) {
    const fullPath = path.join(rootPath, dir);
    if (!fs.existsSync(fullPath)) continue;
    
    const findTsConfigs = (currentPath, depth) => {
      if (depth > 4) return;
      
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'build') {
          findTsConfigs(path.join(currentPath, entry.name), depth + 1);
        } else if (entry.name === 'tsconfig.json') {
          const srcDir = path.join(currentPath, 'src');
          let entryPoint = '';
          if (fs.existsSync(path.join(srcDir, 'index.ts'))) entryPoint = path.join(srcDir, 'index.ts');
          else if (fs.existsSync(path.join(srcDir, 'main.ts'))) entryPoint = path.join(srcDir, 'main.ts');
          
          if (entryPoint) {
            // Find relative path from root for ID and Out
            const relativePath = path.relative(rootPath, currentPath).replace(/\\/g, '/');
            const projectName = path.basename(currentPath);
            const id = `api-${relativePath.replace(/\//g, '-')}`;
            
            plugins.push([
              'docusaurus-plugin-typedoc',
              {
                id: id,
                entryPoints: [path.relative(__dirname, entryPoint).replace(/\\/g, '/')],
                tsconfig: path.relative(__dirname, path.join(currentPath, 'tsconfig.json')).replace(/\\/g, '/'),
                out: `api/${relativePath}`,
                sidebar: {
                  categoryLabel: `${projectName} API`,
                  position: 0,
                  fullNames: true,
                },
              }
            ]);
          }
        }
      }
    };
    findTsConfigs(fullPath, 0);
  }
  return plugins;
}
