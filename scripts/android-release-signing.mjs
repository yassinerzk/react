// Patches the Expo-generated android/app/build.gradle so the release build
// type signs with app/release.keystore using credentials from the environment
// (ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD).
// Usage: node scripts/android-release-signing.mjs android/app/build.gradle
import fs from 'node:fs';

const file = process.argv[2];
let gradle = fs.readFileSync(file, 'utf8');

const releaseConfig = `
        release {
            storeFile file('release.keystore')
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('ANDROID_KEY_ALIAS')
            keyPassword System.getenv('ANDROID_KEY_PASSWORD')
        }`;

if (!/signingConfigs\s*\{/.test(gradle)) throw new Error('signingConfigs block not found');
gradle = gradle.replace(/signingConfigs\s*\{/, (m) => `${m}${releaseConfig}`);

// Point the release build type at it (the template uses the debug key).
const before = gradle;
gradle = gradle.replace(
  /(release\s*\{[^}]*?)signingConfig signingConfigs\.debug/,
  '$1signingConfig signingConfigs.release',
);
if (gradle === before) throw new Error('release build type not patched');

fs.writeFileSync(file, gradle);
console.log('release signing configured');
