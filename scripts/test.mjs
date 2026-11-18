import { startVitest } from 'vitest/node';
import ts from 'typescript';

const isAndroidStorage = process.platform === 'android';

function androidTsxPlugin() {
  return {
    name: 'android-tsx-transpile',
    enforce: 'pre',
    transform(code, id) {
      const cleanId = id.split('?')[0];
      if (!/\.[cm]?tsx?$/.test(cleanId)) return null;
      const out = ts.transpileModule(code, {
        fileName: cleanId,
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.ReactJSX,
          sourceMap: false,
        },
      });
      return { code: out.outputText, map: null };
    },
  };
}

const watch = process.argv.includes('--watch');

const ctx = await startVitest(
  'test',
  [],
  {
    watch,
    run: !watch,
    include: ['src/tests/**/*.test.{ts,tsx}'],
  },
  isAndroidStorage
    ? {
        configFile: false,
        esbuild: false,
        plugins: [androidTsxPlugin()],
      }
    : {}
);

if (!ctx) {
  process.exit(1);
}

const failed = ctx.state.getFiles().some((f) => f.result?.state === 'fail');
await ctx.close();
process.exit(failed ? 1 : 0);
