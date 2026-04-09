#!/usr/bin/env node
/**
 * Deploy static web app to SharePoint Online via Microsoft Graph API.
 * Manual Device Code Flow (no MSAL dependency — Node.js v24 compatible).
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { execSync } from 'child_process';

// ─── Configuration ───────────────────────────────────────────────
const CONFIG = {
  siteHost: 'genoschulekoeln.sharepoint.com',
  siteUrl: 'https://genoschulekoeln.sharepoint.com',
  libraryName: 'Freigegebene Dokumente',
  targetFolder: 'ZP10-Diagnose',
  appDir: join(import.meta.dirname, 'app'),
};

// Microsoft Office app (pre-consented in all Microsoft 365 tenants)
const CLIENT_ID = 'd3590ed6-52b3-4102-aeff-aad2292ab01c';
const TENANT = 'genoschulekoeln.onmicrosoft.com';
const SCOPE = 'https://graph.microsoft.com/Files.ReadWrite.All https://graph.microsoft.com/Sites.ReadWrite.All offline_access';

// ─── File Discovery ──────────────────────────────────────────────
function getAllFiles(dir, base = dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, base));
    } else {
      files.push({
        localPath: fullPath,
        relativePath: relative(base, fullPath).replace(/\\/g, '/'),
        size: stat.size,
      });
    }
  }
  return files;
}

// ─── Manual Device Code Flow ─────────────────────────────────────
async function getDeviceCode() {
  const res = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/devicecode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPE)}`,
  });
  if (!res.ok) throw new Error(`Device code request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function pollForToken(deviceCode, interval, expiresIn) {
  const deadline = Date.now() + expiresIn * 1000;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, interval * 1000));

    const res = await fetch(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_id=${CLIENT_ID}&grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=${deviceCode}`,
    });

    const data = await res.json();

    if (data.access_token) {
      return data.access_token;
    }

    if (data.error === 'authorization_pending') {
      process.stdout.write('.');
      continue;
    }

    if (data.error === 'slow_down') {
      interval += 5;
      continue;
    }

    throw new Error(`Auth failed: ${data.error} - ${data.error_description}`);
  }

  throw new Error('Device code expired. Bitte erneut starten.');
}

async function authenticate() {
  console.log('\n🔐 Authentifizierung mit Microsoft 365...\n');

  const codeResponse = await getDeviceCode();

  console.log('━'.repeat(60));
  console.log(codeResponse.message);
  console.log('━'.repeat(60));

  // Open browser automatically
  try {
    execSync(`start "" "${codeResponse.verification_uri}"`, { stdio: 'ignore' });
  } catch { /* ignore */ }

  process.stdout.write('\nWarte auf Anmeldung');
  const token = await pollForToken(
    codeResponse.device_code,
    codeResponse.interval || 5,
    codeResponse.expires_in || 900
  );

  console.log('\n✅ Erfolgreich eingeloggt!\n');
  return token;
}

// ─── Graph API Helpers ───────────────────────────────────────────
async function graphFetch(token, url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res;
}

async function getSiteDriveId(token) {
  // Get root site
  const siteRes = await graphFetch(token,
    `https://graph.microsoft.com/v1.0/sites/${CONFIG.siteHost}:/:`
  );
  const site = await siteRes.json();
  console.log(`📍 Site: ${site.displayName} (${site.webUrl})`);

  // List drives
  const drivesRes = await graphFetch(token,
    `https://graph.microsoft.com/v1.0/sites/${site.id}/drives`
  );
  const drives = await drivesRes.json();

  const drive = drives.value.find(d =>
    d.name === CONFIG.libraryName ||
    d.name === 'Documents' ||
    d.name === 'Shared Documents' ||
    d.name === 'Dokumente'
  );

  if (!drive) {
    console.log('Verfügbare Bibliotheken:', drives.value.map(d => d.name).join(', '));
    throw new Error(`Bibliothek "${CONFIG.libraryName}" nicht gefunden.`);
  }

  console.log(`📁 Bibliothek: ${drive.name}`);
  return { siteId: site.id, driveId: drive.id };
}

function encodeURIPath(path) {
  return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

async function uploadFile(token, driveId, file, targetFolder) {
  const targetPath = `${targetFolder}/${file.relativePath}`;
  const content = readFileSync(file.localPath);

  const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${encodeURIPath(targetPath)}:/content`;
  await graphFetch(token, url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: content,
  });
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 SharePoint Deployment für ZP10 Mathe-Diagnose');
  console.log('━'.repeat(60));

  // 1. Discover files
  const files = getAllFiles(CONFIG.appDir);
  console.log(`\n📦 ${files.length} Dateien gefunden in ${CONFIG.appDir}`);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  console.log(`   Gesamtgröße: ${(totalSize / 1024).toFixed(0)} KB`);

  // 2. Authenticate
  const token = await authenticate();

  // 3. Get drive ID
  const { driveId } = await getSiteDriveId(token);

  // 4. Upload files
  console.log(`\n📤 Starte Upload nach "${CONFIG.targetFolder}"...\n`);

  let success = 0;
  let failed = 0;
  const errors = [];
  const padLen = String(files.length).length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const pct = Math.round(((i + 1) / files.length) * 100);
    const progress = `[${pct.toString().padStart(3)}%] (${(i + 1).toString().padStart(padLen)}/${files.length})`;

    try {
      await uploadFile(token, driveId, file, CONFIG.targetFolder);
      console.log(`${progress} ${file.relativePath} ✅`);
      success++;
    } catch (err) {
      // Retry once after 2s
      try {
        await new Promise(r => setTimeout(r, 2000));
        await uploadFile(token, driveId, file, CONFIG.targetFolder);
        console.log(`${progress} ${file.relativePath} ✅ (Retry)`);
        success++;
      } catch (retryErr) {
        console.log(`${progress} ${file.relativePath} ❌`);
        console.log(`         ${retryErr.message.slice(0, 120)}`);
        errors.push({ file: file.relativePath, error: retryErr.message });
        failed++;
      }
    }
  }

  // 5. Summary
  console.log('\n' + '━'.repeat(60));
  console.log(`✅ Erfolgreich: ${success}/${files.length}`);
  if (failed > 0) {
    console.log(`❌ Fehlgeschlagen: ${failed}`);
    errors.forEach(e => console.log(`   - ${e.file}: ${e.error.slice(0, 80)}`));
  }

  const baseUrl = `${CONFIG.siteUrl}/Freigegebene%20Dokumente/${CONFIG.targetFolder}`;
  console.log(`\n🔗 App-URL:`);
  console.log(`   ${baseUrl}/index.html`);
  console.log(`\n📋 Weitere Seiten:`);
  console.log(`   ${baseUrl}/escape-room.html`);
  console.log(`   ${baseUrl}/module/zp10-terme-gleichungen.html`);
  console.log('━'.repeat(60));
}

main().catch(err => {
  console.error('\n❌ Fehler:', err.message);
  process.exit(1);
});
