// Problem schema for the Jouhou-I practice problem system

export type ProblemType =
  | 'multiple-choice'   // 選択式
  | 'fill-blank'        // 穴埋め
  | 'code-reading'      // コード読解
  | 'predict-output'    // コード実行結果予測
  | 'fix-code';         // 修正問題

export type Difficulty = 'basic' | 'standard' | 'advanced';

export type TopicTag =
  | 'variables'
  | 'operators'
  | 'branch'
  | 'loop'
  | 'list'
  | 'function'
  | 'random'
  | 'algorithm-search'
  | 'algorithm-sort'
  | 'numeric-error'
  | 'webapi'
  | 'device'
  | 'simulation';

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Problem {
  id: string;
  type: ProblemType;
  difficulty: Difficulty;
  topics: TopicTag[];
  title: string;
  statement: string;          // 問題文
  code?: string;              // コード問題の場合
  choices?: Choice[];         // 選択式
  blankAnswers?: string[];    // 穴埋め（正答リスト）
  expectedOutput?: string;    // 実行結果予測
  fixedCode?: string;         // 修正問題の正解コード
  explanation: string;        // 解説
  wrongReasons?: string[];    // 誤答理由
  relatedTopics?: TopicTag[];
  sourceId?: string;          // 元の pastExamSeed の ID
  usesMonaco?: boolean;       // Monaco エディタで解く問題か
}
