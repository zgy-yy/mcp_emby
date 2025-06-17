import * as esbuild from 'esbuild';
import { readdirSync } from 'fs';
import { join } from 'path';

// 获取 server 目录下的所有 .ts 文件
const serverFiles = readdirSync('server')
  .filter(file => file.endsWith('.ts'))
  .map(file => join('server', file));

// 构建配置
const buildOptions = {
  entryPoints: serverFiles,
  bundle: true,
  outdir: 'dist_server',
  platform: 'node',
  target: 'node20',
  format: 'esm',
  minify: true,
  sourcemap: true,
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);'
  },
  external: [
    // Node.js 内置模块（带 node: 前缀）
    'node:fs',
    'node:path',
    'node:crypto',
    'node:http',
    'node:https',
    'node:url',
    'node:stream',
    'node:buffer',
    'node:util',
    'node:os',
    'node:net',
    'node:tls',
    'node:zlib',
    'node:events',
    'node:assert',
    'node:constants',
    'node:querystring',
    'node:punycode',
    'node:vm',
    'node:child_process',
    'node:cluster',
    'node:dgram',
    'node:dns',
    'node:domain',
    'node:module',
    'node:readline',
    'node:repl',
    'node:tty',
    'node:worker_threads',
    // Node.js 内置模块（不带前缀）
    'fs',
    'path',
    'crypto',
    'http',
    'https',
    'url',
    'stream',
    'buffer',
    'util',
    'os',
    'net',
    'tls',
    'zlib',
    'events',
    'assert',
    'constants',
    'querystring',
    'punycode',
    'vm',
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'domain',
    'module',
    'readline',
    'repl',
    'tty',
    'worker_threads'
  ]
};

// 执行构建
esbuild.build(buildOptions).catch(() => process.exit(1)); 