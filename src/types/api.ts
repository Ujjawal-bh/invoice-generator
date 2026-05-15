export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: FieldErrors };
