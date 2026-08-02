(function () {
    'use strict';

    const root = document.documentElement;
    const storageKey = 'rui-portfolio-theme';
    const systemTheme = window.matchMedia('(prefers-color-scheme: light)');

    function preferredTheme() {
        try {
            const saved = window.localStorage.getItem(storageKey);
            if (saved === 'light' || saved === 'dark') return saved;
        } catch {
            // Local storage can be unavailable in privacy-restricted contexts.
        }
        return systemTheme.matches ? 'light' : 'dark';
    }

    function replaceIcon(element, name) {
        if (!element) return;
        element.innerHTML = `<i data-lucide="${name}" aria-hidden="true"></i>`;
        if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
    }

    function updateThemeMedia(theme) {
        document.querySelectorAll('[data-theme-src-dark][data-theme-src-light]').forEach(image => {
            const nextSource = theme === 'light' ? image.dataset.themeSrcLight : image.dataset.themeSrcDark;
            if (nextSource && image.getAttribute('src') !== nextSource) image.setAttribute('src', nextSource);
        });
    }

    function updateThemeControls(theme) {
        document.querySelectorAll('[data-theme-toggle]').forEach(button => {
            const nextTheme = theme === 'dark' ? 'light' : 'dark';
            const nextLabel = `Switch to ${nextTheme} theme`;
            button.setAttribute('aria-label', nextLabel);
            button.setAttribute('title', nextLabel);
            replaceIcon(button, theme === 'dark' ? 'sun' : 'moon');
        });
    }

    function applyTheme(theme, persist) {
        root.dataset.theme = theme;
        root.style.colorScheme = theme;
        updateThemeMedia(theme);
        updateThemeControls(theme);
        if (persist) {
            try {
                window.localStorage.setItem(storageKey, theme);
            } catch {
                // Theme persistence is optional; the UI still works without it.
            }
        }
    }

    applyTheme(preferredTheme(), false);

    document.addEventListener('DOMContentLoaded', () => {
        applyTheme(root.dataset.theme || preferredTheme(), false);

        document.querySelectorAll('[data-theme-toggle]').forEach(button => {
            button.addEventListener('click', () => {
                applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
            });
        });

        const menuButton = document.querySelector('[data-menu-toggle]');
        const menu = document.querySelector('[data-nav-links]');
        if (menuButton && menu) {
            const backdrop = document.createElement('button');
            backdrop.className = 'nav-backdrop';
            backdrop.type = 'button';
            backdrop.tabIndex = -1;
            backdrop.setAttribute('aria-label', 'Close navigation menu');
            document.body.appendChild(backdrop);

            function setMenu(open, moveFocus) {
                menu.classList.toggle('active', open);
                backdrop.classList.toggle('active', open);
                document.body.classList.toggle('menu-open', open);
                menuButton.setAttribute('aria-expanded', String(open));
                menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
                menuButton.setAttribute('title', open ? 'Close navigation menu' : 'Open navigation menu');
                replaceIcon(menuButton, open ? 'x' : 'menu');

                if (moveFocus) {
                    if (open) menu.querySelector('a')?.focus();
                    else menuButton.focus();
                }
            }

            menuButton.addEventListener('click', () => {
                setMenu(!menu.classList.contains('active'), false);
            });
            backdrop.addEventListener('click', () => setMenu(false, true));
            menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false, false)));
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape' && menu.classList.contains('active')) setMenu(false, true);
            });
        }

        if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
    });

    systemTheme.addEventListener('change', event => {
        try {
            if (window.localStorage.getItem(storageKey)) return;
        } catch {
            // Fall through to the system preference.
        }
        applyTheme(event.matches ? 'light' : 'dark', false);
    });
})();
