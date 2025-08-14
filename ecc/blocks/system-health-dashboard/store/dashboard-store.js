/* eslint-disable max-len */
// Simple state management for dashboard

export class DashboardStore {
  constructor() {
    this.state = {
      data: null,
      viewMode: 'score',
      timeRange: '7d',
      loading: false,
      error: null,
    };
    this.listeners = new Set();
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners of state change
  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // Update state and notify listeners
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  // Actions
  setData(data) {
    this.setState({ data, loading: false, error: null });
  }

  setViewMode(viewMode) {
    this.setState({ viewMode });
  }

  setTimeRange(timeRange) {
    this.setState({ timeRange });
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  setError(error) {
    this.setState({ error, loading: false });
  }

  // Getters
  getState() {
    return this.state;
  }

  getData() {
    return this.state.data;
  }

  getViewMode() {
    return this.state.viewMode;
  }

  getTimeRange() {
    return this.state.timeRange;
  }

  isLoading() {
    return this.state.loading;
  }

  getError() {
    return this.state.error;
  }
}

// Singleton instance
export const dashboardStore = new DashboardStore();
