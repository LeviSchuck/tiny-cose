// ex. scripts/build_npm.ts
import { build, emptyDir } from "@deno/dnt";

const lockFile = JSON.parse(await Deno.readTextFile("./deno.lock"));

/**
 * Searches through all specifiers that match the given pattern and returns the highest version.
 * @param pattern - The pattern to match (e.g., "jsr:@levischuck/tiny-cbor@*")
 * @returns The highest version found, or null if no matches
 */
function findHighestVersion(pattern: string): string | null {
  const regex = new RegExp(pattern.replace(/\*/g, ".*"));
  let highestVersion: string | null = null;

  for (const [key, version] of Object.entries(lockFile.specifiers)) {
    if (regex.test(key) && typeof version === "string") {
      if (highestVersion === null || compareVersions(version, highestVersion) > 0) {
        highestVersion = version;
      }
    }
  }

  return highestVersion;
}

/**
 * Compares two semantic version strings.
 * @param a - First version string
 * @param b - Second version string
 * @returns 1 if a > b, -1 if a < b, 0 if equal
 */
function compareVersions(a: string, b: string): number {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;

    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }

  return 0;
}

const tinyCborVersion = findHighestVersion("jsr:@levischuck/tiny-cbor@*");
const tinyEncodingsVersion = findHighestVersion("jsr:@levischuck/tiny-encodings@*");

if (!tinyCborVersion || !tinyEncodingsVersion) {
  throw new Error(`Failed to get version from deno.lock: ${tinyCborVersion} ${tinyEncodingsVersion}`);
}

await emptyDir("./npm");

await build({
  entryPoints: ["./index.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  test: false,
   // Deno to node doesn't support mapping JSR to NPM for some reason :/
  // mappings: {
  //   ["jsr:@levischuck/tiny-cbor"]: {
  //     name: "@levischuck/tiny-cbor",
  //     version: tinyCborVersion,
  //   },
  //   ["jsr:@levischuck/tiny-encodings"]: {
  //     name: "@levischuck/tiny-encodings",
  //     version: tinyEncodingsVersion,
  //   },
  // },
  package: {
    // package.json properties
    name: "@levischuck/tiny-cose",
    version: Deno.args[0],
    description: "Tiny COSE library for cryptographic operations in CBOR",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/levischuck/tiny-cose.git",
    },
    bugs: {
      url: "https://github.com/levischuck/tiny-cose/issues",
    },
  },
  compilerOptions: {
    lib: ["ES2021", "DOM"],
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE.txt", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");

    // Load package.json from the npm directory
    // and add @levischuck/tiny-cbor to the dependencies
    const packageJson = JSON.parse(Deno.readTextFileSync("npm/package.json"));
    const dependencies = packageJson.dependencies || {};
    packageJson.dependencies = dependencies;
    dependencies["@levischuck/tiny-cbor"] = tinyCborVersion;
    dependencies["@levischuck/tiny-encodings"] = tinyEncodingsVersion;
    Deno.writeTextFileSync(
      "npm/package.json",
      JSON.stringify(packageJson, null, 2),
    );
    // Run npm install again
    const proc = new Deno.Command("npm", { args: ["install"], cwd: "npm" })
      .outputSync();
    if (proc.code !== 0) {
      throw new Error(`Failed to run npm install: ${proc.code}`);
    }
    Deno.removeSync("npm/esm/deps/jsr.io/@levischuck/tiny-cbor", {
      recursive: true,
    });
    Deno.removeSync("npm/script/deps/jsr.io/@levischuck/tiny-cbor", {
      recursive: true,
    });
    Deno.removeSync("npm/src/deps/jsr.io/@levischuck/tiny-cbor", {
      recursive: true,
    });

    Deno.removeSync("npm/esm/deps/jsr.io/@levischuck/tiny-encodings", {
      recursive: true,
    });
    Deno.removeSync("npm/script/deps/jsr.io/@levischuck/tiny-encodings", {
      recursive: true,
    });
    Deno.removeSync("npm/src/deps/jsr.io/@levischuck/tiny-encodings", {
      recursive: true,
    });

    // Scan all JS files (recursive) and replace
    // "../deps/jsr.io/@levischuck/tiny-cbor/**/index.js" with "@levischuck/tiny-cbor"
    function listFilesRecursive(dir: string): string[] {
      const files: string[] = [];
      const entries = Deno.readDirSync(dir);

      for (const entry of entries) {
        const fullPath = `${dir}/${entry.name}`;
        if (entry.isDirectory) {
          files.push(...listFilesRecursive(fullPath));
        } else {
          files.push(fullPath);
        }
      }

      return files;
    }

    const esmFiles = listFilesRecursive("npm/esm");
    const scriptFiles = listFilesRecursive("npm/script");
    const srcFiles = listFilesRecursive("npm/src");
    const allFiles = [...esmFiles, ...scriptFiles, ...srcFiles];

    // Filter for JS files and replace imports
    const jsFiles = allFiles.filter((file) =>
      file.endsWith(".js") || file.endsWith(".d.ts") || file.endsWith(".ts")
    );

    for (const file of jsFiles) {
      const content = Deno.readTextFileSync(file);
      let updatedContent = content.replace(
        /(\.\.\/)+deps\/jsr\.io\/@levischuck\/tiny-cbor\/[^\/]+\/index\.js/g,
        "@levischuck/tiny-cbor",
      );
      updatedContent = updatedContent.replace(
        /(\.\.\/)+deps\/jsr\.io\/@levischuck\/tiny-encodings\/[^\/]+\/index\.js/g,
        "@levischuck/tiny-encodings",
      );
      if (updatedContent !== content) {
        Deno.writeTextFileSync(file, updatedContent);
      }
    }
    // Finally see if any folders in deps are empty and remove them recursively depth first
    function removeEmptyDirsRecursive(dir: string): void {
      try {
        const entries = Deno.readDirSync(dir);
        const entryArray = Array.from(entries);

        // First, recursively process all subdirectories
        for (const entry of entryArray) {
          if (entry.isDirectory) {
            const subDir = `${dir}/${entry.name}`;
            removeEmptyDirsRecursive(subDir);
          }
        }

        // After processing subdirectories, check if current directory is empty
        const updatedEntries = Array.from(Deno.readDirSync(dir));
        if (updatedEntries.length === 0) {
          // Directory is empty, remove it
          Deno.removeSync(dir);
        }
      } catch (_error) {
        // Directory might not exist or we don't have permission, skip it
        return;
      }
    }
    removeEmptyDirsRecursive("npm/esm/deps");
    removeEmptyDirsRecursive("npm/script/deps");
    removeEmptyDirsRecursive("npm/src/deps");

    // Lastly, update all src imports that end in .js to use no extension
    for (const file of srcFiles) {
      if (!file.endsWith(".ts")) {
        continue;
      }
      console.log(`Updating ${file}`);
      const content = Deno.readTextFileSync(file);
      const updatedContent = content.replace(/\.js('|")/g, ".ts$1");
      Deno.writeTextFileSync(file, updatedContent);
    }
  },
});
