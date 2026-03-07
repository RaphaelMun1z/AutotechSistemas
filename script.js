// Mobile drawer — slide from left
function toggleMenu() {
	const menu = document.getElementById("mobMenu");
	const overlay = document.getElementById("mobOverlay");
	const btn = document.getElementById("hambtn");
	const isOpen = menu.classList.contains("open");
	menu.classList.toggle("open", !isOpen);
	overlay.classList.toggle("open", !isOpen);
	btn.classList.toggle("is-open", !isOpen);
	document.body.style.overflow = isOpen ? "" : "hidden";
}

// Navbar active link on scroll
const sections = [
	"hero",
	"features",
	"usecases",
	"benefits",
	"integrations",
	"pricing",
	"blog",
	"contact",
];
const navLinks = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => {
	let cur = "";
	sections.forEach((id) => {
		const el = document.getElementById(id);
		if (el && window.scrollY >= el.offsetTop - 120) cur = id;
	});
	navLinks.forEach((a) => {
		a.classList.toggle("active", a.getAttribute("href") === "#" + cur);
	});
});

// ── Use Cases: tab switch + auto-timer ──
(function () {
	const TABS = ["oficina", "concessionaria", "autopecas", "estetica"];
	const DURATION = 5500;
	let current = 0,
		paused = false,
		startTime = null,
		elapsed = 0,
		rafId = null;

	function activate(idx, resetElapsed) {
		const id = TABS[idx];
		document
			.querySelectorAll(".uc-tab")
			.forEach((t) => t.classList.remove("on"));
		document.querySelectorAll(".uc-tab-bar").forEach((b) => {
			b.style.width = "0%";
		});
		const tab = document.querySelector(
			"[onclick*=\"ucSwitch('" + id + "')\"]",
		);
		if (tab) tab.classList.add("on");
		document.querySelectorAll(".uc-content").forEach((el) => {
			if (el.classList.contains("active")) {
				el.classList.add("leaving");
				el.classList.remove("active");
				setTimeout(() => el.classList.remove("leaving"), 260);
			}
		});
		const nt = document.getElementById("uct-" + id);
		if (nt) setTimeout(() => nt.classList.add("active"), 55);
		document.querySelectorAll(".uc-screen-panel").forEach((el) => {
			if (el.classList.contains("active")) {
				el.classList.add("leaving");
				el.classList.remove("active");
				setTimeout(() => el.classList.remove("leaving"), 260);
			}
		});
		const ns = document.getElementById("ucs-" + id);
		if (ns)
			setTimeout(() => {
				ns.classList.add("active");
				// Animate bars/counters in newly shown panel
				animatePanel(ns);
			}, 55);
		if (resetElapsed) elapsed = 0;
	}

	function animatePanel(panel) {
		// Animate bar fills
		panel.querySelectorAll(".sp-bar-fill[data-w]").forEach((el) => {
			el.style.width = "0%";
			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					el.style.width = el.dataset.w;
				}),
			);
		});
		// Animate chart bars
		panel.querySelectorAll(".sp-chart-bar[data-h]").forEach((el, i) => {
			el.style.height = "0%";
			setTimeout(() => {
				el.style.height = el.dataset.h;
				el.style.transition = "height .7s cubic-bezier(.25,1,.25,1)";
			}, i * 60);
		});
		// Animate counters
		panel.querySelectorAll(".sp-kpi-n[data-target]").forEach((el) => {
			const target = parseInt(el.dataset.target);
			const prefix = el.dataset.prefix || "";
			const suffix = el.dataset.suffix || "";
			let start = 0;
			const dur = 900;
			const t0 = performance.now();
			function step(now) {
				const p = Math.min((now - t0) / dur, 1);
				const v = Math.round(p * target);
				el.textContent = prefix + v + suffix;
				if (p < 1) requestAnimationFrame(step);
			}
			requestAnimationFrame(step);
		});
	}

	function tick(ts) {
		if (paused) {
			startTime = null;
			rafId = requestAnimationFrame(tick);
			return;
		}
		if (!startTime) startTime = ts;
		elapsed += ts - startTime;
		startTime = ts;
		const pct = Math.min((elapsed / DURATION) * 100, 100);
		const bar = document.querySelector(".uc-tab.on .uc-tab-bar");
		if (bar) {
			bar.style.width = pct + "%";
		}
		if (elapsed >= DURATION) {
			current = (current + 1) % TABS.length;
			activate(current, true);
		}
		rafId = requestAnimationFrame(tick);
	}

	window.ucSwitch = function (id, btn) {
		current = TABS.indexOf(id);
		activate(current, true);
		startTime = null;
	};

	const stage = document.getElementById("ucStage"),
		tabsEl = document.getElementById("ucTabs");
	function pauseTimer() {
		paused = true;
	}
	function resumeTimer() {
		paused = false;
		startTime = null;
	}
	if (tabsEl) {
		tabsEl.addEventListener("mouseenter", pauseTimer);
		tabsEl.addEventListener("mouseleave", resumeTimer);
	}
	if (stage) {
		stage.addEventListener("mouseenter", pauseTimer);
		stage.addEventListener("mouseleave", resumeTimer);
	}

	// First panel animate on load
	setTimeout(() => {
		const p = document.getElementById("ucs-oficina");
		if (p) animatePanel(p);
	}, 400);
	activate(0, true);
	rafId = requestAnimationFrame(tick);
})();

// ── Scroll-triggered number animation ──
(function () {
	const counters = document.querySelectorAll("[data-count]");
	const bars = document.querySelectorAll("[data-bar]");
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const el = entry.target;
				if (el.dataset.count !== undefined) {
					const target = parseFloat(el.dataset.count);
					const isFloat = el.dataset.count.includes(".");
					const prefix = el.dataset.prefix || "";
					const suffix = el.dataset.suffix || "";
					let t0 = null;
					const dur = 1400;
					function step(now) {
						if (!t0) t0 = now;
						const p = Math.min((now - t0) / dur, 1);
						const eased = 1 - Math.pow(1 - p, 3);
						const v = isFloat
							? (eased * target).toFixed(1)
							: Math.round(eased * target);
						el.textContent = prefix + v + suffix;
						if (p < 1) requestAnimationFrame(step);
					}
					requestAnimationFrame(step);
					observer.unobserve(el);
				}
				if (el.dataset.bar !== undefined) {
					setTimeout(() => {
						el.style.width = el.dataset.bar;
					}, 100);
					observer.unobserve(el);
				}
			});
		},
		{ threshold: 0.3 },
	);

	counters.forEach((el) => {
		el.textContent =
			(el.dataset.prefix || "") + "0" + (el.dataset.suffix || "");
		observer.observe(el);
	});
	bars.forEach((el) => {
		el.style.width = "0%";
		observer.observe(el);
	});

	// Gauge arc animation
	const gaugeArc = document.getElementById("gaugeArc");
	if (gaugeArc) {
		const gObs = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					const target = parseFloat(gaugeArc.dataset.dash);
					let t0 = null;
					const dur = 1600;
					function step(now) {
						if (!t0) t0 = now;
						const p = Math.min((now - t0) / dur, 1);
						const eased = 1 - Math.pow(1 - p, 3);
						gaugeArc.setAttribute(
							"stroke-dasharray",
							`${(eased * target).toFixed(1)} 402`,
						);
						if (p < 1) requestAnimationFrame(step);
					}
					requestAnimationFrame(step);
					gObs.unobserve(gaugeArc);
				});
			},
			{ threshold: 0.4 },
		);
		gObs.observe(gaugeArc);
	}
})();

// Testimonials carousel
const cards = document.querySelectorAll(".tcard");
const avatars = document.querySelectorAll(".tav");
let cur = 1; // Carousel starts with the second card active
let testiInterval;

function setTesti(n) {
	cur = (n + cards.length) % cards.length;
	cards.forEach((c, i) => {
		c.classList.toggle("on", i === cur);
	});
	if (avatars.length > 0) {
		avatars.forEach((a, i) => {
			a.classList.toggle("on", i === cur);
		});
	}
}

function resetTestiInterval() {
	clearInterval(testiInterval);
	testiInterval = setInterval(() => setTesti(cur + 1), 5000);
}

function prevTesti() {
	setTesti(cur - 1);
	resetTestiInterval();
}
function nextTesti() {
	setTesti(cur + 1);
	resetTestiInterval();
}

cards.forEach((card, i) => {
	card.addEventListener("click", () => setTesti(i));
});
avatars.forEach((avatar, i) => {
	avatar.addEventListener("click", () => setTesti(i));
});

// Auto-advance
testiInterval = setInterval(() => setTesti(cur + 1), 5000);

// Contact form with step animation
const formInputs = document.querySelectorAll(
	".contact-form input, .contact-form select, .contact-form textarea",
);
const steps = document.querySelectorAll(".con-step");
const conLine = document.getElementById("conLine");
let filled = 0;
function updateSteps() {
	let f = 0;
	formInputs.forEach((i) => {
		if (i.value.trim()) f++;
	});
	filled = f;
	const pct = Math.min(Math.round((f / formInputs.length) * 100), 100);
	const stepPct = [0, 30, 60, 100];
	const stepIdx = stepPct.findLastIndex((s) => pct >= s);
	steps.forEach((s, i) => s.classList.toggle("on", i <= stepIdx));
	conLine.style.height = Math.max(10, Math.round(pct * 0.85)) + "%";
}
formInputs.forEach((i) => i.addEventListener("input", updateSteps));

function submitForm(e) {
	e.preventDefault();
	const btn = document.getElementById("formBtn");
	const txt = document.getElementById("formBtnTxt");
	txt.textContent = "Enviando...";
	btn.style.opacity = ".7";
	btn.style.cursor = "not-allowed";
	setTimeout(() => {
		txt.textContent = "✓ Mensagem enviada! Entraremos em contato em breve.";
		btn.style.background = "linear-gradient(135deg,#16a34a,#14532d)";
		btn.style.opacity = "1";
		steps.forEach((s) => s.classList.add("on"));
		conLine.style.height = "85%";
	}, 1500);
}

// Keyboard close mobile menu
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		document.getElementById("mobMenu").classList.remove("open");
		document.getElementById("mobOverlay").classList.remove("open");
		document.getElementById("hambtn").classList.remove("is-open");
		document.body.style.overflow = "";
	}
});

// ── iPhone screen cycling animation ──
(function () {
	const pages = document.querySelectorAll(".iph-page");
	const dots = document.querySelectorAll(".iph-dot");
	const cursor = document.getElementById("iphCursor");
	const mockup = document.getElementById("iphoneMockup");
	if (!pages.length || !cursor || !mockup) return;

	let current = 0;
	const TOTAL = pages.length;

	// Where the cursor taps on each page (% of mockup dimensions)
	const taps = [
		{ left: "68%", top: "60%" }, // page 0 → tap first OS row
		{ left: "50%", top: "87%" }, // page 1 → tap total bar
		{ left: "50%", top: "52%" }, // page 2 → tap stock item
		{ left: "33%", top: "73%" }, // page 3 → tap approve button
	];

	function spawnRipple(left, top) {
		const r = document.createElement("div");
		r.className = "iph-ripple";
		r.style.cssText = `left:${left};top:${top};margin-left:-10px;margin-top:-10px;`;
		mockup.appendChild(r);
		setTimeout(() => r.remove(), 600);
	}

	function goNext() {
		const prev = current;
		current = (current + 1) % TOTAL;

		pages[prev].classList.add("leaving");
		pages[prev].classList.remove("active");
		dots[prev].classList.remove("active");

		setTimeout(() => pages[prev].classList.remove("leaving"), 350);

		pages[current].classList.add("active");
		dots[current].classList.add("active");
	}

	function tick() {
		const t = taps[current];

		// 1. Move cursor to tap position
		cursor.classList.add("visible");
		cursor.style.left = t.left;
		cursor.style.top = t.top;

		// 2. After travel time: press + ripple
		setTimeout(() => {
			cursor.style.transform = "translate(-50%,-50%) scale(.55)";
			spawnRipple(t.left, t.top);

			// 3. Release + switch page
			setTimeout(() => {
				cursor.style.transform = "translate(-50%,-50%) scale(1)";
				setTimeout(() => {
					cursor.classList.remove("visible");
					goNext();
				}, 200);
			}, 220);
		}, 550);
	}

	// Start after 1.8s, then every 3.6s
	setTimeout(() => {
		tick();
		setInterval(tick, 3600);
	}, 1800);
})();

// ── Scroll fade-in ──
const fadeObserver = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("visible");
				fadeObserver.unobserve(entry.target);
			}
		});
	},
	{ threshold: 0.12 },
);

document.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));

// ── Hero company type cycler ──
const heroTypes = [
	{
		label: "oficina mecânica",
		color: "#DC143C",
		bg: "rgba(220,20,60,.12)",
		border: "rgba(220,20,60,.3)",
		iconBg: "#DC143C",
		icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
	},
	{
		label: "concessionária",
		color: "#1C69D4",
		bg: "rgba(28,105,212,.1)",
		border: "rgba(28,105,212,.3)",
		iconBg: "#1C69D4",
		icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
	},
	{
		label: "loja de autopeças",
		color: "#FF8000",
		bg: "rgba(255,128,0,.1)",
		border: "rgba(255,128,0,.3)",
		iconBg: "#FF8000",
		icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
	},
	{
		label: "estética automotiva",
		color: "#9333EA",
		bg: "rgba(147,51,234,.1)",
		border: "rgba(147,51,234,.3)",
		iconBg: "#9333EA",
		icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
	},
	{
		label: "rede de oficinas",
		color: "#FFCC00",
		bg: "rgba(255,204,0,.1)",
		border: "rgba(255,204,0,.3)",
		iconBg: "#D4A800",
		icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="4" cy="19" r="3"/><circle cx="20" cy="19" r="3"/><line x1="12" y1="12" x2="4" y2="16"/><line x1="12" y1="12" x2="20" y2="16"/></svg>`,
	},
];
let htIdx = 0;
const htWrap = document.getElementById("heroTypeWrap");
const htIcon = document.getElementById("heroTypeIcon");
const htText = document.getElementById("heroTypeText");

function applyHeroType(t) {
	htWrap.style.background = t.bg;
	htWrap.style.borderColor = t.border;
	htIcon.style.background = t.iconBg;
	htIcon.innerHTML = t.icon;
	htText.style.color = t.color;
	htText.style.textShadow = "0 0 40px " + t.color + "60";
	htText.textContent = t.label;
}

function cycleHeroType() {
	htText.classList.remove("type-entering");
	htText.classList.add("type-leaving");
	htIcon.classList.remove("type-entering");
	htIcon.classList.add("type-leaving");
	setTimeout(function () {
		htIdx = (htIdx + 1) % heroTypes.length;
		applyHeroType(heroTypes[htIdx]);
		htIcon.classList.remove("type-leaving");
		htIcon.classList.add("type-entering");
		htWrap.style.borderColor = heroTypes[htIdx].border;
		htWrap.style.background = heroTypes[htIdx].bg;
	}, 300);
}
setInterval(cycleHeroType, 2800);
