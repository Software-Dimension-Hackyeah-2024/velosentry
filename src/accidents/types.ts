
export type AccidentSeverity = "MINOR" | "SERIOUS" | "FATAL"

export type Accident = {
  id: number;
  lat: number;
  long: number;
  severity: AccidentSeverity;
};