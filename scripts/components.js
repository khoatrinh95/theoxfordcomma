// ─────────────────────────────────────────────
//  The Oxford Comma - components.js
//  Loads shared nav and footer fragments so
//  they only need to be edited in one place.
// ─────────────────────────────────────────────

(function () {

    // ── Fragment loader ────────────────────────
    // Fetches an HTML file and injects its contents
    // into the element matching `selector`.
    // Calls `onDone` when complete (or on failure).

    function loadFragment(path, selector, onDone) {
        const target = document.querySelector(selector);
        if (!target) { if (onDone) onDone(); return; }

        fetch(path)
            .then(function (r) {
                if (!r.ok) throw new Error('Failed to load ' + path);
                return r.text();
            })
            .then(function (html) {
                target.outerHTML = html;
                if (onDone) onDone();
            })
            .catch(function (err) {
                console.warn('[components.js]', err);
                if (onDone) onDone();
            });
    }

    // ── Cursor ────────────────────────────────
    // Initialised after nav fragment is injected
    // so the #cursor element exists in the DOM.

    function initCursor() {
        const cursor = document.getElementById('cursor');
        if (!cursor) return;

        document.addEventListener('mousemove', function (e) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.addEventListener('mouseenter', function (e) {
            const t = e.target;
            if (t.tagName === 'A' || t.tagName === 'BUTTON' ||
                t.closest('a') || t.closest('button')) {
                cursor.classList.add('expanded');
            }
        }, true);

        document.addEventListener('mouseleave', function (e) {
            const t = e.target;
            if (t.tagName === 'A' || t.tagName === 'BUTTON' ||
                t.closest('a') || t.closest('button')) {
                cursor.classList.remove('expanded');
            }
        }, true);
    }

    // ── Nav scroll behaviour ──────────────────

    function initNav() {
        const nav = document.getElementById('navbar');
        if (!nav) return;
        function onScroll() {
            nav.classList.toggle('scrolled', window.scrollY > 40);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ── Boot sequence ─────────────────────────
    // Load nav first (it contains #cursor), then
    // load footer, then initialise behaviours.
    // Both loads are fired in parallel; we wait
    // for nav before initialising cursor/nav.

    document.addEventListener('DOMContentLoaded', function () {

        // Determine base path so fragments resolve
        // correctly regardless of folder depth.
        // For a flat repo (all files in root) this
        // is always '' - adjust if you add subfolders.
        var base = '';

        var navDone = false;
        var footerDone = false;

        function onNavDone() {
            navDone = true;
            initCursor();
            initNav();
        }

        function onFooterDone() {
            footerDone = true;
        }

        loadFragment(base + 'nav.html', '#nav-placeholder', onNavDone);
        loadFragment(base + 'footer.html', '#footer-placeholder', onFooterDone);
    });

})();