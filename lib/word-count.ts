/**
 * Word count for Sinhala or English memorial text.
 * Splits on whitespace / common punctuation; empty tokens ignored.
 */
export function countWords(text: string): number {
  const normalized = text.trim();
  if (!normalized) return 0;

  const tokens = normalized
    .split(/[\s\u00A0.,!?;:"'()[\]{}…/\\|<>+=_\-]+/u)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  return tokens.length;
}

export function totalStatementWords(
  statements: Array<{ body: string }>,
): number {
  return statements.reduce((sum, item) => sum + countWords(item.body), 0);
}
