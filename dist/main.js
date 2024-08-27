"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VitePluginApiGenerator;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 *
 * @param {Options} options
 * @param {string} options.folderName - 相对于src的路径，默认为'services'
 * @param {string} options.className - 导出类名，默认为'Api'
 * @param {string} options.mode - 导出文件类型，默认为'ts' 'ts' | 'js'
 * @returns
 */
function VitePluginApiGenerator(options = {}) {
    const { folderName = 'services', className = 'Api', mode = 'ts' } = options;
    console.log(`Generated '${folderName}' start. Export ClassName: ${className} ! Mode: ${mode}`);
    return {
        name: 'vite-plugin-api-generator',
        buildStart() {
            generateApiFile(folderName, className, mode);
            startWatching(folderName, className, mode);
        },
        buildEnd() {
            console.log('API Generator Plugin Ended');
        },
    };
}
function startWatching(folderName, className, mode = 'ts') {
    const modulesFolder = path.join('src', folderName, 'modules');
    if (!fs.existsSync(modulesFolder)) {
        console.log(`Folder '${modulesFolder}' does not exist.`);
        return;
    }
    fs.watch(modulesFolder, { recursive: true }, (eventType, filename) => {
        if (filename &&
            (path.extname(filename) === '.ts' || path.extname(filename) === '.js')) {
            console.log(`File ${filename} has been ${eventType}`);
            generateApiFile(folderName, className, mode);
        }
    });
}
function isModule(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.includes('export ');
}
function extractDescription(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/\/\/ @description\s*(.*)/);
    return match ? match[1].trim() : null;
}
function generateApiFile(folderName, className, mode = 'ts') {
    // 确保folderName是相对于src的路径
    folderName = path.join('src', folderName);
    folderName = path.join(process.cwd(), folderName);
    const modulesFolder = path.join(folderName, 'modules');
    if (!fs.existsSync(modulesFolder)) {
        console.log(`Folder '${modulesFolder}' does not exist.`);
        return;
    }
    console.log('modulesFolder ' + modulesFolder);
    const files = fs.readdirSync(modulesFolder);
    const tsFiles = files.filter(file => (path.extname(file) === '.ts' || path.extname(file) === '.js'));
    // 打印当前环境绝对路径
    console.log('process.cwd() ' + process.cwd());
    console.log('tsFiles ' + tsFiles);
    if (!tsFiles.length) {
        console.log(`No TypeScript files found in '${modulesFolder}'.`);
        return;
    }
    const imports = [];
    const exports = [];
    tsFiles.forEach((tsFile) => {
        if (isModule(path.join(modulesFolder, tsFile))) {
            const fileName = path.basename(tsFile, `.${mode}`);
            const description = extractDescription(path.join(modulesFolder, tsFile));
            console.log(`Found module '${fileName}' in '${tsFile}'.`);
            console.log(`Description: ${description}`);
            if (description) {
                imports.push(`import * as ${fileName} from './modules/${fileName}';\n`);
                exports.push(`    /** ${description} */\n    ${fileName},\n`);
            }
            else {
                imports.push(`import * as ${fileName} from './modules/${fileName}';\n`);
                exports.push(`    ${fileName},\n`);
            }
        }
    });
    if (!imports.length) {
        console.log(`No valid modules found in '${modulesFolder}'.`);
        return;
    }
    const indexTsContent = imports.join('') +
        '\n' +
        `const ${className} = {\n` +
        exports.join('') +
        '}\n\n' +
        `export default ${className};\n`;
    const indexTsPath = path.join(folderName, `index.${mode}`);
    if (fs.existsSync(indexTsPath)) {
        fs.unlinkSync(indexTsPath);
    }
    fs.writeFileSync(indexTsPath, indexTsContent, 'utf-8');
    console.log(`Generated '${indexTsPath}' successfully. Export ClassName: ${className} !`);
}
