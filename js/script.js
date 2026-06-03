/* =========================================================================
   Victor Guilarte — Portfolio
   Vanilla JS · ES2020+
   ========================================================================= */
(function () {
	'use strict';

	/* ------------------------------------------------------------------------
	   0. Utilities
	   ------------------------------------------------------------------------ */
	const $ = (sel, root = document) => root.querySelector(sel);
	const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

	/* ------------------------------------------------------------------------
	   1. Language switching
	   ------------------------------------------------------------------------ */
	const LANG_DEFAULT = 'en';
	const LANG_STORAGE = 'vg.lang';
	const TEXTS_SELECTOR = '[data-text]';

	let cachedTexts = null;

	async function loadTexts(lang) {
		if (cachedTexts && cachedTexts.__lang === lang) return cachedTexts;
		const res = await fetch(`languages/${lang}.json`, { cache: 'no-cache' });
		if (!res.ok) throw new Error(`HTTP ${res.status} loading ${lang}.json`);
		const data = await res.json();
		cachedTexts = { ...data, __lang: lang };
		return cachedTexts;
	}

	function applyTexts(texts) {
		$$(TEXTS_SELECTOR).forEach((el) => {
			const key = el.dataset.text;
			if (!texts[key]) return;

			// For elements with HTML children we still want a safe text update
			// but preserve the <span data-text> child if any (used inside other
			// data-text parents). We just set textContent for leaf nodes.
			if (el.children.length === 0) {
				el.textContent = texts[key];
			} else {
				// Find a single text-bearing child, fallback to textContent
				el.textContent = texts[key];
			}
		});
	}

	async function setLanguage(lang) {
		try {
			const texts = await loadTexts(lang);
			applyTexts(texts);
			document.documentElement.lang = lang;
			$$('.flags-item').forEach((item) => {
				const isActive = item.dataset.lang === lang;
				item.classList.toggle('active', isActive);
				item.setAttribute('aria-pressed', String(isActive));
			});
			localStorage.setItem(LANG_STORAGE, lang);
		} catch (err) {
			console.error('Language load failed:', err);
		}
	}

	function initLanguage() {
		// Default: always English. Persisted choice wins.
		const saved = localStorage.getItem(LANG_STORAGE) || LANG_DEFAULT;
		setLanguage(saved);

		$('#flags')?.addEventListener('click', (e) => {
			const item = e.target.closest('.flags-item');
			if (!item) return;
			setLanguage(item.dataset.lang);
		});
	}

	/* ------------------------------------------------------------------------
	   2. Theme toggle
	   ------------------------------------------------------------------------ */
	const THEME_STORAGE = 'vg.theme';
	const THEME_DEFAULT = 'dark';

	function setTheme(theme) {
		document.documentElement.setAttribute('data-theme', theme);
		const icon = $('.theme-toggle i');
		if (icon) {
			icon.className = theme === 'light' ? 'bx bx-moon' : 'bx bx-sun';
		}
		localStorage.setItem(THEME_STORAGE, theme);
	}

	function initTheme() {
		const saved = localStorage.getItem(THEME_STORAGE) || THEME_DEFAULT;
		setTheme(saved);
		$('#theme-toggle')?.addEventListener('click', () => {
			const current = document.documentElement.getAttribute('data-theme') || THEME_DEFAULT;
			setTheme(current === 'dark' ? 'light' : 'dark');
		});
	}

	/* ------------------------------------------------------------------------
	   3. Header scroll state & active section indicator
	   ------------------------------------------------------------------------ */
	function initHeader() {
		const header = $('#site-header');
		const navLinks = $$('.navbar a[href^="#"]');
		const sections = navLinks
			.map((link) => {
				const id = link.getAttribute('href').slice(1);
				return document.getElementById(id);
			})
			.filter(Boolean);

		const setActive = (id) => {
			navLinks.forEach((link) => {
				const linkId = link.getAttribute('href').slice(1);
				link.classList.toggle('is-active', linkId === id);
			});
		};

		// Scroll state
		const onScroll = () => {
			header?.classList.toggle('is-scrolled', window.scrollY > 8);
		};
		document.addEventListener('scroll', onScroll, { passive: true });
		onScroll();

		// Active section via IntersectionObserver
		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) setActive(entry.target.id);
					});
				},
				{ rootMargin: '-40% 0px -55% 0px', threshold: 0 }
			);
			sections.forEach((s) => observer.observe(s));
		}
	}

	/* ------------------------------------------------------------------------
	   4. Mobile menu
	   ------------------------------------------------------------------------ */
	function initMobileMenu() {
		const toggle = $('#menu-icon');
		if (!toggle) return;
		toggle.addEventListener('click', () => {
			const isOpen = document.body.classList.toggle('menu-open');
			toggle.setAttribute('aria-expanded', String(isOpen));
			const icon = toggle.querySelector('i');
			if (icon) icon.className = isOpen ? 'bx bx-x' : 'bx bx-menu';
		});

		// Close menu when clicking any nav link
		$$('.navbar a').forEach((link) => {
			link.addEventListener('click', () => {
				document.body.classList.remove('menu-open');
				toggle.setAttribute('aria-expanded', 'false');
				const icon = toggle.querySelector('i');
				if (icon) icon.className = 'bx bx-menu';
			});
		});
	}

	/* ------------------------------------------------------------------------
	   5. Reveal on scroll (replaces ScrollReveal)
	   ------------------------------------------------------------------------ */
	function initReveal() {
		const items = $$('.reveal');
		if (!items.length) return;

		if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			items.forEach((el) => el.classList.add('is-visible'));
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
		);
		items.forEach((el) => observer.observe(el));
	}

	/* ------------------------------------------------------------------------
	   6. Scroll to top
	   ------------------------------------------------------------------------ */
	function initScrollTop() {
		const btn = $('.scroll-top');
		if (!btn) return;
		const onScroll = () => btn.classList.toggle('is-visible', window.scrollY > 600);
		document.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	/* ------------------------------------------------------------------------
	   7. CV Modal
	   ------------------------------------------------------------------------ */
	function initCvModal() {
		const modal = $('#cv-modal');
		if (!modal) return;

		const openers = $$('[data-open-cv]');
		const closeBtn = $('#cv-modal-close');
		let lastOpener = null;

		const open = (opener) => {
			lastOpener = opener || null;
			modal.hidden = false;
			document.body.style.overflow = 'hidden';
			closeBtn?.focus();
		};
		const close = () => {
			modal.hidden = true;
			document.body.style.overflow = '';
			if (lastOpener && typeof lastOpener.focus === 'function') {
				lastOpener.focus();
			} else {
				openers[0]?.focus();
			}
		};

		openers.forEach((btn) => btn.addEventListener('click', (e) => {
			e.preventDefault();
			open(btn);
		}));

		modal.addEventListener('click', (e) => {
			if (e.target.matches('[data-close-cv]')) close();
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && !modal.hidden) close();
		});
	}

	/* ------------------------------------------------------------------------
	   8. Copy email
	   ------------------------------------------------------------------------ */
	function initCopyEmail() {
		const btn = $('#copy-email');
		if (!btn) return;
		const email = 'vaglegra91@gmail.com';
		const original = btn.innerHTML;

		btn.addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(email);
			} catch {
				// Fallback for older browsers
				const ta = document.createElement('textarea');
				ta.value = email;
				ta.style.position = 'fixed';
				ta.style.opacity = '0';
				document.body.appendChild(ta);
				ta.select();
				try { document.execCommand('copy'); } catch (_) {}
				document.body.removeChild(ta);
			}
			btn.classList.add('is-copied');
			const label = btn.querySelector('span');
			const originalLabel = label ? label.textContent : '';
			if (label) label.textContent = '✓';
			setTimeout(() => {
				btn.classList.remove('is-copied');
				btn.innerHTML = original;
				// Re-apply translations to the restored label
				setLanguage(localStorage.getItem(LANG_STORAGE) || LANG_DEFAULT);
			}, 1800);
		});
	}

	/* ------------------------------------------------------------------------
	   9. Contact form (EmailJS)
	   ------------------------------------------------------------------------ */
	const EMAILJS_PUBLIC_KEY = '2YPcm-rA0h-8vmvxg';
	const EMAILJS_SERVICE = 'contact_service';
	const EMAILJS_TEMPLATE = 'contact_form';

	function initContactForm() {
		const form = $('#contactForm');
		if (!form) return;

		const submitBtn = $('#contact-submit');
		const btnLabel = submitBtn?.querySelector('.btn-label');
		const feedback = $('#form-feedback');

		// Live validation
		$$('input, textarea', form).forEach((field) => {
			field.addEventListener('blur', () => {
				if (field.required && !field.value.trim()) {
					field.classList.add('is-invalid');
				} else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
					field.classList.add('is-invalid');
				} else {
					field.classList.remove('is-invalid');
				}
			});
			field.addEventListener('input', () => field.classList.remove('is-invalid'));
		});

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (!feedback) return;

			const data = {
				from_name: form.name.value.trim(),
				user_email: form.email.value.trim(),
				subject: form.subject.value.trim(),
				message: form.message.value.trim()
			};

			// Basic validation
			if (!data.from_name || !data.user_email || !data.message) {
				feedback.textContent = '⚠ Please fill in name, email and message.';
				feedback.className = 'form-feedback is-error';
				return;
			}
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.user_email)) {
				feedback.textContent = '⚠ Please enter a valid email.';
				feedback.className = 'form-feedback is-error';
				return;
			}

			const sendText = btnLabel?.textContent || 'Send';
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.classList.add('is-loading');
				if (btnLabel) btnLabel.textContent = '…';
			}
			feedback.textContent = '';
			feedback.className = 'form-feedback';

			try {
				if (typeof emailjs === 'undefined') throw new Error('EmailJS not loaded');
				await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, data);
				feedback.textContent = '✓ Message sent. I will reply soon.';
				feedback.className = 'form-feedback is-success';
				form.reset();
			} catch (err) {
				console.error('EmailJS error:', err);
				feedback.textContent = '✕ Could not send. Email me directly at vaglegra91@gmail.com';
				feedback.className = 'form-feedback is-error';
			} finally {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.classList.remove('is-loading');
					if (btnLabel) btnLabel.textContent = sendText;
				}
			}
		});

		// Init EmailJS
		if (typeof emailjs !== 'undefined') {
			emailjs.init(EMAILJS_PUBLIC_KEY);
		}
	}

	/* ------------------------------------------------------------------------
	   10. Year
	   ------------------------------------------------------------------------ */
	function setCurrentYear() {
		const el = $('#current-year');
		if (el) el.textContent = String(new Date().getFullYear());
	}

	/* ------------------------------------------------------------------------
	   Bootstrap
	   ------------------------------------------------------------------------ */
	function init() {
		setCurrentYear();
		initTheme();
		initLanguage();
		initHeader();
		initMobileMenu();
		initReveal();
		initScrollTop();
		initCvModal();
		initCopyEmail();
		initContactForm();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
