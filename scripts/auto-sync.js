import { watch } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const DEBOUNCE_DELAY = 5000; // 5 seconds debounce
let syncTimer = null;
let isSyncing = false;
let pendingSync = false;

const IGNORED_PATHS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.env',
  '.env.local',
  '.DS_Store',
  'coverage'
];

function shouldIgnore(filepath) {
  if (!filepath) return true;
  const parts = filepath.split(path.sep);
  return parts.some(part => IGNORED_PATHS.includes(part));
}

function runGitSync() {
  if (isSyncing) {
    pendingSync = true;
    return;
  }

  isSyncing = true;
  pendingSync = false;

  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim();
    if (!status) {
      console.log(`[${new Date().toLocaleTimeString()}] No changes to commit.`);
      isSyncing = false;
      return;
    }

    console.log(`\n[${new Date().toLocaleTimeString()}] Changes detected. Starting auto-sync...`);
    
    // Pull remote changes first
    try {
      console.log('🔄 Fetching & pulling remote changes...');
      execSync('git pull --rebase', { stdio: 'inherit' });
    } catch (pullError) {
      console.warn('⚠️ Pull rebase warning (proceeding with commit & push):', pullError.message);
    }

    // Add changes
    execSync('git add .', { stdio: 'inherit' });

    // Commit changes
    const timestamp = new Date().toLocaleString();
    const commitMsg = `auto: sync changes [${timestamp}]`;
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    console.log(`✅ Committed: "${commitMsg}"`);

    // Push to GitHub
    console.log('🚀 Pushing to GitHub...');
    execSync('git push', { stdio: 'inherit' });
    console.log(`🎉 Successfully synced and pushed to GitHub at ${new Date().toLocaleTimeString()}!\n`);
  } catch (error) {
    console.error('❌ Auto-sync error:', error.message);
  } finally {
    isSyncing = false;
    if (pendingSync) {
      console.log('🔄 Pending changes detected while syncing, triggering re-sync...');
      scheduleSync();
    }
  }
}

function scheduleSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    runGitSync();
  }, DEBOUNCE_DELAY);
}

console.log('---------------------------------------------------------');
console.log('📡 Git Auto-Sync Watcher Started');
console.log(`📂 Watching repository: ${process.cwd()}`);
console.log(`⏱️ Debounce delay: ${DEBOUNCE_DELAY / 1000}s`);
console.log('Press Ctrl+C to stop auto-sync.');
console.log('---------------------------------------------------------\n');

try {
  watch(process.cwd(), { recursive: true }, (eventType, filename) => {
    if (filename && shouldIgnore(filename)) {
      return;
    }
    console.log(`📝 Detected change [${eventType}]: ${filename || 'workspace'}`);
    scheduleSync();
  });
} catch (err) {
  console.error('Failed to initialize file watcher:', err.message);
}
