(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function initRevealEffects() {
        const elements = document.querySelectorAll('.fade-in');
        if (reduceMotion || !('IntersectionObserver' in window)) {
            elements.forEach(element => element.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        elements.forEach(element => observer.observe(element));
    }

    function initCounters() {
        const counters = document.querySelectorAll('.count-up');
        const section = document.getElementById('metrics');
        if (!section || !counters.length || reduceMotion) return;

        const observer = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            section.classList.add('metrics-live');
            observer.disconnect();
        }, { threshold: 0.35 });
        observer.observe(section);
    }

    async function loadResumeCount() {
        try {
            const response = await fetch('/api/download-resume?stats=1');
            if (!response.ok) return;
            const data = await response.json();
            if (!data.count) return;
            const label = `Downloaded ${data.count} time${data.count === 1 ? '' : 's'}`;
            ['hero-dl-count', 'contact-dl-count'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = label;
            });
        } catch {
            // The counter is supporting context, so failure should not block the page.
        }
    }

    function appendInlineText(parent, text) {
        const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const strong = document.createElement('strong');
                strong.textContent = part.slice(2, -2);
                parent.appendChild(strong);
            } else {
                parent.appendChild(document.createTextNode(part));
            }
        });
    }

    function renderAssistantText(container, text) {
        const lines = String(text).replace(/\r/g, '').split('\n');
        let list = null;

        lines.forEach(rawLine => {
            const line = rawLine.trim();
            if (!line) {
                list = null;
                return;
            }

            const bullet = line.match(/^[-*]\s+(.+)/);
            if (bullet) {
                if (!list) {
                    list = document.createElement('ul');
                    container.appendChild(list);
                }
                const item = document.createElement('li');
                appendInlineText(item, bullet[1]);
                list.appendChild(item);
                return;
            }

            list = null;
            const paragraph = document.createElement('p');
            paragraph.style.margin = '0';
            appendInlineText(paragraph, line.replace(/^#{1,4}\s+/, ''));
            container.appendChild(paragraph);
        });
    }

    function initChat() {
        const toggle = document.getElementById('botToggle');
        const dialog = document.getElementById('botWindow');
        const close = document.getElementById('botClose');
        const messages = document.getElementById('botMessages');
        const input = document.getElementById('botInput');
        const send = document.getElementById('botSend');
        const suggestions = document.getElementById('botSuggestions');
        if (!toggle || !dialog || !close || !messages || !input || !send) return;

        let history = [];
        let lastFocused = null;

        function addMessage(text, sender) {
            const message = document.createElement('div');
            message.className = `msg ${sender}`;
            if (sender === 'bot') renderAssistantText(message, text);
            else message.textContent = text;
            messages.appendChild(message);
            messages.scrollTop = messages.scrollHeight;
        }

        function setTyping(visible) {
            document.getElementById('typingIndicator')?.remove();
            if (!visible) return;
            const indicator = document.createElement('div');
            indicator.className = 'typing-indicator';
            indicator.id = 'typingIndicator';
            indicator.setAttribute('aria-label', 'Rui\'s AI assistant is responding');
            indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
            messages.appendChild(indicator);
            messages.scrollTop = messages.scrollHeight;
        }

        function openChat() {
            lastFocused = document.activeElement;
            dialog.inert = false;
            dialog.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.classList.add('bot-toggle-hidden');
            window.setTimeout(() => input.focus(), reduceMotion ? 0 : 220);
        }

        function closeChat() {
            dialog.classList.remove('active');
            dialog.inert = true;
            toggle.setAttribute('aria-expanded', 'false');
            toggle.classList.remove('bot-toggle-hidden');
            if (lastFocused instanceof HTMLElement) lastFocused.focus();
        }

        async function sendMessage(rawText) {
            const message = rawText.trim();
            if (!message || send.disabled) return;

            const requestHistory = history.slice(-6);
            addMessage(message, 'user');
            history.push({ role: 'user', content: message });
            input.value = '';
            input.disabled = true;
            send.disabled = true;
            if (suggestions) suggestions.hidden = true;
            setTyping(true);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, history: requestHistory }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Assistant request failed.');
                const reply = data.reply || 'I could not find that in Rui\'s portfolio. Please email him for details.';
                addMessage(reply, 'bot');
                history.push({ role: 'assistant', content: reply });
            } catch (error) {
                const fallback = error.message.includes('rate limit')
                    ? 'The assistant has reached its short-term request limit. Please try again later or email Rui directly.'
                    : 'The assistant is temporarily unavailable. Please email bianrui0315@gmail.com directly.';
                addMessage(fallback, 'bot');
            } finally {
                setTyping(false);
                input.disabled = false;
                send.disabled = false;
                input.focus();
            }
        }

        toggle.addEventListener('click', openChat);
        close.addEventListener('click', closeChat);
        send.addEventListener('click', () => sendMessage(input.value));
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage(input.value);
            }
        });
        document.querySelectorAll('.bot-suggest-btn').forEach(button => {
            button.addEventListener('click', () => sendMessage(button.textContent));
        });
        document.addEventListener('click', event => {
            if (dialog.classList.contains('active') && !dialog.contains(event.target) && !toggle.contains(event.target)) {
                closeChat();
            }
        });
        dialog.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeChat();
                return;
            }
            if (event.key !== 'Tab') return;
            const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), input:not([disabled])'));
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    }

    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        const startedAt = Date.now();

        form.addEventListener('submit', async event => {
            event.preventDefault();
            const button = document.getElementById('contact-submit');
            const feedback = document.getElementById('contact-feedback');
            const payload = {
                name: document.getElementById('cf-name').value.trim(),
                email: document.getElementById('cf-email').value.trim(),
                message: document.getElementById('cf-message').value.trim(),
                website: document.getElementById('cf-website').value,
                startedAt,
            };

            feedback.className = 'form-feedback';
            feedback.hidden = true;
            if (!payload.name || !payload.email || !payload.message) {
                feedback.textContent = 'Please fill in all fields.';
                feedback.className = 'form-feedback error';
                feedback.hidden = false;
                return;
            }

            button.disabled = true;
            button.textContent = 'Sending...';
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.error || 'Message could not be delivered.');
                feedback.textContent = 'Message sent. I will be in touch soon.';
                feedback.className = 'form-feedback success';
                form.reset();
            } catch (error) {
                feedback.textContent = error.message || 'Please email bianrui0315@gmail.com directly.';
                feedback.className = 'form-feedback error';
            } finally {
                feedback.hidden = false;
                button.disabled = false;
                button.textContent = 'Send Message';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initRevealEffects();
        initCounters();
        initChat();
        initContactForm();
        loadResumeCount();
    });
})();
