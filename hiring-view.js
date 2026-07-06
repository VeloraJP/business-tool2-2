import { PHASE5_ROUTE_SET, ROUTES } from "../config/routes.js";

export function normalizePhase4Hash(hash) {
  return PHASE5_ROUTE_SET.has(hash) ? hash : ROUTES.HOME;
}

export const normalizePhase5Hash = normalizePhase4Hash;

export class HashRouter {
  constructor({ browserWindow = window, onRoute }) {
    this.browserWindow = browserWindow;
    this.onRoute = onRoute;
    this.handleChange = this.handleChange.bind(this);
  }

  current() {
    return normalizePhase4Hash(this.browserWindow.location.hash);
  }

  start() {
    this.browserWindow.addEventListener("hashchange", this.handleChange);
    if (this.browserWindow.location.hash !== this.current()) {
      this.browserWindow.location.replace(this.current());
      return;
    }
    this.handleChange();
  }

  stop() {
    this.browserWindow.removeEventListener("hashchange", this.handleChange);
  }

  navigate(hash) {
    this.browserWindow.location.hash = normalizePhase4Hash(hash);
  }

  handleChange() {
    const route = this.current();
    if (this.browserWindow.location.hash !== route) {
      this.browserWindow.location.replace(route);
      return;
    }
    this.onRoute(route);
  }
}
