type OnboardingEventType = "view" | "advance" | "complete" | "skip";

interface OnboardingEvent {
  step: number;
  type: OnboardingEventType;
  timestamp: string;
}

const STORAGE_KEY = "ecosera:onboarding:events";

function readEvents(): OnboardingEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is OnboardingEvent =>
        typeof item === "object" &&
        item !== null &&
        typeof item.step === "number" &&
        typeof item.type === "string" &&
        typeof item.timestamp === "string"
    );
  } catch {
    return [];
  }
}

function writeEvents(events: OnboardingEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    /* silently ignore */
  }
}

function pushEvent(step: number, type: OnboardingEventType) {
  const events = readEvents();
  const next: OnboardingEvent = {
    step,
    type,
    timestamp: new Date().toISOString(),
  };
  events.push(next);
  writeEvents(events);
}

export function recordOnboardingStepView(step: number) {
  pushEvent(step, "view");
}

export function recordOnboardingStepAdvance(step: number) {
  pushEvent(step, "advance");
}

export function recordOnboardingComplete(step: number) {
  pushEvent(step, "complete");
}

export function recordOnboardingSkip(step: number) {
  pushEvent(step, "skip");
}

export function getOnboardingDropOffMap() {
  const events = readEvents();
  return events.reduce<Record<number, { views: number; advances: number; skips: number; completes: number }>>(
    (acc, event) => {
      const bucket = acc[event.step] ?? { views: 0, advances: 0, skips: 0, completes: 0 };
      switch (event.type) {
        case "view":
          bucket.views += 1;
          break;
        case "advance":
          bucket.advances += 1;
          break;
        case "skip":
          bucket.skips += 1;
          break;
        case "complete":
          bucket.completes += 1;
          break;
      }
      acc[event.step] = bucket;
      return acc;
    },
    {}
  );
}
