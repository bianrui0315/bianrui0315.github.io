(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.documentElement.classList.add('motion-ready');

    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    const atmosphere = document.createElement('div');
    atmosphere.className = 'scroll-atmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');
    document.body.appendChild(atmosphere);

    const revealTargets = [
        ...document.querySelectorAll('.case-section, .case-visual-shell, .case-metric, .case-shot, .case-callout, .evidence-card')
    ];

    revealTargets.forEach((target, index) => {
        if (!target.classList.contains('fade-in')) {
            target.classList.add('motion-reveal');
        }
        target.style.setProperty('--reveal-index', String(index % 6));
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.16, rootMargin: '0px 0px -64px 0px' });

        document.querySelectorAll('.motion-reveal').forEach(target => revealObserver.observe(target));
    } else {
        document.querySelectorAll('.motion-reveal').forEach(target => target.classList.add('visible'));
    }

    const parallaxTargets = [
        ...document.querySelectorAll('.project-preview, .case-visual-shell, .evidence-media img')
    ];
    const tiltTargets = [
        ...document.querySelectorAll('.project-card, .evidence-card')
    ];

    let ticking = false;

    function updateScrollEffects() {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));

        progress.style.transform = `scaleX(${ratio})`;
        document.documentElement.style.setProperty('--scroll-progress', ratio.toFixed(4));

        if (!reduceMotion && window.innerWidth > 760) {
            parallaxTargets.forEach(target => {
                const rect = target.getBoundingClientRect();
                const centerOffset = ((rect.top + rect.height / 2) - window.innerHeight / 2) / window.innerHeight;
                const y = Math.max(-16, Math.min(16, centerOffset * -18));
                target.style.setProperty('--parallax-y', y.toFixed(2));
            });
        }

        ticking = false;
    }

    function requestScrollUpdate() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateScrollEffects);
    }

    updateScrollEffects();
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate);

    if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
        tiltTargets.forEach(card => {
            card.addEventListener('mousemove', event => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                card.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
                card.style.setProperty('--tilt-y', `${(x * 5).toFixed(2)}deg`);
            });

            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--tilt-x', '0deg');
                card.style.setProperty('--tilt-y', '0deg');
            });
        });
    }
})();
