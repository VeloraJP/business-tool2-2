export class CategoryNavigationController {
  constructor() {
    this.pendingReturn = null;
  }

  remember({ categoryHash, sectionId = "results", scrollY = 0, field = null }) {
    this.pendingReturn = { categoryHash, sectionId, scrollY, field };
  }

  consume() {
    const pending = this.pendingReturn;
    this.pendingReturn = null;
    return pending;
  }

  peek() {
    return this.pendingReturn;
  }

  hasPendingReturn() {
    return this.pendingReturn !== null;
  }
}
