export class MemoryStorage {
  constructor(initialEntries = {}) {
    this.values = new Map(
      Object.entries(initialEntries).map(([key, value]) => [key, String(value)])
    );
    this.failOnGet = null;
    this.failOnSet = null;
    this.failOnRemove = null;
  }

  get length() {
    return this.values.size;
  }

  getItem(key) {
    if (this.failOnGet) {
      throw this.failOnGet;
    }

    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    if (this.failOnSet) {
      throw this.failOnSet;
    }

    this.values.set(key, String(value));
  }

  removeItem(key) {
    if (this.failOnRemove) {
      throw this.failOnRemove;
    }

    this.values.delete(key);
  }

  clear() {
    this.values.clear();
  }
}

