const EVENT_IMPACTS: Record<string, number> = {
  REFILL_WATER_BOTTLE: 4,
  TURN_OFF_LIGHTS: 5,
  NO_RUNNING_WATER_BRUSHING: 4,
  USED_COMPOSTABLE: 3,
  NO_AI: 2,
  USED_DISPOSABLE_PLASTIC: -4,
  LEFT_LIGHTS_ON: -5,

  WALKED: 6,
  BIKED: 7,
  DROVE: -6,
  THRIFTED: 4,
  RECYCLED: 4,
  ATE_PLANT_BASED: 5,
  TAP_OFF_WHILE_BRUSHING: 4,
  REFILL_BOTTLE: 4,
  LIGHTS_OFF: 5,
  NO_AI_USAGE: 2,
  COMPOSTABLE_PRODUCT: 3,
  WENT_TO_SUSTAINABLE_EVENT: 4,
};

type EventImpactInput =
  | string
  | {
      kind?: string;
      name?: string;
      title?: string;
      sustainable?: boolean;
    };

function normalizeKey(value?: string): string | null {
  if (!value) return null;
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || null;
}

export function getImpactForEvent(input: EventImpactInput): number {
  if (typeof input === 'string') {
    const key = normalizeKey(input);
    return key ? EVENT_IMPACTS[key] ?? 0 : 0;
  }

  const keyCandidates = [input.kind, input.name, input.title]
    .map(normalizeKey)
    .filter((v): v is string => Boolean(v));

  for (const key of keyCandidates) {
    if (key in EVENT_IMPACTS) return EVENT_IMPACTS[key];
  }

  if (typeof input.sustainable === 'boolean') {
    return input.sustainable ? 3 : -3;
  }

  return 0;
}

export { EVENT_IMPACTS };
