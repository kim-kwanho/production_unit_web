import type { LogLevel, ProcessMessage } from "./types";

export function processMsg(text: string, level: LogLevel): ProcessMessage {
  return { text, level };
}
