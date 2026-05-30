import type { LogEntry } from "@/domain/types";

export const MAX_LOG_ENTRIES = 80;

/**
 * 고정 크기 원형 큐(Circular Buffer) — O(1) 삽입, O(n) 스냅샷
 *
 * - head : 다음에 덮어쓸 위치 (가장 오래된 항목 자리)
 * - size : 현재 저장된 항목 수
 * - 버퍼가 꽉 찬 뒤에는 가장 오래된 항목을 자동으로 덮어씁니다.
 */
export class CircularLogBuffer<T extends LogEntry> {
  private readonly buf: (T | undefined)[];
  private head = 0;
  private size = 0;

  constructor(private readonly capacity: number = MAX_LOG_ENTRIES) {
    this.buf = new Array(capacity);
  }

  /** 항목 1개 추가 — O(1) */
  push(entry: T): void {
    this.buf[this.head] = entry;
    this.head = (this.head + 1) % this.capacity;
    if (this.size < this.capacity) this.size++;
  }

  /** 여러 항목 일괄 추가 */
  pushAll(entries: T[]): void {
    for (const e of entries) this.push(e);
  }

  /** 오래된 순서대로 정렬된 스냅샷 배열 반환 — O(n) */
  toArray(): T[] {
    if (this.size < this.capacity) {
      return this.buf.slice(0, this.size) as T[];
    }
    const tail = this.buf.slice(this.head) as T[];
    const front = this.buf.slice(0, this.head) as T[];
    return [...tail, ...front];
  }

  /** 버퍼 초기화 */
  clear(): void {
    this.buf.fill(undefined);
    this.head = 0;
    this.size = 0;
  }

  get length(): number {
    return this.size;
  }
}

/** 기존 배열 기반 API 호환 래퍼 */
export function appendLogEntries<T extends LogEntry>(
  prev: T[],
  entries: T[],
): T[] {
  const buf = new CircularLogBuffer<T>(MAX_LOG_ENTRIES);
  buf.pushAll(prev);
  buf.pushAll(entries);
  return buf.toArray();
}
