/**
 * File Size Monitor
 * Checks file sizes and warns if files are getting too large
 * Helps prevent file corruption and maintains code quality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File size thresholds (in lines)
const THRESHOLDS = {
    WARNING: 500,   // Warn if file exceeds this
    CRITICAL: 800,  // Critical if file exceeds this
    MAX: 1000       // Should never exceed this
};

// Files to check
const DIRECTORIES_TO_CHECK = [
    'ui',
    'graph',
    'services',
    'utils',
    'registries',
    'data'
];

const FILES_TO_CHECK = [
    'app.js',
    'tests.js',
    'utils.js',
    'services.js',
    'ui.js'
];

/**
 * Count lines in a file
 */
function countLines(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.split('\n').length;
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err.message);
        return 0;
    }
}

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return (stats.size / 1024).toFixed(2);
    } catch (_err) {
        return 0;
    }
}

/**
 * Check all JavaScript files
 */
function checkAllFiles() {
    const results = {
        total: 0,
        warnings: [],
        critical: [],
        exceeded: []
    };

    // Check root files
    FILES_TO_CHECK.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            checkFile(filePath, results);
        }
    });

    // Check directories
    DIRECTORIES_TO_CHECK.forEach(dir => {
        const dirPath = path.join(__dirname, '..', dir);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                if (file.endsWith('.js')) {
                    const filePath = path.join(dirPath, file);
                    checkFile(filePath, results);
                }
            });
        }
    });

    return results;
}

/**
 * Check a single file
 */
function checkFile(filePath, results) {
    const lines = countLines(filePath);
    const sizeKB = getFileSizeKB(filePath);
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);

    results.total++;

    const fileInfo = {
        path: relativePath,
        lines,
        sizeKB
    };

    if (lines > THRESHOLDS.MAX) {
        results.exceeded.push(fileInfo);
    } else if (lines > THRESHOLDS.CRITICAL) {
        results.critical.push(fileInfo);
    } else if (lines > THRESHOLDS.WARNING) {
        results.warnings.push(fileInfo);
    }
}

/**
 * Print report
 */
function printReport(results) {
    console.log('\n=== FILE SIZE MONITOR REPORT ===\n');
    console.log(`Total files checked: ${results.total}\n`);

    if (results.exceeded.length > 0) {
        console.log('🔴 EXCEEDED MAX SIZE (>1000 lines):');
        results.exceeded.forEach(f => {
            console.log(`  ❌ ${f.path}: ${f.lines} lines (${f.sizeKB} KB)`);
        });
        console.log('  ⚠️  These files MUST be split immediately!\n');
    }

    if (results.critical.length > 0) {
        console.log('🟠 CRITICAL SIZE (>800 lines):');
        results.critical.forEach(f => {
            console.log(`  ⚠️  ${f.path}: ${f.lines} lines (${f.sizeKB} KB)`);
        });
        console.log('  ⚠️  Consider refactoring these files soon.\n');
    }

    if (results.warnings.length > 0) {
        console.log('🟡 WARNING SIZE (>500 lines):');
        results.warnings.forEach(f => {
            console.log(`  ⚠️  ${f.path}: ${f.lines} lines (${f.sizeKB} KB)`);
        });
        console.log('  ℹ️  Monitor these files for growth.\n');
    }

    if (results.exceeded.length === 0 && results.critical.length === 0 && results.warnings.length === 0) {
        console.log('✅ All files are within acceptable size limits!\n');
    }

    // Exit with error code if any files exceeded max
    if (results.exceeded.length > 0) {
        console.log('❌ Build failed: Files exceed maximum size limit.');
        process.exit(1);
    }
}

/**
 * Suggest refactoring for large files
 */
function suggestRefactoring(filePath) {
    console.log(`\n📋 Refactoring suggestions for ${filePath}:`);

    if (filePath.includes('Controller')) {
        console.log('  • Extract rendering logic into a separate Renderer class');
        console.log('  • Move event handlers into a separate EventHandler class');
        console.log('  • Extract validation logic into a Validator class');
    } else if (filePath.includes('utils')) {
        console.log('  • Split into domain-specific utility files (e.g., stringUtils.js, arrayUtils.js)');
    } else {
        console.log('  • Identify logical sections and extract into separate modules');
        console.log('  • Look for repeated patterns that can be abstracted');
    }
}

// Run the monitor
const results = checkAllFiles();
printReport(results);

// Provide refactoring suggestions for critical files
if (results.critical.length > 0 || results.exceeded.length > 0) {
    console.log('\n=== REFACTORING SUGGESTIONS ===\n');
    [...results.exceeded, ...results.critical].forEach(f => {
        suggestRefactoring(f.path);
    });
}

export { checkAllFiles, printReport };
