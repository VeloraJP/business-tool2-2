function clone(value) {
  return structuredClone(value);
}

export class CategoryState {
  constructor() {
    this.categories = {};
  }

  ensure(categoryId) {
    if (!this.categories[categoryId]) {
      this.categories[categoryId] = {
        inputs: {},
        costClassifications: {},
        sectionId: "choose",
        innerTabId: null,
        scrollY: 0,
        accordionState: {},
        engineResults: {},
        hasCalculated: false,
        messages: { errors: [], warnings: [], missingFields: [] }
      };
    }
    return this.categories[categoryId];
  }

  setInput(categoryId, field, value) {
    this.ensure(categoryId).inputs[field] = value;
  }

  setCostClassification(categoryId, field, value) {
    this.ensure(categoryId).costClassifications[field] = value;
  }

  setSection(categoryId, sectionId) {
    const state = this.ensure(categoryId);
    state.sectionId = sectionId;
    state.hasCalculated = false;
  }

  setResults(categoryId, engineResults, messages) {
    const state = this.ensure(categoryId);
    state.engineResults = clone(engineResults);
    state.messages = clone(messages);
  }

  markCalculated(categoryId) {
    this.ensure(categoryId).hasCalculated = true;
  }

  snapshot(categoryId) {
    return clone(this.ensure(categoryId));
  }
}
