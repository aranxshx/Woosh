import { type EvaluationLevel, type ItemWithProgress } from "@/types/models";

export function pickNextItem(items: ItemWithProgress[], now = Date.now()) {
  if (items.length === 0) {
    return null;
  }

  const dueItems = items.filter((item) => {
    const due = item.progress.nextDue ? Date.parse(item.progress.nextDue) : 0;
    return due <= now;
  });

  if (dueItems.length > 0) {
    const randomIndex = Math.floor(Math.random() * dueItems.length);
    return dueItems[randomIndex];
  }

  return items.reduce<ItemWithProgress | null>((earliest, item) => {
    const due = item.progress.nextDue ? Date.parse(item.progress.nextDue) : Infinity;
    if (!earliest) {
      return item;
    }
    const earliestDue = earliest.progress.nextDue
      ? Date.parse(earliest.progress.nextDue)
      : Infinity;
    return due < earliestDue ? item : earliest;
  }, null);
}

export function applyEvaluation(
  item: ItemWithProgress,
  level: EvaluationLevel,
  now = Date.now()
) {
  const progress = { ...item.progress };

  progress.lastSeen = new Date(now).toISOString();
  progress.lastResult = level;
  progress.timesSeen = (progress.timesSeen ?? 0) + 1;

  if (level === "easy") {
    progress.easyCount = (progress.easyCount ?? 0) + 1;
  } else if (level === "medium") {
    progress.mediumCount = (progress.mediumCount ?? 0) + 1;
  } else if (level === "hard") {
    progress.hardCount = (progress.hardCount ?? 0) + 1;
  }

  let deltaMs: number;
  let queueOffset: number;

  switch (level) {
    case "hard":
      deltaMs = 1 * 60 * 1000;
      queueOffset = Math.floor(Math.random() * 3) + 2;
      break;
    case "medium":
      deltaMs = 15 * 60 * 1000;
      queueOffset = Math.floor(Math.random() * 5) + 6;
      break;
    case "easy":
      deltaMs = 60 * 60 * 1000;
      queueOffset = Math.floor(Math.random() * 9) + 12;
      break;
    default:
      deltaMs = 15 * 60 * 1000;
      queueOffset = 8;
  }

  progress.nextDue = new Date(now + deltaMs).toISOString();

  return {
    progress,
    queueOffset,
  };
}
