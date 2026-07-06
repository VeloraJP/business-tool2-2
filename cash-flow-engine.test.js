import assert from "node:assert/strict";
import test from "node:test";
import {
  BS_FIELDS,
  COMMON_FIELDS,
  MANAGEMENT_FIELDS,
  PL_FIELDS
} from "../../assets/js/data/company-fields.js";

function ids(fields) {
  return fields.map(({ id }) => id);
}

test("会社情報の正式ID件数と連番が一致する", () => {
  assert.deepEqual(ids(COMMON_FIELDS), ["CM001", "CM002"]);
  assert.deepEqual(ids(PL_FIELDS), Array.from({ length: 25 }, (_, i) => `PL${String(i + 1).padStart(3, "0")}`));
  assert.deepEqual(ids(BS_FIELDS), Array.from({ length: 27 }, (_, i) => `BS${String(i + 1).padStart(3, "0")}`));
  assert.deepEqual(ids(MANAGEMENT_FIELDS), Array.from({ length: 16 }, (_, i) => `MG${String(i + 1).padStart(3, "0")}`));
});

test("PLとBSのAUTO可項目が凍結仕様と一致する", () => {
  assert.deepEqual(
    PL_FIELDS.filter(({ auto }) => auto).map(({ id }) => id),
    ["PL003", "PL007", "PL016", "PL017", "PL020", "PL023", "PL025"]
  );
  assert.deepEqual(
    BS_FIELDS.filter(({ auto }) => auto).map(({ id }) => id),
    ["BS005", "BS011", "BS012", "BS018", "BS021", "BS022", "BS026", "BS027"]
  );
});

test("PL009はPL008の内数として定義される", () => {
  const pl009 = PL_FIELDS.find(({ id }) => id === "PL009");
  assert.equal(pl009.includedIn, "PL008");
});

