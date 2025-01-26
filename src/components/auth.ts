import { defineStore } from "pinia";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null') as { username: string } | null,
    isLoggedIn: !!localStorage.getItem('user'),
  }),
  actions: {
    login(user: { username: string }) {
      this.user = user;
      this.isLoggedIn = true;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout() {
      this.user = null;
      this.isLoggedIn = false;
      localStorage.removeItem('user');
    }
  }
});
