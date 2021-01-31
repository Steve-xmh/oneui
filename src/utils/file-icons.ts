import * as mdi from '@mdi/js'

const fileIcons: { [_: string]: string } = {
    // Common file
    '.txt': mdi.mdiTextBox,

    '.png': mdi.mdiImage,
    '.webp': mdi.mdiImage,
    '.jpg': mdi.mdiImage,
    '.jpeg': mdi.mdiImage,
    '.gif': mdi.mdiImage,
    '.bmp': mdi.mdiImage,
    '.tif': mdi.mdiImage,
    '.tiff': mdi.mdiImage,
    '.heif': mdi.mdiImage,
    '.indd': mdi.mdiImage,
    '.eps': mdi.mdiImage,
    '.raw': mdi.mdiImage,
    '.cr2': mdi.mdiImage,
    '.nef': mdi.mdiImage,
    '.orf': mdi.mdiImage,
    '.sr2': mdi.mdiImage,
    '.psd': mdi.mdiImage,
    '.svg': mdi.mdiImage,
    '.ai': mdi.mdiImage,

    '.doc': mdi.mdiFileWordBox,
    '.docx': mdi.mdiFileWordBox,
    '.ppt': mdi.mdiFilePowerpointBox,
    '.pptx': mdi.mdiFilePowerpointBox,
    '.xls': mdi.mdiFileExcelBox,
    '.xlsx': mdi.mdiFileExcelBox,

    '.pdf': mdi.mdiPdfBox,

    '.zip': mdi.mdiZipBox,
    '.rar': mdi.mdiZipBox,
    '.gz': mdi.mdiZipBox,
    '.tar': mdi.mdiZipBox,
    '.7z': mdi.mdiZipBox,

    // Programing file
    '.c': mdi.mdiLanguageC,
    '.cc': mdi.mdiLanguageC,
    '.cpp': mdi.mdiLanguageCpp,
    '.h': mdi.mdiLanguageC,
    '.hpp': mdi.mdiLanguageCpp,

    '.js': mdi.mdiLanguageJavascript,
    '.jsm': mdi.mdiLanguageJavascript,
    '.ts': mdi.mdiLanguageJavascript,

    '.cs': mdi.mdiLanguageCsharp,

    '.css': mdi.mdiLanguageCss3,
    '.scss': mdi.mdiLanguageCss3,
    '.sass': mdi.mdiLanguageCss3,
    '.styl': mdi.mdiLanguageCss3,

    '.java': mdi.mdiLanguageJava,
    '.kt': mdi.mdiLanguageKotlin,

    '.lua': mdi.mdiLanguageLua,

    '.html': mdi.mdiLanguageHtml5,
    '.htm': mdi.mdiLanguageHtml5,

    '.md': mdi.mdiLanguageMarkdown,

    '.php': mdi.mdiLanguagePhp,

    '.py': mdi.mdiLanguagePython,
    '.pyi': mdi.mdiLanguagePython,
    '.pyc': mdi.mdiLanguagePython,
    '.pyd': mdi.mdiLanguagePython,
    '.pyo': mdi.mdiLanguagePython,
    '.pyw': mdi.mdiLanguagePython,
    '.pyz': mdi.mdiLanguagePython,

    '.f': mdi.mdiLanguageFortran,
    '.for': mdi.mdiLanguageFortran,
    '.f90': mdi.mdiLanguageFortran,
    '.f95': mdi.mdiLanguageFortran,

    '.go': mdi.mdiLanguageGo,

    '.hs': mdi.mdiLanguageHaskell,
    '.lhs': mdi.mdiLanguageHaskell,

    '.rs': mdi.mdiLanguageRust,
    '.rb': mdi.mdiLanguageRuby,

    '.swift': mdi.mdiLanguageSwift,
}

export function getFileIconPath(filename: string): string {
    const ext = filename.substring(filename.lastIndexOf('.'))
    if (ext in fileIcons) {
        return fileIcons[ext]
    }
    return mdi.mdiFile
}
