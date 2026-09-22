import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
    state: () => ({
        navbarStyle: 'transparent',
        theme: 'light',
        isAppLoading: false,
        loadingMessage: '',
        isNavigating: false,
        _navTimer: null,
    }),

    actions: {
        setNavbarStyle(style) {
            this.navbarStyle = style;
        },
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
        },
        setLoading(status, message = '') {
            this.isAppLoading = status;
            this.loadingMessage = message;
        },
        startNavigation() {
            if (this._navTimer) {
                clearTimeout(this._navTimer);
                this._navTimer = null;
            }
            this.isNavigating = true;
        },
        endNavigation() {
            if (this._navTimer) {
                clearTimeout(this._navTimer);
                this._navTimer = null;
            }
            // Garantiza que la barra sea visible incluso en transiciones de ruta instantáneas
            this._navTimer = setTimeout(() => {
                this.isNavigating = false;
                this._navTimer = null;
            }, 120);
        }
    }
});