#!/usr/bin/env node
/**
 * Smoke-check script for the music_p2p backend API.
 *
 * Usage:
 *   npm run smoke
 *   VITE_API_URL=http://192.168.1.10:8080 npm run smoke
 *
 * Exits with code 0 if all checks pass, 1 otherwise.
 */

const rawBase = process.env.VITE_API_URL ?? 'http://localhost:8080';
const BASE_URL = rawBase.replace(/\/+$/, '') + '/api/v1';

const checks = [
  { label: 'GET /status',   path: '/status' },
  { label: 'GET /metadata', path: '/metadata' },
  { label: 'GET /tracks',   path: '/tracks' },
];

let anyFailed = false;

async function runCheck({ label, path }) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      console.log(`  OK    ${label}`);
    } else {
      console.error(`  FAIL  ${label}  →  HTTP ${res.status}`);
      anyFailed = true;
    }
  } catch (err) {
    console.error(`  FAIL  ${label}  →  ${err.message}`);
    anyFailed = true;
  }
}

console.log(`Smoke check against ${BASE_URL}\n`);

(async () => {
  for (const check of checks) {
    await runCheck(check);
  }
  console.log('');
  if (anyFailed) {
    console.error('One or more checks FAILED.');
    process.exit(1);
  } else {
    console.log('All checks passed.');
  }
})();
