export function percentInputToRate(value) {
  if (value === null || value === undefined || value === "") return { value: null, errors: [] };
  const number = Number(value);
  if (!Number.isFinite(number)) return { value: null, errors: [{ field: "rate", code: "INVALID_NUMBER", message: "有限の率を入力してください。" }] };
  if (number < 0 || number > 100) return { value: null, errors: [{ field: "rate", code: "RATE_OUT_OF_RANGE", message: "率は0%から100%で入力してください。" }] };
  return { value: number / 100, errors: [] };
}

export function rateToPercentInput(value) {
  if (value === null || value === undefined || value === "") return { value: "", errors: [] };
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1) return { value: "", errors: [{ field: "rate", code: "RATE_OUT_OF_RANGE", message: "内部率が0から1の範囲外です。" }] };
  return { value: number * 100, errors: [] };
}
