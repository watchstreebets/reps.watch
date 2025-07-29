const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const fm = require('front-matter');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');
const outputDir = path.join(rootDir, 'dist');
const guideDir = path.join(srcDir, 'guide');
const templatePath = path.join(srcDir, 'article-template.html');

// --- Helper Functions ---

// Find all markdown files recursively
function findMarkdownFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(findMarkdownFiles(file));
        } else if (path.extname(file) === '.md') {
            results.push(file);
        }
    });
    return results;
}

// --- Main Build Steps ---

function clean() {
    console.log(`Cleaning directory: ${outputDir}`);
    fs.emptyDirSync(outputDir);
}

function buildGuides() {
    console.log('Building guides from markdown...');
    const template = fs.readFileSync(templatePath, 'utf8');
    const markdownFiles = findMarkdownFiles(guideDir);

    markdownFiles.forEach(file => {
        const fileContent = fs.readFileSync(file, 'utf8');
        const { attributes, body } = fm(fileContent);
        const title = attributes.title || 'Untitled';
        const htmlContent = marked.parse(body);

        // Populate the template
        let outputHtml = template.replace('{{TITLE}}', title);
        outputHtml = outputHtml.replace('{{CONTENT}}', htmlContent);

        // Determine output path relative to the 'guide' dir
        const relativeFile = path.relative(guideDir, file);
        const outputPath = path.join(outputDir, 'guide', relativeFile.replace('.md', ''), 'index.html').replace(/\\/g, '/');

        fs.ensureDirSync(path.dirname(outputPath));
        fs.writeFileSync(outputPath, outputHtml);
    });
    console.log(`-> Built ${markdownFiles.length} guide pages.`);
}

function copyStaticAssets() {
    console.log('Copying static assets...');
    const assets = [
        'index.html', 'dealers.html', 'guides.html',
        'style.css', 'style.mobile.css',
                'script.js', 'js/',
        'assets/', 'data/'
    ];

    assets.forEach(asset => {
        const sourcePath = path.join(srcDir, asset);
        let destPath;

        // Handle clean URLs for top-level html files
        if (asset.endsWith('.html') && asset !== 'index.html' && asset !== 'article-template.html') {
            const assetName = asset.replace('.html', '');
            destPath = path.join(outputDir, assetName, 'index.html');
        } else {
            destPath = path.join(outputDir, asset);
        }

        if (fs.existsSync(sourcePath)) {
            fs.copySync(sourcePath, destPath);
            console.log(`-> Copied ${asset}`);
        }
    });
}

// --- Run Build Process ---

function build() {
    console.log('Starting build process...');
    clean();
    buildGuides();
    copyStaticAssets();
    console.log('\nBuild complete! The full website is ready in the /dist directory.');
}

build();
