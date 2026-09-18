/** Moves `id` to the front of a most-recent-first list, capped at `max`. */
export function pushRecent(ids: readonly string[], id: string, max = 12): string[] {
  return [id, ...ids.filter((x) => x !== id)].slice(0, max);
}
