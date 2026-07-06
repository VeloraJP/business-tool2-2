export const INPUT_SOURCE_TYPES = Object.freeze({
  SCREEN_MANUAL: "SCREEN_MANUAL",
  SAVED_MANUAL: "SAVED_MANUAL",
  SAVED_AUTO: "SAVED_AUTO",
  DERIVED_SOURCE: "DERIVED_SOURCE",
  MISSING: "MISSING"
});

export const INPUT_RESOLUTION_CODES = Object.freeze({
  MODE_SOURCE_MISMATCH: "MODE_SOURCE_MISMATCH"
});

const SOURCE_ORDER = Object.freeze([
  ["screenManual", INPUT_SOURCE_TYPES.SCREEN_MANUAL],
  ["savedManual", INPUT_SOURCE_TYPES.SAVED_MANUAL],
  ["savedAuto", INPUT_SOURCE_TYPES.SAVED_AUTO],
  ["derived", INPUT_SOURCE_TYPES.DERIVED_SOURCE]
]);

export function isBlankInput(value) {
  return value === null || value === undefined || value === "";
}

function unwrapCandidate(candidate) {
  if (
    candidate &&
    typeof candidate === "object" &&
    !Array.isArray(candidate) &&
    Object.hasOwn(candidate, "value")
  ) {
    return {
      value: candidate.value,
      mode: candidate.mode ?? null,
      sourceDetail: candidate.source ?? null
    };
  }
  return { value: candidate, mode: null, sourceDetail: null };
}

function expectedMode(collectionName) {
  if (collectionName === "savedManual") return "MANUAL";
  if (collectionName === "savedAuto") return "AUTO";
  return null;
}

export function resolveInput(fieldOrAliases, context = {}) {
  const aliases = Array.isArray(fieldOrAliases) ? fieldOrAliases : [fieldOrAliases];
  for (const [collectionName, sourceType] of SOURCE_ORDER) {
    const collection = context[collectionName] ?? {};
    for (const field of aliases) {
      if (!Object.hasOwn(collection, field)) continue;
      const { value, mode, sourceDetail } = unwrapCandidate(collection[field]);
      if (isBlankInput(value)) continue;
      const requiredMode = expectedMode(collectionName);
      if (mode !== null && requiredMode !== null && mode !== requiredMode) {
        return {
          field,
          value,
          missing: false,
          invalid: true,
          resolutionErrors: [{
            field,
            code: INPUT_RESOLUTION_CODES.MODE_SOURCE_MISMATCH,
            message: `${field}のmodeと入力元が一致しません。`
          }],
          source: { type: sourceType, field, detail: sourceDetail }
        };
      }
      return {
        field,
        value,
        missing: false,
        invalid: false,
        resolutionErrors: [],
        source: { type: sourceType, field, detail: sourceDetail }
      };
    }
  }
  return {
    field: aliases[0],
    value: null,
    missing: true,
    invalid: false,
    resolutionErrors: [],
    source: { type: INPUT_SOURCE_TYPES.MISSING, field: aliases[0], detail: null }
  };
}

export function resolveInputs(context, definitions) {
  return Object.fromEntries(
    Object.entries(definitions).map(([name, aliases]) => [
      name,
      resolveInput(aliases, context)
    ])
  );
}

export function resolvedValues(resolved) {
  return Object.fromEntries(
    Object.entries(resolved).map(([name, input]) => [name, input.value])
  );
}

export function resolveContextList(context, listName, valueName) {
  if (Array.isArray(context?.[listName]) && context[listName].length > 0) {
    return context[listName];
  }
  const singular = context?.[valueName] ?? context?.derived?.[valueName] ?? null;
  return [singular];
}
