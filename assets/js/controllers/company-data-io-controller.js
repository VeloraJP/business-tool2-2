import { exportPersistentData, importPersistentData } from "../storage/import-export.js";

export class CompanyDataIOController {
  constructor({ store, companyController }) {
    this.store = store;
    this.companyController = companyController;
  }

  exportJson() {
    return exportPersistentData(this.store.getPersistentSnapshot());
  }

  importJson(text, byteLength) {
    const saved = importPersistentData({ text, byteLength, repository: this.store.repository });
    this.companyController.replaceFromImport(saved);
    return saved;
  }
}
