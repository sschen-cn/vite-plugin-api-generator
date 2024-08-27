interface Options {
    folderName?: string;
    className?: string;
    mode?: 'ts' | 'js';
    log?: boolean;
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
declare function VitePluginApiGenerator(options?: Options): {
    name: string;
    buildStart(): void;
    buildEnd(): void;
};

export { VitePluginApiGenerator as default };
