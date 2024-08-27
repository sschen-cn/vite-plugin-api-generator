"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => VitePluginApiGenerator
});
module.exports = __toCommonJS(main_exports);
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
function VitePluginApiGenerator(options = {}) {
  const {
    folderName = "services",
    className = "Api",
    mode = "ts",
    log = true
  } = options;
  let watcher;
  function logInfo(msg, enable = log) {
    if (enable) {
      console.log(msg);
    }
  }
  function startWatching(folderName2, className2, mode2 = "ts") {
    const modulesFolder = path.join("src", folderName2, "modules");
    if (!fs.existsSync(modulesFolder)) {
      logInfo(`Folder '${modulesFolder}' does not exist.`);
      return;
    }
    watcher = fs.watch(
      modulesFolder,
      { recursive: true },
      (eventType, filename) => {
        if (filename && (path.extname(filename) === ".ts" || path.extname(filename) === ".js")) {
          logInfo(`File ${filename} has been ${eventType}`);
          generateApiFile(folderName2, className2, mode2);
        }
      }
    );
  }
  function isModule(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.includes("export ");
  }
  function extractDescription(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const match = content.match(/\/\/ @description\s*(.*)/);
    return match ? match[1].trim() : null;
  }
  function generateApiFile(folderName2, className2, mode2 = "ts") {
    folderName2 = path.join("src", folderName2);
    folderName2 = path.join(process.cwd(), folderName2);
    const modulesFolder = path.join(folderName2, "modules");
    if (!fs.existsSync(modulesFolder)) {
      logInfo(`Folder '${modulesFolder}' does not exist.`);
      return;
    }
    logInfo("modulesFolder " + modulesFolder);
    const files = fs.readdirSync(modulesFolder);
    const tsFiles = files.filter(
      (file) => path.extname(file) === ".ts" || path.extname(file) === ".js"
    );
    logInfo("process.cwd() " + process.cwd());
    logInfo("tsFiles " + tsFiles);
    if (!tsFiles.length) {
      logInfo(`No TypeScript files found in '${modulesFolder}'.`);
      return;
    }
    const imports = [];
    const exports2 = [];
    tsFiles.forEach((tsFile) => {
      if (isModule(path.join(modulesFolder, tsFile))) {
        const fileName = path.basename(tsFile, `.${mode2}`);
        const description = extractDescription(path.join(modulesFolder, tsFile));
        logInfo(`Found module '${fileName}' in '${tsFile}'.`);
        logInfo(`Description: ${description}`);
        if (description) {
          imports.push(
            `import * as ${fileName} from './modules/${fileName}';
`
          );
          exports2.push(`    /** ${description} */
    ${fileName},
`);
        } else {
          imports.push(
            `import * as ${fileName} from './modules/${fileName}';
`
          );
          exports2.push(`    ${fileName},
`);
        }
      }
    });
    if (!imports.length) {
      logInfo(`No valid modules found in '${modulesFolder}'.`);
      return;
    }
    const indexTsContent = imports.join("") + `
const ${className2} = {
` + exports2.join("") + `}

export default ${className2};
`;
    const indexTsPath = path.join(folderName2, `index.${mode2}`);
    if (fs.existsSync(indexTsPath)) {
      fs.unlinkSync(indexTsPath);
    }
    fs.writeFileSync(indexTsPath, indexTsContent, "utf-8");
    logInfo(
      `Generated '${indexTsPath}' successfully. Export ClassName: ${className2} !`
    );
  }
  logInfo(
    `Generated '${folderName}' start. Export ClassName: ${className} ! Mode: ${mode}`
  );
  return {
    name: "vite-plugin-api-generator",
    buildStart() {
      if (!watcher) {
        generateApiFile(folderName, className, mode);
      }
      startWatching(folderName, className, mode);
    },
    buildEnd() {
      logInfo("API Generator Plugin Ended");
    }
  };
}
