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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
/* eslint-disable prettier-vue/prettier */
const adm_zip_1 = __importDefault(require("adm-zip"));
const archiver_1 = __importDefault(require("archiver"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const glob_1 = __importDefault(require("glob"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const transliteration_1 = require("transliteration");
const util_1 = __importStar(require("util"));
const xmlbuilder_1 = __importDefault(require("xmlbuilder"));
const utils_1 = require("~~/utils");
const baseUrl = path_1.default.join(process.cwd(), '.app', 'public', 'theme');
const publicUrl = path_1.default.join(process.cwd(), '.app', 'public');
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const mkdirAsync = util_1.default.promisify(fs_1.default.mkdir);
const existsAsync = util_1.default.promisify(fs_1.default.exists);
const unlinkAsync = util_1.default.promisify(fs_1.default.unlink);
function returnBytes(val) {
    if (!val)
        return 0;
    const lastChar = val.slice(-1).toLowerCase();
    let size = parseInt(val, 10);
    switch (lastChar) {
        case 'g':
            size *= 1024 * 1024 * 1024;
            break;
        case 'm':
            size *= 1024 * 1024;
            break;
        case 'k':
            size *= 1024;
            break;
    }
    return size;
}
async function exists(filePath) {
    try {
        await promises_1.default.access(filePath, promises_1.default.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
async function ensureDirExists(dir) {
    try {
        await promises_1.default.access(dir);
    }
    catch {
        await promises_1.default.mkdir(dir, { recursive: true });
    }
}
async function getPHPConfigValue(configName) {
    try {
        const phpCommand = `php -r "echo ini_get('${configName}');"`;
        const { stdout } = await execAsync(phpCommand);
        return stdout.trim();
    }
    catch (error) {
        console.error(`Error getting PHP config for ${configName}:`, error);
        return null;
    }
}
async function loadProjectList() {
    const projectsDir = path_1.default.join(publicUrl, 'projects');
    try {
        const projects = await promises_1.default.readdir(projectsDir);
        const projectList = await Promise.all(projects.map(async (project) => {
            const projectFile = path_1.default.join(projectsDir, project, 'project.json');
            if (await exists(projectFile)) {
                return project;
            }
            return null;
        }));
        return projectList.filter(Boolean);
    }
    catch (error) {
        console.error('Error loading project list:', error);
        return [];
    }
}
async function saveProject(project) {
    const jsonProject = Buffer.from(project, 'base64').toString('utf-8');
    const projectObj = JSON.parse(jsonProject);
    if (projectObj && projectObj !== 'null') {
        const dir = path_1.default.join(publicUrl, projectObj['dir']);
        await ensureDirExists(dir);
        const fileWhitelist = ['project.json', 'sitemap.xml', 'robots.txt'];
        const newFiles = new Set(fileWhitelist);
        // Update existing files only if they have non-null content
        if (projectObj['pages']) {
            for (const page of projectObj['pages']) {
                if (page['html'] !== null && page['html'] !== undefined) {
                    const htmlPath = path_1.default.join(dir, page['path']);
                    await promises_1.default.writeFile(htmlPath, page['html']);
                    delete page['html']; // Remove HTML content from JSON
                }
                newFiles.add(page['path']);
            }
        }
        // Handle sections
        if (projectObj['sections']) {
            for (const section of projectObj['sections']) {
                if (section['html'] !== null && section['html'] !== undefined) {
                    const title = sanitizeTitle(section['title']);
                    let newFileName = `${title}.html`;
                    let j = 0;
                    while (newFiles.has(newFileName)) {
                        j++;
                        newFileName = `${title}-${j}.html`;
                    }
                    newFiles.add(newFileName);
                    section['path'] = newFileName;
                    const htmlPath = path_1.default.join(dir, 'elements', newFileName);
                    await promises_1.default.writeFile(htmlPath, section['html']);
                    delete section['html']; // Remove HTML content from JSON
                }
            }
        }
        // Save additional files only if they have content
        if (projectObj['files']) {
            for (const [key, value] of Object.entries(projectObj['files'])) {
                if (value['content'] !== null && value['content'] !== undefined) {
                    const filePath = path_1.default.join(dir, key);
                    await promises_1.default.writeFile(filePath, value['content']);
                    newFiles.add(key);
                }
            }
        }
        // Remove files marked for deletion
        if (projectObj['filesToDelete']) {
            for (const fileToDelete of projectObj['filesToDelete']) {
                const targetFile = path_1.default.join(dir, fileToDelete);
                if (await exists(targetFile)) {
                    await promises_1.default.unlink(targetFile);
                }
            }
            delete projectObj['filesToDelete'];
        }
        // Save the project file
        const projectFile = path_1.default.join(dir, 'project.json');
        const projectStr = JSON.stringify(projectObj);
        await promises_1.default.writeFile(projectFile, projectStr);
        return projectStr;
    }
}
function sanitizeTitle(title) {
    const transliteratedTitle = (0, transliteration_1.transliterate)(title);
    // Replace spaces and special characters with hyphens
    return transliteratedTitle
        .toLowerCase()
        .replace(/[\s\?\|\:\\\/\*\>\<\.\"\,]/g, '-');
}
async function saveProjectByParts(part, index, lastChunk) {
    const tempDir = path_1.default.join(baseUrl, 'temp');
    const tempFile = path_1.default.join(tempDir, `save-${index}.txt`);
    try {
        await promises_1.default.mkdir(tempDir, { recursive: true });
        if (!lastChunk) {
            await promises_1.default.writeFile(tempFile, part);
            return 'Part saved successfully';
        }
        else {
            let projectData = '';
            for (let i = 0; i < index; i++) {
                const chunkFile = path_1.default.join(tempDir, `save-${i}.txt`);
                if (await exists(chunkFile)) {
                    const chunk = await promises_1.default.readFile(chunkFile, 'utf8');
                    projectData += chunk;
                    await promises_1.default.unlink(chunkFile);
                }
            }
            projectData += part; // Add the last part outside the loop
            await saveProject(projectData); // Ensure this function is defined elsewhere in your code
            await promises_1.default.rm(tempDir, { recursive: true, force: true });
            return 'Project saved successfully';
        }
    }
    catch (error) {
        throw new Error(error.message);
    }
}
async function getIncludedFilesContents(files, dir) {
    if (!files)
        return 'No files specified';
    try {
        const filesObj = JSON.parse(files);
        const includedFilesContents = {};
        for (const key in filesObj) {
            const filePath = path_1.default.join(publicUrl, dir, key);
            if (await exists(filePath)) {
                includedFilesContents[key] = await promises_1.default.readFile(filePath, 'utf8');
            }
            else {
                includedFilesContents[key] = 'empty';
            }
        }
        return includedFilesContents;
    }
    catch (error) {
        console.error('Error getting included files contents:', error);
        return 'Error getting included files contents';
    }
}
async function deleteDir(dirPath) {
    const files = await promises_1.default.readdir(dirPath, { withFileTypes: true });
    await Promise.all(files.map(async (file) => {
        const filePath = path_1.default.join(dirPath, file.name);
        if (file.isDirectory()) {
            await deleteDir(filePath);
        }
        else {
            await promises_1.default.unlink(filePath);
        }
    }));
    await promises_1.default.rmdir(dirPath);
}
async function createThumbnail(source, destination) {
    try {
        await (0, sharp_1.default)(source).resize(220, 230).toFile(destination);
    }
    catch (error) {
        console.error('Error creating thumbnail:', error);
        throw error;
    }
}
async function zipDirectory(source, out) {
    const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
    const stream = fs_1.default.createWriteStream(out);
    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', (err) => reject(err))
            .pipe(stream);
        stream.on('close', () => resolve());
        archive.finalize();
    });
}
const base64ToJpeg = async (base64String, outputFilePath) => {
    // Check for and remove the data URL prefix
    const matches = base64String.match(/^data:image\/jpeg;base64,(.+)/);
    const base64Data = matches ? matches[1] : base64String;
    const buffer = Buffer.from(base64Data, 'base64');
    await promises_1.default.writeFile(outputFilePath, buffer);
};
const resizeImage = async (filePath) => {
    try {
        // Check if the file exists
        if (!exists(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        // Create a temporary file path
        const tempFilePath = filePath.replace(/\.jpg$/, '-temp.jpg');
        // Resize and save the image to the temporary file
        await (0, sharp_1.default)(filePath).resize(220, 230).toFile(tempFilePath);
        // Replace the original file with the temporary file
        await promises_1.default.rename(tempFilePath, filePath);
        // Return the file path of the resized image
        return filePath;
    }
    catch (error) {
        console.error(`Error resizing image: ${filePath}`, error);
        throw error;
    }
};
function toXml(object, data, settings) {
    data.forEach((item) => {
        const urlElement = object.ele('url');
        for (const key in item) {
            if (key === 'index') {
                const pageData = item[key] ? settings.homePage : settings.otherPages;
                if (pageData.frequency) {
                    urlElement.ele('changefreq', pageData.frequency);
                }
                if (pageData.priority) {
                    urlElement.ele('priority', pageData.priority);
                }
            }
            else {
                urlElement.ele(key, item[key]);
            }
        }
    });
}
async function recurseCopy(src, dst) {
    await promises_1.default.mkdir(dst, { recursive: true });
    const entries = await promises_1.default.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path_1.default.join(src, entry.name);
        const dstPath = path_1.default.join(dst, entry.name);
        if (entry.isDirectory()) {
            await recurseCopy(srcPath, dstPath);
        }
        else {
            await promises_1.default.copyFile(srcPath, dstPath);
        }
    }
}
async function rmdirRecursive(dir) {
    const entries = await promises_1.default.readdir(dir, { withFileTypes: true });
    await Promise.all(entries.map(async (entry) => {
        const fullPath = path_1.default.join(dir, entry.name);
        return entry.isDirectory()
            ? rmdirRecursive(fullPath)
            : promises_1.default.unlink(fullPath);
    }));
    await promises_1.default.rmdir(dir);
}
function getPageTitle(content) {
    const match = content.match(/<title>(.*?)<\/title>/is);
    if (match) {
        let title = match[1].replace(/\s+/g, ' ').trim();
        title = title.replace(',', '');
        return title;
    }
    return null;
}
exports.controllers = {
    info: (0, utils_1.handleController)(async () => {
        const uploadMaxFilesize = returnBytes(await getPHPConfigValue('upload_max_filesize'));
        const memoryLimit = returnBytes(await getPHPConfigValue('memory_limit'));
        const maxFileUploads = await getPHPConfigValue('max_file_uploads');
        const postMaxSize = returnBytes(await getPHPConfigValue('post_max_size'));
        const response = {
            settings: {
                upload_max_filesize: uploadMaxFilesize,
                memory_limit: memoryLimit,
                max_file_uploads: parseInt(maxFileUploads, 10) || 0,
                post_max_size: postMaxSize,
                system_memory: os_1.default.totalmem(),
            },
        };
        return response;
    }),
    getLanguage: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const langPath = path_1.default.join(baseUrl, 'lang');
            const allDataPath = path_1.default.join(langPath, 'languages.json');
            if (!(await exists(allDataPath))) {
                return { error: 'Languages file not found' };
            }
            const allLang = JSON.parse(await promises_1.default.readFile(allDataPath, 'utf8'));
            if (allLang['en']) {
                const enLang = allLang['en'];
                const enFile = path_1.default.join(langPath, enLang['file']);
                if (await exists(enFile)) {
                    allLang['en']['data'] = JSON.parse(await promises_1.default.readFile(enFile, 'utf8'));
                }
            }
            const requestedLang = body.lang;
            if (requestedLang && allLang[requestedLang]) {
                const langFile = path_1.default.join(langPath, allLang[requestedLang]['file']);
                if (await exists(langFile)) {
                    allLang[requestedLang]['data'] = JSON.parse(await promises_1.default.readFile(langFile, 'utf8'));
                }
                else {
                    allLang[requestedLang]['error'] = true;
                }
            }
            for (const key in allLang) {
                if (key !== 'error') {
                    const langFile = path_1.default.join(langPath, allLang[key]['file']);
                    if (!(await exists(langFile))) {
                        delete allLang[key];
                    }
                }
            }
            return allLang;
        }
        catch (e) {
            return {
                error: 'An error occurred while processing languages',
                details: e.message,
            };
        }
    }),
    getSections: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { sections, dir } = body;
        if (!sections || !dir) {
            return [];
        }
        const sectionsData = JSON.parse(sections);
        const projectDir = path_1.default.join(publicUrl, dir, 'elements');
        const updatedSections = await Promise.all(sectionsData.map(async (section) => {
            if (section.path) {
                const htmlPath = path_1.default.join(projectDir, section.path);
                if (await exists(htmlPath)) {
                    section.html = await promises_1.default.readFile(htmlPath, 'utf8');
                }
            }
            return section;
        }));
        return updatedSections;
    }),
    loadModules: (0, utils_1.handleController)(async () => {
        const modulesDir = path_1.default.join(baseUrl, 'modules');
        try {
            await ensureDirExists(modulesDir);
            const moduleFiles = await promises_1.default.readdir(modulesDir);
            const modules = moduleFiles.map((file) => path_1.default.join('modules', file));
            return modules;
        }
        catch (error) {
            console.error('Error loading modules:', error);
            return [];
        }
    }),
    projectActions: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { action, project, part, index, lastChunk, files, dir } = body;
        switch (action) {
            case 'loadProjectList':
                return await loadProjectList();
            case 'SaveProject':
                return await saveProject(project);
            case 'SaveProjectByParts':
                return await saveProjectByParts(part, index, lastChunk);
            case 'getIncludedFilesContents':
                return await getIncludedFilesContents(files, dir);
            default:
                return 'Invalid action';
        }
    }),
    checkIconFonts: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { fonts, project, dir } = body;
        if (fonts && project && dir) {
            const src = fonts.split(',');
            const projectName = project;
            const fontsDir = dir;
            const checkfile = 'mash-icon-font.txt';
            const checkDir = path_1.default.join(baseUrl, projectName, fontsDir);
            for (let i = 0; i < src.length; i++) {
                const fontPath = path_1.default.join(checkDir, src[i]);
                if (await exists(fontPath)) {
                    const checkFilePath = path_1.default.join(fontPath, checkfile);
                    if (await exists(checkFilePath)) {
                        await deleteDir(fontPath);
                    }
                }
            }
        }
    }),
    mediaCheckItems: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { dir, items } = body;
        if (!dir || !items) {
            throw new Error('Invalid request');
        }
        const projectDir = path_1.default.join(publicUrl, dir);
        const mediaDir = path_1.default.join(projectDir, 'mash', 'media');
        const thumbsDir = path_1.default.join(mediaDir, 'thumbnails');
        const itemsObj = JSON.parse(items);
        const itemsToRemove = [];
        const videosWithoutPreview = [];
        const itemsDimensions = [];
        const existingFiles = await promises_1.default.readdir(mediaDir);
        const existingThumbnails = await promises_1.default.readdir(thumbsDir);
        for (const item of itemsObj) {
            const itemPath = path_1.default.join(mediaDir, item.original);
            const thumbPath = path_1.default.join(thumbsDir, path_1.default.basename(item.thumbnail));
            if (item.type !== 'image') {
                videosWithoutPreview.push(item.id);
                continue;
            }
            if (!(await exists(itemPath))) {
                itemsToRemove.push(item.id);
                continue;
            }
            const size = await (0, sharp_1.default)(itemPath).metadata();
            itemsDimensions.push({
                width: size.width,
                height: size.height,
                id: item.id,
            });
            if (!(await exists(thumbPath))) {
                await createThumbnail(itemPath, thumbPath);
            }
            const fileIndex = existingFiles.indexOf(item.original);
            if (fileIndex > -1) {
                existingFiles.splice(fileIndex, 1);
            }
            const thumbIndex = existingThumbnails.indexOf(path_1.default.basename(item.thumbnail));
            if (thumbIndex > -1) {
                existingThumbnails.splice(thumbIndex, 1);
            }
        }
        // Remove unused files
        for (const file of existingFiles) {
            const filePath = path_1.default.join(mediaDir, file);
            const fileStats = await promises_1.default.stat(filePath);
            if (fileStats.isFile()) {
                await promises_1.default.unlink(filePath);
            }
        }
        // Remove unused thumbnails
        for (const thumb of existingThumbnails) {
            const thumbPath = path_1.default.join(thumbsDir, thumb);
            const thumbStats = await promises_1.default.stat(thumbPath);
            if (thumbStats.isFile()) {
                await promises_1.default.unlink(thumbPath);
            }
        }
        return {
            itemsToRemove,
            videosWithoutPreview,
            itemsDimensions,
        };
    }),
    getPages: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        const { pages, dir } = body;
        if (!pages || !dir) {
            return [];
        }
        const pagesData = JSON.parse(pages);
        const projectDir = path_1.default.join(publicUrl, dir);
        const updatedPages = await Promise.all(pagesData.map(async (page) => {
            if (page.path) {
                const htmlPath = path_1.default.join(projectDir, page.path);
                if (await exists(htmlPath)) {
                    page.html = await promises_1.default.readFile(htmlPath, 'utf8');
                }
            }
            return page;
        }));
        return updatedPages;
    }),
    cropImage: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { data, destination, dir } = body;
            if (!data || !destination || !dir) {
                throw new Error('Missing required parameters');
            }
            const { src, width, height, x, y } = JSON.parse(data);
            const sourcePath = path_1.default.join(publicUrl, src);
            const targetDir = path_1.default.join(publicUrl, dir, destination);
            // Ensure target directory exists
            await ensureDirExists(targetDir);
            const ext = path_1.default.extname(src);
            const baseName = path_1.default.basename(src, ext);
            const formattedName = baseName.replace(/\s+/g, '-').toLowerCase();
            const filename = `${formattedName}-${width}x${height}${ext}`;
            const targetPath = path_1.default.join(targetDir, filename);
            // Crop and save the image
            await (0, sharp_1.default)(sourcePath)
                .extract({ left: x, top: y, width, height })
                .toFile(targetPath);
            return path_1.default.join(destination, filename).replace(/\\/g, '/');
        }
        catch (error) {
            console.error('Error in cropImage:', error);
            throw error;
        }
    }),
    mediaUpload: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { dir, files } = body;
            if (!dir || !files || files.length === 0) {
                throw new Error('No directory specified or no files provided');
            }
            const projectDir = path_1.default.join(publicUrl, dir);
            const mediaDir = path_1.default.join(projectDir, 'mash', 'media');
            const thumbsDir = path_1.default.join(mediaDir, 'thumbnails');
            await ensureDirExists(mediaDir);
            await ensureDirExists(thumbsDir);
            const items = [];
            for (const file of files) {
                const mimeType = file.type;
                if (![
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'video/mp4',
                    'video/webm',
                    'video/avi',
                    'video/ogg',
                ].includes(mimeType)) {
                    throw new Error('Unsupported file format');
                }
                const originalFilename = file.name || 'unnamed-file';
                const ext = path_1.default.extname(originalFilename);
                const baseName = (0, transliteration_1.transliterate)(originalFilename.slice(0, -ext.length))
                    .toLowerCase()
                    .replace(/\s+/g, '-');
                let targetName = `${baseName}${ext}`;
                let counter = 0;
                // Ensure unique file name
                while (await exists(path_1.default.join(mediaDir, targetName))) {
                    counter++;
                    targetName = `${baseName}-${counter}${ext}`;
                }
                const filePath = path_1.default.join(mediaDir, targetName);
                await promises_1.default.writeFile(filePath, Buffer.from(file.data));
                let size, thumbnailPath;
                // Process thumbnail if image, skip if video
                if (['.jpeg', '.jpg', '.png', '.gif'].includes(ext)) {
                    size = await (0, sharp_1.default)(filePath).metadata();
                    thumbnailPath = path_1.default.join('mash', 'media', 'thumbnails', targetName);
                    const thumbFullPath = path_1.default.join(thumbsDir, targetName);
                    await createThumbnail(filePath, thumbFullPath);
                }
                else {
                    // For videos, set size to null and thumbnail to 'isLoading'
                    size = { width: null, height: null };
                    thumbnailPath = 'isLoading';
                }
                items.push({
                    original: targetName,
                    type: ['.mp4', '.webm', '.avi', '.ogg'].includes(ext)
                        ? 'video'
                        : 'image',
                    thumbnail: thumbnailPath,
                    width: size.width,
                    height: size.height,
                    id: items.length,
                });
            }
            return items.map((item) => ({
                ...item,
                thumbnail: item.thumbnail !== 'isLoading'
                    ? path_1.default.join(dir, item.thumbnail).replace(/\\/g, '/')
                    : item.thumbnail,
            }));
        }
        catch (error) {
            console.error('Error in addMediaItems:', error);
            throw error;
        }
    }),
    mediaAddToProject: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { dir, fileName, destination } = body;
            if (!dir || !fileName || !destination) {
                throw new Error('Missing required parameters');
            }
            const projectDir = path_1.default.join(publicUrl, dir);
            const filePath = path_1.default.join(projectDir, 'mash', 'media', fileName);
            const destDir = path_1.default.join(projectDir, destination);
            if (!(await exists(filePath))) {
                throw new Error("File doesn't exist");
            }
            await ensureDirExists(destDir);
            const ext = path_1.default.extname(fileName);
            const baseName = path_1.default.basename(fileName, ext);
            let counter = 0;
            let checkName = fileName;
            let destFile = path_1.default.join(destDir, checkName);
            while (await exists(destFile)) {
                counter++;
                checkName = `${baseName}-${counter}${ext}`;
                destFile = path_1.default.join(destDir, checkName);
            }
            await promises_1.default.copyFile(filePath, destFile);
            return path_1.default.join(destination, checkName).replace(/\\/g, '/');
        }
        catch (error) {
            console.error('Error in mediaAddToProject:', error);
            throw error;
        }
    }),
    cropMedia: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { data, dir, resize } = body;
            if (!data || !dir) {
                return 2;
            }
            const { copyOriginalImage, width, height, imgWidth, imgHeight, src, x, y, } = JSON.parse(data);
            const pathToImg = path_1.default.join(publicUrl, src);
            const mediaDir = path_1.default.join(publicUrl, dir, 'mash', 'media');
            const thumbsDir = path_1.default.join(mediaDir, 'thumbnails');
            if (!(await exists(pathToImg))) {
                throw new Error('Image file does not exist');
            }
            const ext = path_1.default.extname(src);
            const baseName = path_1.default.basename(src, ext);
            let targetName = `${baseName}-${width}x${height}${ext}`;
            let counter = 0;
            while (await exists(path_1.default.join(mediaDir, targetName))) {
                counter++;
                targetName = `${baseName}-${counter}${ext}`;
            }
            const newPathToImg = path_1.default.join(mediaDir, targetName);
            if (copyOriginalImage) {
                await promises_1.default.copyFile(pathToImg, newPathToImg);
            }
            let cropOptions;
            if (resize === 'true') {
                cropOptions = { left: 0, top: 0, width: imgWidth, height: imgHeight };
            }
            else {
                cropOptions = { left: x, top: y, width, height };
            }
            await (0, sharp_1.default)(pathToImg).extract(cropOptions).toFile(newPathToImg);
            if (copyOriginalImage || (!copyOriginalImage && resize !== 'true')) {
                const thumbPath = path_1.default.join(thumbsDir, targetName);
                await createThumbnail(newPathToImg, thumbPath);
            }
            return {
                copyOriginal: copyOriginalImage,
                pathToImg: path_1.default
                    .join(dir, 'mash', 'media', targetName)
                    .replace(/\\/g, '/'),
                pathToThumb: path_1.default
                    .join(dir, 'mash', 'media', 'thumbnails', targetName)
                    .replace(/\\/g, '/'),
                width,
                height,
            };
        }
        catch (error) {
            console.error('Error in cropMedia:', error);
            throw error;
        }
    }),
    mediaAddItemsByUrls: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { urls, dir } = body;
            if (!urls || !dir) {
                throw new Error('URLs and directory are required');
            }
            const projectDir = path_1.default.join(publicUrl, dir);
            const mediaDir = path_1.default.join(projectDir, 'mash', 'media');
            const thumbsDir = path_1.default.join(mediaDir, 'thumbnails');
            await ensureDirExists(mediaDir);
            await ensureDirExists(thumbsDir);
            const extensions = ['jpeg', 'jpg', 'png', 'gif'];
            const items = [];
            for (const url of JSON.parse(urls)) {
                const response = await (0, node_fetch_1.default)(url);
                if (!response.ok)
                    continue;
                const buffer = await response.buffer();
                const name = 'unsplash-photo.jpg'; // Adjust this according to your requirements
                const ext = path_1.default.extname(name).slice(1).toLowerCase();
                const baseName = path_1.default.basename(name, `.${ext}`);
                if (!extensions.includes(ext))
                    continue;
                let counter = 0;
                let checkName = `${baseName}-${counter}.${ext}`;
                while (await exists(path_1.default.join(mediaDir, checkName))) {
                    counter++;
                    checkName = `${baseName}-${counter}.${ext}`;
                }
                const filePath = path_1.default.join(mediaDir, checkName);
                await promises_1.default.writeFile(filePath, buffer);
                const size = await (0, sharp_1.default)(filePath).metadata();
                const thumbnailPath = path_1.default.join(thumbsDir, checkName);
                await createThumbnail(filePath, thumbnailPath);
                items.push({
                    original: checkName,
                    type: 'image',
                    width: size.width,
                    height: size.height,
                    thumbnail: path_1.default
                        .join(dir, 'mash', 'media', 'thumbnails', checkName)
                        .replace(/\\/g, '/'),
                });
            }
            return items;
        }
        catch (error) {
            console.error('Error in mediaAddItemsByUrls:', error);
            throw error;
        }
    }),
    addVideoPreview: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { previews, dir } = body;
            console.log('Previews:', previews); // Log the previews
            if (!previews || !dir) {
                throw new Error('Previews and directory are required');
            }
            const previewsObj = Array.isArray(previews)
                ? previews
                : JSON.parse(previews);
            const projectDir = path_1.default.join(publicUrl, dir);
            const thumbsDir = path_1.default.join(projectDir, 'mash', 'media', 'thumbnails');
            await ensureDirExists(thumbsDir);
            const results = await Promise.all(previewsObj.map(async (preview) => {
                if (!preview.imageString) {
                    throw new Error('ImageString is undefined');
                }
                const thumbPath = path_1.default.join(thumbsDir, `${preview.name}-mash-video.jpg`);
                await base64ToJpeg(preview.imageString, thumbPath);
                await resizeImage(thumbPath);
                return {
                    ...preview.item,
                    thumbnail: path_1.default
                        .join(dir, 'mash', 'media', 'thumbnails', `${preview.name}-mash-video.jpg`)
                        .replace(/\\/g, '/'),
                };
            }));
            return results;
        }
        catch (error) {
            throw error.message;
        }
    }),
    exportProject: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { dir, name } = body;
            if (!dir || !name) {
                throw new Error('Directory and name are required');
            }
            const projectDir = path_1.default.join(publicUrl, dir);
            const sanitizedProjectName = name
                .toLowerCase()
                .replace(/[\s\?\|\:\\\/\*\>\<\.\"\,]/g, '-');
            const destination = path_1.default.join(baseUrl, 'temp', `${sanitizedProjectName}.zip`);
            if (!(await existsAsync(path_1.default.join(baseUrl, 'temp')))) {
                await mkdirAsync(path_1.default.join(baseUrl, 'temp'), {});
            }
            if (await existsAsync(destination)) {
                await unlinkAsync(destination);
            }
            await zipDirectory(projectDir, destination);
            return `/theme/temp/${sanitizedProjectName}.zip`;
        }
        catch (error) {
            console.error('Error in exportProject:', error);
            throw error;
        }
    }),
    extractZip: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { destination, zip } = body;
            if (!destination || !zip) {
                throw new Error('Destination and zip file path are required');
            }
            const zipPath = path_1.default.join(publicUrl, zip);
            const destPath = path_1.default.join(publicUrl, destination);
            // Check if the destination path exists and is writable
            if (await exists(destPath)) {
                try {
                    await promises_1.default.access(destPath, promises_1.default.constants.W_OK);
                }
                catch {
                    return -1; // Not writable
                }
            }
            else {
                // Create destination directory if it doesn't exist
                await promises_1.default.mkdir(destPath, { recursive: true });
            }
            // Extract ZIP
            const zipFile = new adm_zip_1.default(zipPath);
            zipFile.extractAllTo(destPath, true);
            // Remove ZIP file
            await promises_1.default.unlink(zipPath);
            return 0;
        }
        catch (error) {
            console.error('Error in extractZip:', error);
            return error.code === 'ENOENT' ? -2 : -3; // -2 for file not found, -3 for other errors
        }
    }),
    generateRobotsTxt: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { settings, path: inputPath } = body;
            if (!settings || !inputPath) {
                throw new Error('Settings and path are required');
            }
            let content = '';
            if (settings.recommended) {
                content += `User-Agent: *\n`;
                content += settings.indexingDisabled ? 'Disallow: /\n' : 'Allow: /\n';
            }
            if (settings.sitemapUrl) {
                content += `Sitemap: ${settings.sitemapUrl}\n`;
            }
            if (settings.customCode) {
                content += settings.customCode;
            }
            const destination = path_1.default.join(publicUrl, inputPath, 'robots.txt');
            await promises_1.default.writeFile(destination, content);
            return inputPath + 'robots.txt';
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    generateSitemap: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { settings, pages, path: inputPath } = body;
            if (!settings || !pages || !inputPath) {
                throw new Error('Settings, pages, and path are required');
            }
            const originalDestination = path_1.default.join(inputPath, 'sitemap.xml');
            const destination = path_1.default.join(publicUrl, originalDestination);
            const xml = xmlbuilder_1.default
                .create('urlset', { encoding: 'UTF-8' })
                .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
                .att('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')
                .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
            toXml(xml, pages, settings);
            const xmlString = xml.end({ pretty: true });
            await promises_1.default.writeFile(destination, xmlString);
            return originalDestination;
        }
        catch (error) {
            throw new Error(error.message);
        }
    }),
    copyFontToProject: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { source, project, destination, file } = body;
            if (!source || !project || !destination) {
                throw new Error('Source, project, and destination are required');
            }
            const fontName = path_1.default.basename(source);
            if (source === 'null') {
                return null;
            }
            const projectUrl = path_1.default.join(publicUrl, project);
            const targetDir = path_1.default.join(projectUrl, destination, fontName);
            await recurseCopy(path_1.default.join(publicUrl, source), targetDir);
            return path_1.default.join(destination, fontName, file);
        }
        catch (error) {
            console.error('Error in copyFontToProject:', error);
            return { error: true, message: error.message };
        }
    }),
    copyPagePreview: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { url, dir } = body;
            if (!url || !dir) {
                throw new Error('URL and directory are required');
            }
            if (url === 'null') {
                return null;
            }
            const projectUrl = path_1.default.join(publicUrl, dir);
            const uploadDir = 'mash/pages/';
            const tempDir = path_1.default.join(publicUrl, 'temp');
            await promises_1.default.mkdir(tempDir, { recursive: true });
            const { name, ext } = path_1.default.parse(url);
            const targetName = `${name}${ext}`;
            const tempFilePath = path_1.default.join(tempDir, targetName);
            const destinationFilePath = path_1.default.join(projectUrl, uploadDir, `${name}-copy${ext}`);
            await promises_1.default.copyFile(path_1.default.join(projectUrl, url), tempFilePath);
            await promises_1.default.rename(tempFilePath, destinationFilePath);
            return path_1.default.join(uploadDir, `${name}-copy${ext}`);
        }
        catch (error) {
            console.error('Error in copyPagePreview:', error);
            return { error: true, message: error.message };
        }
    }),
    copySectionPreview: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { url, dir } = body;
            if (!url || !dir || url === 'null') {
                return null;
            }
            const uploadDir = 'elements/';
            const projectUrl = path_1.default.join(publicUrl, dir);
            const tempDir = path_1.default.join(publicUrl, 'temp');
            const parsedPath = path_1.default.parse(url);
            const baseName = parsedPath.name;
            const ext = parsedPath.ext;
            await promises_1.default.mkdir(tempDir, { recursive: true });
            const sourcePath = path_1.default.join(projectUrl, url);
            const tempPath = path_1.default.join(tempDir, baseName + ext);
            const targetPath = path_1.default.join(projectUrl, uploadDir, `${baseName}-copy${ext}`);
            await promises_1.default.copyFile(sourcePath, tempPath);
            await promises_1.default.rename(tempPath, targetPath);
            return path_1.default.join(uploadDir, `${baseName}-copy${ext}`);
        }
        catch (error) {
            console.error('Error in copySectionPreview:', error);
            return { error: true, message: error.message };
        }
    }),
    deleteProjectFiles: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { files, path: inputPath } = body;
            for (let i = 0; i < files.length; i++) {
                const filePath = path_1.default.join(publicUrl, inputPath, files[i]);
                if (await exists(filePath)) {
                    await promises_1.default.unlink(filePath);
                }
            }
            return { result: true };
        }
        catch (error) {
            console.error('Error in deleteProjectFiles:', error);
            return { result: false, message: error.message };
        }
    }),
    mailformGetAddress: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { dir } = body;
            if (!dir) {
                return { emails: '' };
            }
            const sourceUrl = path_1.default.join(publicUrl, dir, 'bat/rd-mailform.php');
            if (await exists(sourceUrl)) {
                const content = await promises_1.default.readFile(sourceUrl, 'utf8');
                const matches = content.match(/recipients\s*=\s*["']([^"']*)["'];/i);
                return { emails: matches ? matches[1] : '' };
            }
            return { emails: '' };
        }
        catch (error) {
            console.error('Error in mailformGetAddress:', error);
            return { emails: '', message: error.message };
        }
    }),
    mailformSetAddress: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { dir, destination } = body;
            if (!dir || !destination) {
                return { emails: '' };
            }
            const sourceUrl = path_1.default.join(publicUrl, dir, 'bat/rd-mailform.php');
            if (await exists(sourceUrl)) {
                let content = await promises_1.default.readFile(sourceUrl, 'utf8');
                content = content.replace(/(recipients\s*=\s*["'])([^"']*)(["'];)/, `$1${destination}$3`);
                await promises_1.default.writeFile(sourceUrl, content);
                return { emails: destination };
            }
            return { emails: '' };
        }
        catch (error) {
            console.error('Error in mailformSetAddress:', error);
            return { emails: '', message: error.message };
        }
    }),
    moveFile: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { sourceFile, destination } = body;
            if (!sourceFile || !destination) {
                return -1;
            }
            const sourceFileName = path_1.default.basename(sourceFile);
            const sourceFilePath = path_1.default.join(publicUrl, sourceFile);
            const destFilePath = path_1.default.join(publicUrl, destination, sourceFileName);
            if (await exists(sourceFilePath)) {
                await promises_1.default.rename(sourceFilePath, destFilePath);
                return sourceFileName;
            }
            else {
                return -1;
            }
        }
        catch (error) {
            console.error('Error in moveFile:', error);
            return -1;
        }
    }),
    projectImport: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { template, dir } = body;
            if (!template || !dir) {
                return -1;
            }
            const filePath = template;
            const fileName = path_1.default.basename(filePath);
            const ext = path_1.default.extname(fileName).toLowerCase();
            const continueWithExtraction = ext === '.zip';
            if (!continueWithExtraction) {
                return -2;
            }
            const targetDir = path_1.default.join(publicUrl, dir);
            const targetZip = path_1.default.join(publicUrl, filePath);
            const tmpDir = path_1.default.join(publicUrl, 'temp', 'upload');
            if (await exists(tmpDir)) {
                await rmdirRecursive(tmpDir);
            }
            const tmpTargetDir = path_1.default.join(targetDir, 'temp');
            if (!(await exists(tmpTargetDir))) {
                await promises_1.default.mkdir(tmpTargetDir, { recursive: true });
            }
            const zip = new adm_zip_1.default(targetZip);
            if (!zip.getEntry('project.json')) {
                await rmdirRecursive(tmpTargetDir);
                await promises_1.default.unlink(targetZip);
                return -4;
            }
            else {
                if (await exists(targetDir)) {
                    await rmdirRecursive(targetDir);
                }
                await promises_1.default.mkdir(targetDir, { recursive: true });
                zip.extractAllTo(targetDir, true);
                await promises_1.default.unlink(targetZip);
                return 1;
            }
        }
        catch (error) {
            console.error('Error in projectImport:', error);
            return -3; // General error code
        }
    }),
    saveProjectFile: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { path: filePath, content } = body;
            if (!filePath || content === undefined) {
                return 'false';
            }
            const url = path_1.default.join(publicUrl, filePath);
            // Create the file if it does not exist
            await promises_1.default.writeFile(url, content, { flag: 'w' });
            return 'true';
        }
        catch (error) {
            console.error('Error in saveProjectFile:', error);
            return 'false';
        }
    }),
    templateImport: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { template, dir } = body;
            if (!template || !dir) {
                return -2;
            }
            const targetDir = path_1.default.join(publicUrl, dir);
            const targetZip = path_1.default.join(publicUrl, template);
            const tmpDir = path_1.default.join(publicUrl, 'temp', 'upload');
            const zip = new adm_zip_1.default(targetZip);
            if (await exists(tmpDir)) {
                await rmdirRecursive(tmpDir);
            }
            if (await exists(targetDir)) {
                await rmdirRecursive(targetDir);
            }
            await promises_1.default.mkdir(targetDir, { recursive: true });
            zip.extractAllTo(targetDir, true);
            const project = {
                sections: [],
                name: path_1.default.basename(template, '.zip'),
                dir: dir.replace('../', ''),
                pages: [],
            };
            const htmlFiles = glob_1.default.sync(`${targetDir}/*.html`);
            for (let i = 0; i < htmlFiles.length; i++) {
                const content = await promises_1.default.readFile(htmlFiles[i], 'utf8');
                const title = getPageTitle(content) || path_1.default.basename(htmlFiles[i], '.html');
                project.pages.push({
                    title,
                    index: path_1.default.basename(htmlFiles[i]) === 'index.html',
                    isActive: path_1.default.basename(htmlFiles[i]) === 'index.html',
                    path: path_1.default.basename(htmlFiles[i]),
                    preview: null,
                });
            }
            await promises_1.default.writeFile(path_1.default.join(targetDir, 'project.json'), JSON.stringify(project));
            await promises_1.default.unlink(targetZip);
            return project;
        }
        catch (error) {
            console.error('Error in templateImport:', error);
            return -3;
        }
    }),
    updateIconFonts: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { fonts } = body;
            if (!fonts) {
                return 'failure';
            }
            const fontsFile = path_1.default.join(publicUrl, 'icons', 'icons.json');
            if (await exists(fontsFile)) {
                await promises_1.default.writeFile(fontsFile, fonts);
                return 'success';
            }
            else {
                return 'failure';
            }
        }
        catch (error) {
            console.error('Error in updateIconFonts:', error);
            return 'failure';
        }
    }),
    updateSystemSettings: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { config } = body;
            if (!config) {
                return 'Invalid input';
            }
            const configFile = path_1.default.join(baseUrl, 'config', 'config.json');
            if (await exists(configFile)) {
                await promises_1.default.writeFile(configFile, config);
                return 'success';
            }
            else {
                return 'Config file not found';
            }
        }
        catch (error) {
            console.error('Error in updateSystemSettings:', error);
            return 'Error updating system settings';
        }
    }),
    uploadFavicon: (0, utils_1.handleController)(async (req, _, __, ___, ____) => {
        try {
            const { dir } = req.body;
            const file = req.file; // Assuming multer middleware is used
            if (!dir || !file) {
                return { error: 'Invalid input' };
            }
            const validMimeTypes = ['image/jpeg', 'image/png', 'image/x-icon'];
            if (!validMimeTypes.includes(file.mimetype)) {
                return {
                    error: 'The wrong favicon format is selected. Only .jpg, .png, .ico formats are supported.',
                };
            }
            const uploadDir = path_1.default.join(publicUrl, dir, 'images');
            const tmpName = path_1.default.join(uploadDir, file.originalname);
            await promises_1.default.rename(file.path, tmpName);
            return { url: 'images/' + file.originalname };
        }
        catch (error) {
            console.error('Error in uploadFavicon:', error);
            return { error: 'Error uploading favicon' };
        }
    }),
    uploadPagePreview: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { dir, path: filePath } = body;
            if (!dir || !filePath) {
                return { error: 'Invalid input' };
            }
            const validExtensions = ['.jpeg', '.jpg', '.png'];
            const ext = path_1.default.extname(filePath).toLowerCase();
            if (!validExtensions.includes(ext)) {
                throw new Error('The wrong file format is selected. Only .jpg, .png formats are supported.');
            }
            const projectDir = path_1.default.join(publicUrl, dir, 'mash', 'pages');
            await ensureDirExists(projectDir);
            const baseName = path_1.default.basename(filePath);
            const targetName = baseName.replace(/\s+/g, '-').toLowerCase();
            let targetPath = path_1.default.join(projectDir, targetName + ext);
            let i = 0;
            while (await exists(targetPath)) {
                targetPath = path_1.default.join(projectDir, `${targetName}-${++i}${ext}`);
            }
            const sourcePath = path_1.default.join(publicUrl, dir, filePath);
            await promises_1.default.copyFile(sourcePath, targetPath);
            const resultUrl = i > 0
                ? `mash/pages/${targetName}-${i}${ext}`
                : `mash/pages/${targetName}${ext}`;
            return { url: resultUrl };
        }
        catch (error) {
            console.error('Error in uploadPagePreview:', error);
            return { error: true, message: error.message };
        }
    }),
    uploadSectionPreview: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const { dir, path: inputPath } = body;
            if (!dir || !inputPath) {
                return { error: 'Invalid input' };
            }
            const baseName = path_1.default.basename(inputPath);
            const pathInfo = path_1.default.parse(baseName);
            const targetName = pathInfo.name.toLowerCase().replace(/\s+/g, '-') + pathInfo.ext;
            const validExtensions = ['.jpeg', '.jpg', '.png'];
            if (!validExtensions.includes(pathInfo.ext.toLowerCase())) {
                throw new Error('The wrong file format is selected. Only .jpg, .png formats are supported.');
            }
            const projectPath = path_1.default.join(publicUrl, dir);
            const uploadDir = path_1.default.join(projectPath, 'elements');
            await ensureDirExists(uploadDir);
            let targetPath = path_1.default.join(uploadDir, targetName);
            let i = 0;
            // Check if file exists and increment the counter until a new file name is found
            while (await exists(targetPath)) {
                targetPath = path_1.default.join(uploadDir, `${pathInfo.name}-${++i}${pathInfo.ext}`);
            }
            await promises_1.default.copyFile(path_1.default.join(projectPath, inputPath), targetPath);
            const resultUrl = i > 0
                ? `elements/${pathInfo.name}-${i}${pathInfo.ext}`
                : `elements/${targetName}`;
            return { url: resultUrl };
        }
        catch (error) {
            console.error('Error in uploadSectionPreview:', error);
            return { error: true, message: error.message };
        }
    }),
};
