// AI teacher client using Claude API with streaming

import Anthropic from '@anthropic-ai/sdk';
import { buildTeacherPrompt, getFAQAnswer } from './promptBuilders';
import type { TeacherContext } from './promptBuilders';

let _client: Anthropic | null = null;

function getClient(): Anthropic | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const key = (import.meta as any).env?.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!key) return null;
  if (!_client) _client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
  return _client;
}

export type StreamCallback = (token: string) => void;
export type DoneCallback = (full: string) => void;

export interface AskTeacherOptions {
  onToken?: StreamCallback;
  onDone?: DoneCallback;
  onError?: (err: Error) => void;
}

/**
 * Ask the AI teacher. Falls back to FAQ first, then calls Claude API.
 * Returns the full response string (resolves after streaming completes).
 */
export async function askTeacher(
  ctx: TeacherContext,
  opts: AskTeacherOptions = {},
): Promise<string> {
  // FAQ shortcut — no API call needed
  const faq = getFAQAnswer(ctx.userQuestion);
  if (faq) {
    opts.onToken?.(faq);
    opts.onDone?.(faq);
    return faq;
  }

  const client = getClient();
  if (!client) {
    const msg = 'AI先生は現在オフラインです。環境変数 VITE_ANTHROPIC_API_KEY を設定してください。';
    opts.onToken?.(msg);
    opts.onDone?.(msg);
    return msg;
  }

  const systemPrompt = buildTeacherPrompt(ctx);
  let full = '';

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      thinking: { type: 'adaptive' },
      system: systemPrompt,
      messages: [{ role: 'user', content: ctx.userQuestion }],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        full += event.delta.text;
        opts.onToken?.(event.delta.text);
      }
    }

    opts.onDone?.(full);
    return full;
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    opts.onError?.(e);
    throw e;
  }
}
