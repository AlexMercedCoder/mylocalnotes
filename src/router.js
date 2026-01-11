export class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentParams = {};
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    // Handle initial load
    this.handleRoute();
  }

  navigateTo(path) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    
    // Find matching route
    for (const [pattern, handler] of Object.entries(this.routes)) {
      const match = this.matchRoute(pattern, hash);
      if (match) {
        this.currentParams = match;
        handler(match);
        return;
      }
    }
    
    // Default/404 handling (could redirect to /)
    console.warn(`No route matches: ${hash}`);
    if (hash !== '/') this.navigateTo('/');
  }

  matchRoute(pattern, path) {
    // Simple regex matcher for :param
    const regexPattern = pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)');
    const regex = new RegExp(`^${regexPattern}$`);
    const result = path.match(regex);
    
    return result ? result.groups : null;
  }
}
