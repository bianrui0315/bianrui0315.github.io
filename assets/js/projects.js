(function () {
    'use strict';

    const buttons = [...document.querySelectorAll('.filter-btn[data-filter]')];
    const cards = [...document.querySelectorAll('.detail-card[data-category]')];
    const sections = [...document.querySelectorAll('.category-section')];
    const hideTimers = new WeakMap();

    function applyFilter(category, activeButton) {
        buttons.forEach(button => {
            const active = button === activeButton;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });

        cards.forEach(card => {
            const matches = category === 'all' || card.dataset.category === category;
            window.clearTimeout(hideTimers.get(card));
            if (matches) {
                card.classList.remove('hidden');
                requestAnimationFrame(() => card.classList.remove('hiding'));
            } else {
                card.classList.add('hiding');
                hideTimers.set(card, window.setTimeout(() => card.classList.add('hidden'), 290));
            }
        });

        sections.forEach(section => {
            const hasMatch = category === 'all' || Boolean(section.querySelector(`.detail-card[data-category="${category}"]`));
            section.hidden = !hasMatch;
        });
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => applyFilter(button.dataset.filter, button));
    });

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.08 });

        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(24px)';
            card.style.transitionDelay = `${(index % 3) * 0.06}s`;
            observer.observe(card);
        });
    }
})();
