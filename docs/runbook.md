# Runbook

## Local Development
- `npm run dev`: Vite dev server を起動
- `npm test`: parser / evaluator / runtime 周辺のテストを実行
- `npm run build`: 本番ビルドを生成

## Runtime Shape
- Monaco editor は `src/ui/MonacoWorkbench.tsx`
- AST parser は `src/lang/*`
- evaluator は `src/runtime/evaluator.ts`
- samples は `src/samples/index.ts` と `samples/*.info1`

## Safety Rules
- `webapi.get_json` は allowlist 経由のみ
- `device.*` は UI で変更可能な mock state に接続
- `while` は最大ステップ数で停止
