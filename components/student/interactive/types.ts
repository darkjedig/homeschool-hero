export type Pair = { key: string; value: string };

/** Emitted by an interactive component when the student completes an attempt. */
export type InteractiveResult = {
  score?: number;
  total?: number;
  detail: string;
  completed: boolean;
};

/** Common props for every interactive block component. */
export type InteractiveProps = {
  data: Pair[];
  onComplete?: (result: InteractiveResult) => void;
};
