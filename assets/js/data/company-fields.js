const NEGATIVE_POLICY = Object.freeze({
  ALLOW: "ALLOW",
  DENY: "DENY",
  UNSPECIFIED: "UNSPECIFIED"
});

function field(id, label, kind, options = {}) {
  return Object.freeze({
    id,
    label,
    kind,
    auto: false,
    negativePolicy: NEGATIVE_POLICY.UNSPECIFIED,
    ...options
  });
}

export const COMMON_FIELDS = Object.freeze([
  field("CM001", "税区分", "taxAccountingBasis"),
  field("CM002", "金額入力単位", "amountInputUnit")
]);

export const PL_FIELDS = Object.freeze([
  field("PL001", "売上高", "amount", { negativePolicy: NEGATIVE_POLICY.DENY }),
  field("PL002", "売上原価", "amount"),
  field("PL003", "売上総利益", "amount", { auto: true, negativePolicy: NEGATIVE_POLICY.ALLOW }),
  field("PL004", "役員報酬", "amount"),
  field("PL005", "給与手当", "amount"),
  field("PL006", "法定福利費", "amount"),
  field("PL007", "人件費合計", "amount", { auto: true }),
  field("PL008", "地代家賃", "amount"),
  field("PL009", "地代家賃うち非課税分", "amount", { includedIn: "PL008" }),
  field("PL010", "水道光熱費", "amount"),
  field("PL011", "広告宣伝費", "amount"),
  field("PL012", "支払手数料", "amount"),
  field("PL013", "減価償却費", "amount"),
  field("PL014", "その他固定費", "amount"),
  field("PL015", "その他変動費", "amount"),
  field("PL016", "販売費及び一般管理費合計", "amount", { auto: true }),
  field("PL017", "営業利益", "amount", { auto: true, negativePolicy: NEGATIVE_POLICY.ALLOW }),
  field("PL018", "営業外収益", "amount"),
  field("PL019", "営業外費用", "amount"),
  field("PL020", "経常利益", "amount", { auto: true, negativePolicy: NEGATIVE_POLICY.ALLOW }),
  field("PL021", "特別利益", "amount"),
  field("PL022", "特別損失", "amount"),
  field("PL023", "税引前当期純利益", "amount", { auto: true, negativePolicy: NEGATIVE_POLICY.ALLOW }),
  field("PL024", "法人税等", "amount"),
  field("PL025", "当期純利益", "amount", { auto: true, negativePolicy: NEGATIVE_POLICY.ALLOW })
]);

export const BS_FIELDS = Object.freeze([
  field("BS001", "現預金", "amount"),
  field("BS002", "売掛金", "amount"),
  field("BS003", "棚卸資産", "amount"),
  field("BS004", "その他流動資産", "amount"),
  field("BS005", "流動資産合計", "amount", { auto: true }),
  field("BS006", "建物", "amount"),
  field("BS007", "土地", "amount"),
  field("BS008", "車両運搬具", "amount"),
  field("BS009", "工具器具備品", "amount"),
  field("BS010", "その他固定資産", "amount"),
  field("BS011", "固定資産合計", "amount", { auto: true }),
  field("BS012", "資産合計", "amount", { auto: true }),
  field("BS013", "買掛金", "amount"),
  field("BS014", "短期借入金", "amount"),
  field("BS015", "未払法人税等", "amount"),
  field("BS016", "未払消費税等", "amount"),
  field("BS017", "その他流動負債", "amount"),
  field("BS018", "流動負債合計", "amount", { auto: true }),
  field("BS019", "長期借入金", "amount"),
  field("BS020", "その他固定負債", "amount"),
  field("BS021", "固定負債合計", "amount", { auto: true }),
  field("BS022", "負債合計", "amount", { auto: true }),
  field("BS023", "資本金", "amount"),
  field("BS024", "利益剰余金", "amount"),
  field("BS025", "その他純資産", "amount"),
  field("BS026", "純資産合計", "amount", { auto: true, negativePolicy: NEGATIVE_POLICY.ALLOW }),
  field("BS027", "負債純資産合計", "amount", { auto: true })
]);

export const MANAGEMENT_FIELDS = Object.freeze([
  field("MG001", "従業員数", "integer", { unit: "人", negativePolicy: NEGATIVE_POLICY.DENY }),
  field("MG002", "役員数", "integer", { unit: "人", negativePolicy: NEGATIVE_POLICY.DENY }),
  field("MG003", "営業日数", "integer", { unit: "日", negativePolicy: NEGATIVE_POLICY.DENY }),
  field("MG004", "営業時間", "decimal", { unit: "時間" }),
  field("MG005", "客数", "integer", { unit: "人", negativePolicy: NEGATIVE_POLICY.DENY }),
  field("MG006", "客単価", "amount", { unit: "円" }),
  field("MG007", "販売数量", "integer", { negativePolicy: NEGATIVE_POLICY.DENY }),
  field("MG008", "座席数", "integer", { unit: "席", negativePolicy: NEGATIVE_POLICY.DENY }),
  field("MG009", "回転率", "decimal"),
  field("MG010", "稼働率", "decimal"),
  field("MG011", "契約件数", "integer", { unit: "件", negativePolicy: NEGATIVE_POLICY.DENY }),
  field("MG012", "平均契約単価", "amount", { unit: "円" }),
  field("MG013", "店舗面積", "decimal", { unit: "㎡" }),
  field("MG014", "共益費", "amount", { unit: "円" }),
  field("MG015", "目標営業利益", "amount", { unit: "円", negativePolicy: NEGATIVE_POLICY.ALLOW }),
  field("MG016", "目標売上高", "amount", { unit: "円", negativePolicy: NEGATIVE_POLICY.DENY })
]);

export const FIELD_COLLECTIONS = Object.freeze({
  pl: PL_FIELDS,
  bs: BS_FIELDS,
  managementInfo: MANAGEMENT_FIELDS
});

export { NEGATIVE_POLICY };

