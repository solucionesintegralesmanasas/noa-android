// src/types/globals.d.ts — Declaraciones globales (ARQ-016, fase 1).
// Cubre los scripts cargados por index.html fuera del bundle (Falcon/legacy).
// No usar como vía para `any` de código propio: el resto se tipa por fases.

interface BootstrapTooltip {
    dispose: () => void;
    show: () => void;
    hide: () => void;
}

interface BootstrapStatic {
    Tooltip: new (element: Element, options?: Record<string, unknown>) => BootstrapTooltip;
    Modal: new (element: Element, options?: Record<string, unknown>) => {
        show: () => void;
        hide: () => void;
    };
}

interface FalconTheme {
    toggleTheme?: (value: string) => void;
    [key: string]: unknown;
}

interface SimpleBarInstance {
    recalculate: () => void;
    getScrollElement: () => HTMLElement;
}

interface Window {
    bootstrap?: BootstrapStatic;
    falconTheme?: FalconTheme;
    SimpleBar?: new (element: Element, options?: Record<string, unknown>) => SimpleBarInstance;
    L?: unknown;
    _?: unknown;
}
