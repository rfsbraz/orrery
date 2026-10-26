const RTL = /[\p{Script=Arabic}\p{Script=Hebrew}]/u;

/**
 * Put right-to-left words in the order they are seen, for a renderer that lays
 * words out left to right. satori shapes each Arabic or Hebrew word correctly
 * but places the words of a phrase in reading order, so "ألف ليلة" would come
 * out backwards. Reversing each run of RTL words fixes that and leaves
 * everything else where it was.
 */
export function visualOrder(text: string): string {
  const out: string[] = [];
  let run: string[] = [];
  for (const word of text.split(" ")) {
    if (RTL.test(word)) {
      run.push(word);
      continue;
    }
    out.push(...run.reverse(), word);
    run = [];
  }
  out.push(...run.reverse());
  return out.join(" ");
}
