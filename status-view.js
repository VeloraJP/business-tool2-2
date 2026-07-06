import {
  LEGACY_DATA_STATES,
  REPOSITORY_STATUS
} from "../config/constants.js";
import { createPersistentData } from "../data/schema.js";
import { detectLegacyData } from "../storage/legacy-detector.js";

function cloneJsonData(value) {
  return JSON.parse(JSON.stringify(value));
}

export class CompanyDataStore {
  constructor({ repository, storage, now = () => new Date().toISOString() }) {
    if (!repository || !storage) {
      throw new TypeError("repositoryとstorageは必須です。");
    }

    this.repository = repository;
    this.storage = storage;
    this.now = now;
    this.persistentData = null;
    this.sessionState = {};
  }

  initialize() {
    const legacyState = detectLegacyData(this.storage);

    if (legacyState === LEGACY_DATA_STATES.LEGACY_REQUIRES_CONFIRMATION) {
      this.persistentData = null;
      return {
        legacyState,
        repositoryStatus: REPOSITORY_STATUS.EMPTY,
        data: null
      };
    }

    const loaded = this.repository.load();
    this.persistentData =
      loaded.status === REPOSITORY_STATUS.LOADED
        ? loaded.data
        : createPersistentData({ now: this.now });

    return {
      legacyState,
      repositoryStatus: loaded.status,
      data: this.getPersistentSnapshot()
    };
  }

  getPersistentSnapshot() {
    return this.persistentData === null
      ? null
      : cloneJsonData(this.persistentData);
  }

  replacePersistentData(data) {
    this.persistentData = cloneJsonData(data);
  }

  savePersistentData() {
    if (this.persistentData === null) {
      throw new Error("保存対象の正式データがありません。");
    }

    this.persistentData = this.repository.save(this.persistentData);
    return this.getPersistentSnapshot();
  }

  commitPersistentData(data) {
    const candidate = cloneJsonData(data);
    const saved = this.repository.save(candidate);
    this.persistentData = cloneJsonData(saved);
    return this.getPersistentSnapshot();
  }

  setSessionValue(key, value) {
    this.sessionState[key] = value;
  }

  getSessionSnapshot() {
    return { ...this.sessionState };
  }
}
