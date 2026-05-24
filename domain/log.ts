import type { LogEntry, LogLevel, ProcessMessage } from "./types";

export function createLogEntry(
  text: string,
  level: LogLevel = "info",
  time?: string,
): LogEntry {
  return {
    time: time ?? new Date().toLocaleTimeString("ko-KR"),
    level,
    text,
  };
}

export function logFromProcess(messages: ProcessMessage[]): LogEntry[] {
  return messages.map((m) => createLogEntry(m.text.trim(), m.level));
}
