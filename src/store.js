import { StorageService } from './services/storage';
import { CryptoService } from './services/crypto';

class Store {
  constructor() {
    this.state = {
      isAuthenticated: false,
      username: null,
      workspaceId: null,
      currentError: null
    };
    this.listeners = new Set();
  }

  get getState() {
    return { ...this.state };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Initial call
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
  }

  /**
   * Attempt Login
   */
  async login(username, password) {
    try {
      this.setState({ currentError: null });
      const { workspaceId, encryptionKey } = await CryptoService.deriveKeys(username, password);
      
      // Initialize Storage Context
      await StorageService.setContext(workspaceId, encryptionKey);
      
      this.setState({
        isAuthenticated: true,
        username,
        workspaceId
      });
      return true;
    } catch (e) {
      console.error(e);
      this.setState({ currentError: "Login failed. Check console." });
      return false;
    }
  }

  logout() {
    // Reloading is the safest way to clear memory keys
    window.location.reload();
  }
}

export const appStore = new Store();
