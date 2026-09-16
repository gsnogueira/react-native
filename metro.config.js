const fs = require('fs');
const path = require('path');
const { resolve } = require('metro-resolver');

module.exports = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'idb') return { type: 'empty' };
      if (moduleName.startsWith('.')) {
        const basePath = path.resolve(path.dirname(context.originModulePath), moduleName);
        const candidates = [`.${platform || 'android'}`, '.native', ''];
        const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
        for (const suffix of candidates) {
          for (const extension of extensions) {
            const filePath = `${basePath}${suffix}${extension}`;
            if (fs.existsSync(filePath)) return { filePath, type: 'sourceFile' };
          }
        }
      }
      return resolve({ ...context, resolveRequest: undefined }, moduleName, platform);
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};