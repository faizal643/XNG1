import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Fix __dirname di ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoUrl = 'https://github.com/XenoviaCompany/XenoOS.git';
const currentPath = path.resolve(__dirname, '..');
const tempRepoPath = path.join(currentPath, 'tmp-repo');

function getVersionFromPackageJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return data.version;
}

async function cloneRepoToTemp() {
  if (!fs.existsSync(tempRepoPath)) {
    fs.mkdirSync(tempRepoPath, { recursive: true });
  }

  const git = simpleGit();
  console.log('🔍 Mengecek pembaruan dari repo...');
  await git.clone(repoUrl, tempRepoPath);
}

function copyFiles(src, dest) {
  const exclude = ['.git', 'node_modules', '.gitignore'];

  for (const file of fs.readdirSync(src)) {
    if (exclude.includes(file)) continue;

    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyFiles(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function cleanUpTempRepo() {
  if (fs.existsSync(tempRepoPath)) {
    fs.rmSync(tempRepoPath, { recursive: true, force: true });
  }
}

export async function cloneOrUpdateRepo() {
  try {
    const localVer = getVersionFromPackageJson(path.join(currentPath, 'package.json'));

    await cloneRepoToTemp();

    const remoteVer = getVersionFromPackageJson(path.join(tempRepoPath, 'package.json'));

    if (localVer !== remoteVer) {
      console.log(`🚀 Versi baru ditemukan (${localVer} → ${remoteVer}), memperbarui...`);
      copyFiles(tempRepoPath, currentPath);
      console.log('✅ File berhasil diperbarui!');

      // Restart otomatis jika pakai PM2
      try {
        execSync(`pm2 restart feyy`);
        console.log('🔁 Bot berhasil direstart via PM2.');
      } catch (e) {
        console.warn('⚠️ Gagal restart PM2:', e.message);
      }
    } else {
      console.log('✅ Bot sudah versi terbaru.');
    }

    cleanUpTempRepo();
  } catch (err) {
    console.error('❌ Gagal saat update:', err.message);
  }
}