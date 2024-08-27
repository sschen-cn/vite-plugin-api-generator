import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob'

interface Options {
  folderName?: string
  className?: string
  mode?: 'ts' | 'js'
  log?: boolean
}

/**
 *
 * @param {Options} options
 * @param {string} options.folderName - 相对于src的路径，默认为'services'
 * @param {string} options.className - 导出类名，默认为'Api'
 * @param {string} options.mode - 导出文件类型，默认为'ts' 'ts' | 'js'
 * @param {boolean} options.log - 是否打印日志，默认为true
 * @returns
 */
export default function VitePluginApiGenerator(options: Options = {}) {
  const {
    folderName = 'services',
    className = 'Api',
    mode = 'ts',
    log = true,
  } = options
  let watcher: any

  function logInfo(msg: string, enable: boolean = log) {
    if (enable) {
      console.log(msg)
    }
  }
  function startWatching(
    folderName: string,
    className: string,
    mode: 'ts' | 'js' = 'ts'
  ) {
    const modulesFolder = path.join('src', folderName, 'modules')
    if (!fs.existsSync(modulesFolder)) {
      logInfo(`Folder '${modulesFolder}' does not exist.`)
      return
    }

    watcher = fs.watch(
      modulesFolder,
      { recursive: true },
      (eventType, filename) => {
        if (
          filename &&
          (path.extname(filename) === '.ts' || path.extname(filename) === '.js')
        ) {
          logInfo(`File ${filename} has been ${eventType}`)
          generateApiFile(folderName, className, mode)
        }
      }
    )
  }

  function isModule(filePath: string): boolean {
    const content = fs.readFileSync(filePath, 'utf-8')
    return content.includes('export ')
  }

  function extractDescription(filePath: string): string | null {
    const content = fs.readFileSync(filePath, 'utf-8')
    const match = content.match(/\/\/ @description\s*(.*)/)
    return match ? match[1].trim() : null
  }

  function generateApiFile(
    folderName: string,
    className: string,
    mode: 'ts' | 'js' = 'ts'
  ) {
    // 确保folderName是相对于src的路径
    folderName = path.join('src', folderName)
    folderName = path.join(process.cwd(), folderName)

    const modulesFolder = path.join(folderName, 'modules')
    if (!fs.existsSync(modulesFolder)) {
      logInfo(`Folder '${modulesFolder}' does not exist.`)
      return
    }
    logInfo('modulesFolder ' + modulesFolder)
    const files = fs.readdirSync(modulesFolder)
    const tsFiles = files.filter(
      (file) => path.extname(file) === '.ts' || path.extname(file) === '.js'
    )
    // 打印当前环境绝对路径
    logInfo('process.cwd() ' + process.cwd())
    logInfo('tsFiles ' + tsFiles)
    if (!tsFiles.length) {
      logInfo(`No TypeScript files found in '${modulesFolder}'.`)
      return
    }

    const imports: string[] = []
    const exports: string[] = []

    tsFiles.forEach((tsFile: string) => {
      if (isModule(path.join(modulesFolder, tsFile))) {
        const fileName = path.basename(tsFile, `.${mode}`)
        const description = extractDescription(path.join(modulesFolder, tsFile))
        logInfo(`Found module '${fileName}' in '${tsFile}'.`)
        logInfo(`Description: ${description}`)
        if (description) {
          imports.push(
            `import * as ${fileName} from './modules/${fileName}'\n`
          )
          exports.push(`    /** ${description} */\n    ${fileName},\n`)
        } else {
          imports.push(
            `import * as ${fileName} from './modules/${fileName}'\n`
          )
          exports.push(`    ${fileName},\n`)
        }
      }
    })

    if (!imports.length) {
      logInfo(`No valid modules found in '${modulesFolder}'.`)
      return
    }

    const indexTsContent =
      imports.join('') +
      '\n' +
      `const ${className} = {\n` +
      exports.join('') +
      '}\n\n' +
      `export default ${className}\n`

    const indexTsPath = path.join(folderName, `index.${mode}`)
    if (fs.existsSync(indexTsPath)) {
      fs.unlinkSync(indexTsPath)
    }

    fs.writeFileSync(indexTsPath, indexTsContent, 'utf-8')

    logInfo(
      `Generated '${indexTsPath}' successfully. Export ClassName: ${className} !`
    )
  }

  logInfo(
    `Generated '${folderName}' start. Export ClassName: ${className} ! Mode: ${mode}`
  )
  return {
    name: 'vite-plugin-api-generator',
    buildStart() {
      if (!watcher) {
        generateApiFile(folderName, className, mode)
      }
      startWatching(folderName, className, mode)
    },
    buildEnd() {
      logInfo('API Generator Plugin Ended')
    },
  }
}
