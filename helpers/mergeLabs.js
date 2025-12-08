// helpers/mergeLabs.js

function extractLabNumber(slot) {
  const m = slot.match(/^L(\d+)$/);
  return m ? parseInt(m[1]) : null;
}

export function mergeLabBlocks(events) {
  if (!events || !events.length) return [];

  const merged = [];
  let i = 0;

  while (i < events.length) {
    const current = events[i];
    const currentNum = extractLabNumber(current.slot);

    // if not LAB, push and continue
    if (currentNum === null) {
      merged.push(current);
      i++;
      continue;
    }

    // last lab, can't merge
    if (i === events.length - 1) {
      merged.push(current);
      i++;
      continue;
    }

    const next = events[i + 1];
    const nextNum = extractLabNumber(next.slot);

    // check merge condition:
    const shouldMerge =
      next &&
      nextNum !== null &&
      next.courseCode === current.courseCode && // same subject
      nextNum === currentNum + 1;               // consecutive slot number

    if (shouldMerge) {
      merged.push({
        ...current,
        slot: `${current.slot}+${next.slot}`,
        start: current.start,
        end: next.end,            // merge times
        duration: [current.duration, next.duration],
      });

      i += 2;  // skip next
    } else {
      merged.push(current);
      i++;
    }
  }

  return merged;
}
