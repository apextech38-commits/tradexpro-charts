// Mirrors profithubnewtool's rsbuild.config.ts `output.copy` config, which
// copies @deriv-com/smartcharts-champion's built assets (the actual chart
// engine — @deriv/deriv-charts is aliased to it at build time, see
// vite.config.ts) into the served output. Vite has no built-in equivalent of
// webpack/rsbuild's CopyPlugin, so this runs as a postinstall step and drops
// the same files into public/, which Vite serves as-is in both dev and build
// without needing an extra plugin.
//
// Source mapping (from rsbuild.config.ts):
//   dist/*        -> js/smartcharts/[name][ext]  (flattened, minus *.LICENSE.txt)
//   dist/chart     -> js/smartcharts/chart        (recursive)
//   dist/assets    -> assets                      (recursive, at output root)
const fs = require('fs');
const path = require('path');

const PKG_DIST = path.resolve(__dirname, '../node_modules/@deriv-com/smartcharts-champion/dist');
const PUBLIC_DIR = path.resolve(__dirname, '../public');

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src)) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}

function main() {
    if (!fs.existsSync(PKG_DIST)) {
        console.warn(
            '[copy-smartcharts-assets] smartcharts-champion dist not found — skipping (run npm install first)'
        );
        return;
    }

    const smartchartsOut = path.join(PUBLIC_DIR, 'js', 'smartcharts');
    fs.mkdirSync(smartchartsOut, { recursive: true });
    for (const entry of fs.readdirSync(PKG_DIST)) {
        if (entry.endsWith('.LICENSE.txt')) continue;
        const srcPath = path.join(PKG_DIST, entry);
        if (fs.statSync(srcPath).isFile()) {
            fs.copyFileSync(srcPath, path.join(smartchartsOut, entry));
        }
    }

    copyRecursive(path.join(PKG_DIST, 'chart'), path.join(smartchartsOut, 'chart'));
    copyRecursive(path.join(PKG_DIST, 'assets'), path.join(PUBLIC_DIR, 'assets'));

    console.log('[copy-smartcharts-assets] Copied smartcharts-champion assets into public/');
}

main();
