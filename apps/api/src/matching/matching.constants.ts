export const matchWeights = {
  tags: 30,
  location: 20,
  schedule: 15,
  budget: 10,
  activity: 5,
  trust: 10,
  preference: 10,
} as const;

export type MatchFactor =
  | "tags"
  | "location"
  | "schedule"
  | "budget"
  | "activity"
  | "trust"
  | "preference";
