// Past exam seeds — 論点抽出・改題ベースの問題設計
// 原文転載を避け、論点と問い構造のみ保持

import type { TopicTag, Difficulty } from './problemSchema';

export type RewritePolicy = 'concept-only' | 'full-rewrite' | 'analog';

export interface PastExamSeed {
  id: string;
  year: number;
  sourceKind: '共通テスト' | '情報I模試' | '大学入試' | '教科書準拠';
  topic: TopicTag;
  difficulty: Difficulty;
  rewritePolicy: RewritePolicy;
  coreConcept: string;   // 抽出した論点
  note?: string;
}

export const PAST_EXAM_SEEDS: PastExamSeed[] = [
  // 変数・代入
  {
    id: 'seed-001', year: 2023, sourceKind: '共通テスト',
    topic: 'variables', difficulty: 'basic', rewritePolicy: 'full-rewrite',
    coreConcept: '変数への代入と参照、変数の値の更新',
  },
  {
    id: 'seed-002', year: 2023, sourceKind: '共通テスト',
    topic: 'operators', difficulty: 'basic', rewritePolicy: 'full-rewrite',
    coreConcept: '算術演算子の優先順位、整数除算と剰余',
  },
  // 分岐
  {
    id: 'seed-010', year: 2022, sourceKind: '情報I模試',
    topic: 'branch', difficulty: 'basic', rewritePolicy: 'full-rewrite',
    coreConcept: 'if/else による条件分岐の理解',
  },
  {
    id: 'seed-011', year: 2023, sourceKind: '共通テスト',
    topic: 'branch', difficulty: 'standard', rewritePolicy: 'concept-only',
    coreConcept: 'elif を含む多段分岐の実行フロー',
  },
  // ループ
  {
    id: 'seed-020', year: 2022, sourceKind: '共通テスト',
    topic: 'loop', difficulty: 'basic', rewritePolicy: 'full-rewrite',
    coreConcept: 'for-range ループの反復回数と変数の変化',
  },
  {
    id: 'seed-021', year: 2023, sourceKind: '情報I模試',
    topic: 'loop', difficulty: 'standard', rewritePolicy: 'full-rewrite',
    coreConcept: 'while ループと条件式の設計',
  },
  // リスト
  {
    id: 'seed-030', year: 2023, sourceKind: '共通テスト',
    topic: 'list', difficulty: 'standard', rewritePolicy: 'full-rewrite',
    coreConcept: 'リストのインデックス参照と要素の更新',
  },
  {
    id: 'seed-031', year: 2022, sourceKind: '教科書準拠',
    topic: 'list', difficulty: 'standard', rewritePolicy: 'analog',
    coreConcept: 'ループと組み合わせたリスト操作',
  },
  // 関数
  {
    id: 'seed-040', year: 2023, sourceKind: '共通テスト',
    topic: 'function', difficulty: 'standard', rewritePolicy: 'full-rewrite',
    coreConcept: '関数の定義・引数・戻り値',
  },
  {
    id: 'seed-041', year: 2023, sourceKind: '情報I模試',
    topic: 'function', difficulty: 'advanced', rewritePolicy: 'concept-only',
    coreConcept: '再帰的でない関数の呼び出しスタックの追跡',
  },
  // アルゴリズム
  {
    id: 'seed-050', year: 2022, sourceKind: '共通テスト',
    topic: 'algorithm-search', difficulty: 'standard', rewritePolicy: 'full-rewrite',
    coreConcept: '線形探索の比較回数と計算量',
  },
  {
    id: 'seed-051', year: 2023, sourceKind: '共通テスト',
    topic: 'algorithm-search', difficulty: 'advanced', rewritePolicy: 'full-rewrite',
    coreConcept: '二分探索の仕組みと前提条件',
  },
  {
    id: 'seed-060', year: 2023, sourceKind: '共通テスト',
    topic: 'algorithm-sort', difficulty: 'advanced', rewritePolicy: 'full-rewrite',
    coreConcept: '選択ソートの交換回数とトレース',
  },
  // 数値誤差
  {
    id: 'seed-070', year: 2023, sourceKind: '共通テスト',
    topic: 'numeric-error', difficulty: 'basic', rewritePolicy: 'full-rewrite',
    coreConcept: '浮動小数点誤差の発生と回避策',
  },
];
