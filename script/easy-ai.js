/* ============================================================
   EASY AI NAV — easy-ai.js
   Handles click-to-open on touch devices + mobile accordion
   ============================================================ */
(function () {
    'use strict';

    // ── Utility: close all desktop dropdowns ────────────────────
    function closeAllDesktop() {
        document.querySelectorAll('.ai-nav-item, .float-ai-nav-item').forEach(function (el) {
            el.classList.remove('open');
        });
    }

    // ── Desktop nav items (top + floating): toggle on click (touch) ─
    var desktopTriggers = document.querySelectorAll('.ai-nav-trigger, .float-ai-trigger');
    desktopTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            // Only intercept click (i.e. touch-devices that can't hover)
            var parent = trigger.closest('.ai-nav-item, .float-ai-nav-item');
            if (!parent) return;
            var wasOpen = parent.classList.contains('open');
            closeAllDesktop();
            if (!wasOpen) parent.classList.add('open');
            e.stopPropagation();
        });
    });

    // ── Close desktop dropdowns when clicking elsewhere ─────────
    document.addEventListener('click', function () {
        closeAllDesktop();
    });

    // ── Mobile accordion (#mobile-ai-toggle) ────────────────────
    var mobileHeader = document.getElementById('mobile-ai-toggle');
    var mobileBody   = document.getElementById('mobile-ai-body');

    if (mobileHeader && mobileBody) {
        mobileHeader.addEventListener('click', function () {
            var isOpen = mobileBody.classList.contains('open');
            if (isOpen) {
                mobileBody.classList.remove('open');
                mobileHeader.classList.remove('active');
            } else {
                mobileBody.classList.add('open');
                mobileHeader.classList.add('active');
            }
        });
    }

    // ── Close mobile accordion when overlay closes ───────────────
    // Listen for the custom toggler buttons that hide .mobile-nav-overlay
    var mobileOverlay = document.getElementById('mobileOverlay');
    if (mobileOverlay && mobileBody) {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                if (m.type === 'attributes' && m.attributeName === 'class') {
                    if (!mobileOverlay.classList.contains('active')) {
                        if (mobileBody) {
                            mobileBody.classList.remove('open');
                            if (mobileHeader) mobileHeader.classList.remove('active');
                        }
                    }
                }
            });
        });
        observer.observe(mobileOverlay, { attributes: true });
    }
})();

/* ================================================================
   AI HERO PAGE  —  loader + canvas particles + table reveal
   ================================================================ */
(function () {
    'use strict';

    var loader      = document.getElementById('aiPageLoader');
    var barEl       = document.getElementById('aiLoaderBar');
    var pctEl       = document.getElementById('aiLoaderPct');
    var statusEl    = document.getElementById('aiLoaderStatus');
    var content     = document.getElementById('aiHeroContent');
    var tableEl     = document.getElementById('aiDataTable');

    if (!loader) return;              // not on ai-automation page

    /* ── Status messages that cycle during loading ── */
    var messages = [
        'Initialising neural engine…',
        'Connecting to salon data streams…',
        'Calibrating AI models…',
        'Loading booking intelligence…',
        'Ready.'
    ];
    var msgIndex  = 0;
    var progress  = 0;
    var done      = false;

    /* Pause table rows until after loader */
    if (tableEl) tableEl.classList.add('rows-paused');

    /* ── Progress ticker ── */
    var ticker = setInterval(function () {
        if (done) return;

        progress += Math.random() * 6 + 2;       /* 2–8% per tick */
        if (progress >= 100) progress = 100;

        if (barEl)  barEl.style.width  = progress + '%';
        if (pctEl)  pctEl.textContent  = Math.round(progress) + '%';

        /* Cycle status label */
        var newIdx = Math.floor((progress / 100) * (messages.length - 1));
        if (newIdx !== msgIndex && statusEl) {
            msgIndex = newIdx;
            statusEl.textContent = messages[msgIndex];
        }

        if (progress >= 100) {
            clearInterval(ticker);
            done = true;
            revealContent();
        }
    }, 40);          /* ~2.5 s total at average 4%/40ms */

    /* ── Reveal hero content ── */
    function revealContent() {
        setTimeout(function () {
            loader.classList.add('hidden');

            /* Animate content in */
            setTimeout(function () {
                if (content) content.classList.add('visible');

                /* Start table row animations */
                setTimeout(function () {
                    if (tableEl) {
                        tableEl.classList.remove('rows-paused');
                        tableEl.classList.add('rows-active');
                    }
                }, 300);
            }, 100);
        }, 400);   /* short pause at 100% before hiding */
    }

    /* ================================================================
       CANVAS PARTICLE SYSTEM
       Coral + navy floating dots connected by faint lines
    ================================================================ */
    var canvas = document.getElementById('aiCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H, particles = [];
    var PARTICLE_COUNT = 55;
    var MAX_DIST       = 130;

    function resize() {
        var section = document.getElementById('easyAiSection');
        W = canvas.width  = section ? section.offsetWidth  : window.innerWidth;
        H = canvas.height = section ? section.offsetHeight : window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    /* Build particles */
    function Particle() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - .5) * .5;
        this.vy = (Math.random() - .5) * .5;
        this.r  = Math.random() * 2.2 + 1;
        /* alternate between coral and pale navy-white */
        this.color = Math.random() > .5
            ? 'rgba(255,159,161,0.55)'
            : 'rgba(100,160,255,0.35)';
    }
    Particle.prototype.update = function () {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
    };

    for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    /* Draw loop */
    function draw() {
        ctx.clearRect(0, 0, W, H);

        /* Connecting lines */
        for (var a = 0; a < particles.length; a++) {
            for (var b = a + 1; b < particles.length; b++) {
                var dx = particles[a].x - particles[b].x;
                var dy = particles[a].y - particles[b].y;
                var dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < MAX_DIST) {
                    var alpha = (1 - dist / MAX_DIST) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.strokeStyle = 'rgba(255,159,161,' + alpha + ')';
                    ctx.lineWidth   = .8;
                    ctx.stroke();
                }
            }
        }

        /* Dots */
        particles.forEach(function (p) {
            p.update();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }
    draw();

})();
