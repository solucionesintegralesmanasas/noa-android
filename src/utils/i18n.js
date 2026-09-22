/**
 * Internacionalización (i18n)
 * Ubicación: src/utils/i18n.js
 */

import { watch } from "vue";
import { createI18n } from "vue-i18n";
import { logger } from "@utils/logger.js";
import { dateUtils } from "@utils/date.js";

const SUPPORTED_LOCALES = new Set(["es", "en"]);
const DEFAULT_LOCALE = "en";

export let i18n = null;
const localeCache = new Map();

/**
 * Carga los archivos JSON. 
 * Ajustado: Busca los archivos en src/assets/locales/
 */
export async function loadLocale(locale) {
    if (!SUPPORTED_LOCALES.has(locale)) throw new Error(`Locale no soportado: ${locale}`);
    if (localeCache.has(locale)) return localeCache.get(locale);

    try {
        // Vite glob: ajustado a tu estructura real (dentro de assets)
        const modules = import.meta.glob("@assets/locales/*.json");
        const modulePath = `/src/assets/locales/${locale}.json`;

        if (!(modulePath in modules)) throw new Error(`No existe: ${modulePath}`);

        const messages = (await modules[modulePath]()).default;
        localeCache.set(locale, messages);
        return messages;
    } catch (error) {
        logger.error("Error al cargar locale", { locale, error: error.message });
        if (locale !== DEFAULT_LOCALE) return await loadLocale(DEFAULT_LOCALE);
        throw error;
    }
}

/**
 * Instalación en la app
 */
export async function installI18n(app) {
    try {
        const messages = await loadLocale(DEFAULT_LOCALE);

        i18n = createI18n({
            legacy: false,
            locale: DEFAULT_LOCALE,
            fallbackLocale: DEFAULT_LOCALE,
            messages: { [DEFAULT_LOCALE]: messages },
            globalInjection: true,
        });

        app.use(i18n);

        // Sincronización con dateUtils
        watch(i18n.global.locale, (newLocale) => {
            dateUtils.setLocale(newLocale);
        }, { immediate: true });

    } catch (error) {
        logger.error("Error crítico instalando i18n", error);
        throw error;
    }
}