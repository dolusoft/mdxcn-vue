import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const scratch = resolve(repo, '../tmp/mdxcn-vue/phase-11b-pack')
const temporary = join(scratch, 'tool-tmp')
mkdirSync(temporary, { recursive: true })
const pnpmCli = process.env.npm_execpath
assert.ok(pnpmCli, 'Run with pnpm release:check')
function run(args, cwd = repo) {
  const native = !/\.[cm]?js$/i.test(pnpmCli)
  const result = spawnSync(
    native ? pnpmCli : process.execPath,
    native ? args : [pnpmCli, ...args],
    {
      cwd,
      encoding: 'utf8',
      timeout: 180_000,
      maxBuffer: 16 * 1024 * 1024,
      env: {
        ...process.env,
        CI: 'true',
        npm_config_cache: join(scratch, 'npm-cache'),
        TEMP: temporary,
        TMP: temporary,
        TMPDIR: temporary,
      },
    },
  )
  process.stdout.write(result.stdout ?? '')
  process.stderr.write(result.stderr ?? '')
  assert.equal(result.status, 0, `${args.join(' ')}: ${result.error ?? 'failed'}`)
  return result.stdout
}

// Folder names are stable repository identities. Public names and versions have
// a single source of truth in each package manifest, including scoped names.
const packages = ['mdxcn-vue', 'mdxcn-markdown'].map((folder) => {
  const directory = join(repo, 'packages', folder)
  return { directory, ...JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')) }
})
run(['--filter', './packages/*', 'build'])
for (const pkg of packages) {
  const tarball = join(
    scratch,
    `${pkg.name.replaceAll('/', '-').replace(/^@/, '')}-${pkg.version}.tgz`,
  )
  run(['pack', '--out', tarball], pkg.directory)
  // Relative archive name: GNU tar (Git Bash on Windows) reads `C:` as a remote host.
  const listing = spawnSync('tar', ['-tzf', basename(tarball)], {
    cwd: dirname(tarball),
    encoding: 'utf8',
  })
  assert.equal(listing.status, 0, listing.stderr)
  const files = listing.stdout
    .trim()
    .split(/\r?\n/)
    .map((path) => path.replace(/^package\//, ''))
    .sort()
  for (const path of ['package.json', 'LICENSE', 'README.md', 'dist/index.js', 'dist/index.d.ts']) {
    assert.ok(files.includes(path), `${pkg.name}: missing ${path}`)
  }
  assert.ok(
    files.every(
      (path) =>
        ['package.json', 'LICENSE', 'README.md'].includes(path) ||
        /^dist\/.*\.(js|d\.ts|css)$/.test(path),
    ),
  )
  if (pkg.sideEffects !== false) {
    for (const path of ['dist/graph.css', 'dist/host.css', 'dist/theme.css'])
      assert.ok(files.includes(path))
  }
  writeFileSync(`${tarball}.files.json`, JSON.stringify(files, null, 2) + '\n')
  console.log(`TARBALL ${pkg.name}: ${files.length} files\n${files.join('\n')}`)
  if (!process.argv.includes('--pack-only')) {
    // Explicit tool versions, no repository devDependency or publication step.
    run([
      'exec',
      'npm',
      'exec',
      '--yes',
      '--package=publint@0.3.25',
      '--',
      'publint',
      tarball,
      '--strict',
    ])
    run([
      'exec',
      'npm',
      'exec',
      '--yes',
      '--package=@arethetypeswrong/cli@0.18.5',
      '--',
      'attw',
      tarball,
      '--profile',
      'esm-only',
      '--no-emoji',
    ])
  }
}
console.log(
  process.argv.includes('--pack-only')
    ? 'RELEASE PACK CHECK PASSED (tool checks not run)'
    : 'RELEASE CHECK PASSED',
)
