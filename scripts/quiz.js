// ─────────────────────────────────────────────
//  The Oxford Comma - EU Readiness Quiz
//  quiz.js
// ─────────────────────────────────────────────

const APPS_SCRIPT_URL = TOC_CONFIG.APPS_SCRIPT_URL;


// ─── Question definitions ───────────────────

const QUESTIONS = [
    {
        id: 'Q1_PMF',
        text: 'Have you established product-market fit in Canada?',
        type: 'score',
        options: [
            { label: 'Yes - clear and growing demand', points: 20, cap: null },
            { label: 'Early signs, not yet proven', points: 8, cap: null },
            { label: 'Not yet - still finding it', points: 0, cap: 4.0 },
        ],
    },
    {
        id: 'Q2_Revenue',
        text: 'What is your current annual revenue?',
        type: 'score',
        options: [
            { label: 'Under $1M CAD', points: 4 },
            { label: '$1M – $3M CAD', points: 10 },
            { label: '$3M – $10M CAD', points: 16 },
            { label: '$10M or more CAD', points: 18 },
        ],
    },
    {
        id: 'Q3_EUPull',
        text: 'Are European customers already finding you?',
        type: 'score',
        options: [
            { label: 'Yes - we have paying customers in Europe', points: 15 },
            { label: 'Inbound interest or sign-ups, not yet paying', points: 11 },
            { label: 'No inbound yet, but we see the demand', points: 5 },
            { label: 'None of this yet', points: 0 },
        ],
    },
    {
        id: 'Q4_Budget',
        text: 'How is the expansion funded?',
        type: 'score',
        options: [
            { label: 'Budget is already ring-fenced for it', points: 15 },
            { label: '18+ months of runway, not yet allocated', points: 11 },
            { label: 'Under 18 months - we would need to raise or reallocate', points: 5 },
            { label: 'No budget identified yet', points: 0 },
        ],
    },
    {
        id: 'Q5_Stage',
        text: 'What stage is your company at?',
        type: 'score',
        options: [
            { label: 'Series C', points: 12, cap: null },
            { label: 'Series B', points: 12, cap: null },
            { label: 'Series A', points: 10, cap: null },
            { label: 'Seed', points: 5, cap: 6.0 },
            { label: 'Pre-seed', points: 2, cap: 4.0 },
        ],
    },
    {
        id: 'Q6_Owner',
        text: 'Who owns the European expansion internally?',
        type: 'score',
        options: [
            { label: 'A dedicated leader is assigned to it', points: 10 },
            { label: 'Someone owns it part-time', points: 6 },
            { label: 'A founder would drive it ad hoc', points: 3 },
            { label: 'No one identified yet', points: 0 },
        ],
    },
    {
        id: 'Q7_Compliance',
        text: 'How ready is your data and compliance posture for the EU?',
        type: 'score',
        options: [
            { label: 'Already aligned to GDPR-grade standards', points: 5 },
            { label: 'Low-sensitivity product - minimal compliance lift needed', points: 4 },
            { label: 'We handle regulated or personal data - work still needed', points: 2 },
            { label: 'Unsure', points: 1 },
        ],
    },
    {
        id: 'Q8_Priority',
        text: 'How central is Europe to your next 24 months?',
        type: 'score',
        options: [
            { label: 'A core priority', points: 5 },
            { label: 'One of several growth bets', points: 3 },
            { label: 'Exploratory for now', points: 1 },
        ],
    },
    {
        id: 'Q9_Funding',
        text: 'How is your company funded today?',
        type: 'route',
        options: [
            { label: 'Bootstrapped or revenue-funded', route: 'nondilutive' },
            { label: 'Angel-backed', route: 'blend' },
            { label: 'VC-backed', route: 'vc' },
            { label: 'Grant-funded already', route: 'nondilutive' },
        ],
    },
    {
        id: 'Q10_Language',
        text: 'What languages does your product ship in today?',
        type: 'route',
        options: [
            { label: 'English only', market: 'NL' },
            { label: 'English plus German', market: 'DE' },
            { label: 'English plus another EU language', market: 'NL' },
            { label: 'Multilingual including German', market: 'DE' },
        ],
    },
    {
        id: 'Q11_Industry',
        text: 'What is your industry?',
        type: 'route',
        options: [
            { label: 'Fintech or payments', market: 'NL', brief: 'fintech' },
            { label: 'B2B SaaS', market: 'NL', brief: 'saas' },
            { label: 'AI', market: 'NL', brief: 'ai' },
            { label: 'Cloud or security', market: null, brief: 'cloud' },
            { label: 'Healthtech', market: 'DE', brief: 'healthtech' },
            { label: 'Greentech or cleantech', market: 'DE', brief: 'greentech' },
            { label: 'Industrial, manufacturing, or deep tech', market: 'DE', brief: null },
        ],
    },
    {
        id: 'Q12_Segment',
        text: 'Who are you selling to?',
        type: 'route',
        options: [
            { label: 'SMB', market: 'NL' },
            { label: 'Mid-market', market: 'NL' },
            { label: 'Enterprise', market: 'DE' },
        ],
    },
    {
        id: 'Q13_GoToMarket',
        text: 'How do you plan to serve the European market?',
        type: 'route',
        options: [
            { label: 'Build a local team and localise', market: 'DE' },
            { label: 'Open to a local presence eventually', market: null },
            { label: 'Serve from Canada, English-first', market: 'NL' },
        ],
    },
];

// ─── State ──────────────────────────────────

const state = {
    currentIndex: 0,
    answers: {},       // { Q1_PMF: { label, points, cap, market, route, brief }, ... }
    score: null,
    band: null,
    market: null,
    fundingRoute: null,
    sectorBrief: null,
};

// ─── Engine 1: Scoring ───────────────────────

function calculateScore() {
    const scoredQuestions = QUESTIONS.filter(q => q.type === 'score');
    let rawSum = 0;
    let hardCap = null; // lowest cap wins

    for (const q of scoredQuestions) {
        const answer = state.answers[q.id];
        if (!answer) continue;
        rawSum += answer.points || 0;
        if (answer.cap !== null && answer.cap !== undefined) {
            if (hardCap === null || answer.cap < hardCap) {
                hardCap = answer.cap;
            }
        }
    }

    let score = rawSum / 10;
    score = Math.round(score * 10) / 10;

    if (hardCap !== null) {
        score = Math.min(score, hardCap);
    }

    score = Math.max(0, Math.min(10, score));

    let band;
    if (score < 5.0) band = 'not-ready';
    else if (score < 7.0) band = 'start-planning';
    else band = 'talk-to-us';

    state.score = score;
    state.band = band;
    return { score, band };
}

// ─── Engine 2: Routing ───────────────────────

function calculateRouting() {
    let nlCount = 0;
    let deCount = 0;
    let fundingRoute = 'blend';
    let sectorBrief = null;

    const routingQids = ['Q10_Language', 'Q11_Industry', 'Q12_Segment', 'Q13_GoToMarket'];

    for (const qid of routingQids) {
        const answer = state.answers[qid];
        if (!answer) continue;
        if (answer.market === 'NL') nlCount++;
        if (answer.market === 'DE') deCount++;
        if (answer.brief) sectorBrief = answer.brief;
    }

    // Q9 sets funding route
    const q9 = state.answers['Q9_Funding'];
    if (q9 && q9.route) fundingRoute = q9.route;

    let market;
    if (nlCount > deCount) market = 'NL';
    else if (deCount > nlCount) market = 'DE';
    else market = 'NL_THEN_DE'; // tiebreak: NL first

    state.market = market;
    state.fundingRoute = fundingRoute;
    state.sectorBrief = sectorBrief;
    return { market, fundingRoute, sectorBrief };
}

// ─── Result copy helpers ─────────────────────

function getBandCopy(band, score) {
    const s = score.toFixed(1);
    if (band === 'not-ready') {
        return {
            headline: `You scored ${s}/10`,
            body: `Europe is a real ambition, and right now the foundations are not quite under it. Nothing is worse than spending a year and a budget on a market before the home base is solid. Lock in product-market fit in Canada, get an owner on the expansion, and come back. When you do, our Diagnostic will size the opportunity properly.`,
            resource: `<a href="https://www.bdc.ca/en/articles-tools/marketing-sales-export/marketing/how-to-find-markets-for-your-new-product" target="_blank" rel="noopener">Read this BDC article</a> to strengthen your foundations. Let us know if you'd like us to connect you with Canadian advisors who can help on the way.`,
            cta: 'https://www.bdc.ca/en/articles-tools/marketing-sales-export/marketing/how-to-find-markets-for-your-new-product',
            ctaLabel: 'Read the BDC guide',
            cta2: 'https://www.linkedin.com/company/the-oxford-comma-agency/',
            ctaLabel2: 'Follow us on LinkedIn',
        };
    }
    if (band === 'start-planning') {
        return {
            headline: `You scored ${s}/10`,
            body: `You have a real shot at Europe, and the smart move now is to plan before you leap. The question is not whether, it is which market - and what the opportunity is actually worth in revenue. That is exactly what a Diagnostic answers: a go or no-go on one market, sized in revenue, in two to three weeks.`,
            resource: null,
            cta: 'mailto:contact@theoxfordcomma.agency?subject=Diagnostic%20enquiry',
            ctaLabel: 'Start with a Diagnostic',
        };
    }
    // talk-to-us
    return {
        headline: `You scored ${s}/10`,
        body: `You are ready. You have the product, the proof, and the means to make Europe work - and the cost of waiting is a competitor getting there first. Below is where we would start you and who would help fund it.`,
        resource: null,
        cta: 'mailto:contact@theoxfordcomma.agency?subject=Ready%20to%20launch%20in%20Europe',
        ctaLabel: 'Let\'s build the plan',
    };
}

function getMarketCopy(market) {
    if (market === 'NL') {
        return {
            flag: '🇳🇱',
            name: 'Netherlands',
            partner: 'NFIA (Netherlands Foreign Investment Agency)',
            body: 'For a company like yours, the Netherlands is the smart first move. English is everywhere, the landing is fast, and you can test the European waters without a heavy localisation bill. It is the beachhead that sets up the bigger markets next.',
            grants: 'WBSO R&D tax credit, Invest-NL, Horizon Europe',
        };
    }
    if (market === 'DE') {
        return {
            flag: '🇩🇪',
            name: 'Germany',
            partner: 'Berlin Partner für Wirtschaft und Technologie',
            body: 'For a company like yours, Germany is the prize worth the work. It is the largest economy in Europe and the deepest market for what you sell. Companies that win there commit to the language and the longer sale - you are built for that.',
            grants: 'Horizon Europe, EXIST, Berlin regional grants',
        };
    }
    // NL_THEN_DE
    return {
        flag: '🇳🇱→🇩🇪',
        name: 'Netherlands, then Germany',
        partner: 'NFIA for your first market, Berlin Partner as you scale',
        body: 'Start in the Netherlands, then take Germany next. The lighter landing proves the model and de-risks the market that really moves your numbers.',
        grants: 'WBSO R&D tax credit, Invest-NL, Horizon Europe - with German grant eligibility as you expand',
    };
}

function getFundingCopy(route) {
    if (route === 'nondilutive') return 'Given how you\'re funded, we\'d lead with non-dilutive grants - there\'s money on the table most founders never find on their own.';
    if (route === 'vc') return 'We\'d pair the soft-landing partner support with local follow-on investor introductions - the kind that only come through warm relationships.';
    return 'We\'d blend non-dilutive grant support with soft-landing partner introductions - the right mix for where you are today.';
}

// ─── UI helpers ─────────────────────────────

const LIGHT_BG_SCREENS = ['screen-questions', 'screen-result'];

function showScreen(id) {
    document.querySelectorAll('.quiz-screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');

    const nav = document.getElementById('navbar');
    if (nav) {
        if (LIGHT_BG_SCREENS.includes(id)) {
            nav.classList.add('scrolled');
        } else if (window.scrollY <= 40) {
            nav.classList.remove('scrolled');
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(index) {
    const total = QUESTIONS.length;
    const pct = Math.round((index / total) * 100);
    const bar = document.getElementById('progressBar');
    const label = document.getElementById('progressLabel');
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = `${index} of ${total}`;
}

// ─── Render a question screen ────────────────

function renderQuestion(index) {
    const q = QUESTIONS[index];
    const container = document.getElementById('questionContainer');
    const prevAnswer = state.answers[q.id];

    const optionsHTML = q.options.map((opt, i) => {
        const isSelected = prevAnswer && prevAnswer.label === opt.label;
        return `
      <button
        class="quiz-option${isSelected ? ' selected' : ''}"
        data-index="${i}"
        onclick="selectOption(${index}, ${i})"
      >
        <span class="option-marker"></span>
        <span class="option-text">${opt.label}</span>
      </button>
    `;
    }).join('');

    container.innerHTML = `
    <div class="question-wrap">
      <div class="question-type-tag">${q.type === 'score' ? 'Readiness' : 'Your profile'}</div>
      <h2 class="question-text">${q.text}</h2>
      <div class="options-list">
        ${optionsHTML}
      </div>
      <div class="question-nav">
        ${index > 0 ? `<button class="quiz-back-btn" onclick="goBack()">← Back</button>` : '<span></span>'}
        <button
          class="quiz-next-btn"
          id="nextBtn"
          onclick="goNext()"
          ${prevAnswer ? '' : 'disabled'}
        >
          ${index < QUESTIONS.length - 1 ? 'Next →' : 'See my score →'}
        </button>
      </div>
    </div>
  `;

    updateProgress(index);
}

// ─── Option selection ────────────────────────

function selectOption(questionIndex, optionIndex) {
    const q = QUESTIONS[questionIndex];
    const opt = q.options[optionIndex];

    state.answers[q.id] = { ...opt, label: opt.label };

    // Update UI - highlight selected, enable next
    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
        btn.classList.toggle('selected', i === optionIndex);
    });

    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.disabled = false;
}

// ─── Navigation ──────────────────────────────

function goNext() {
    const q = QUESTIONS[state.currentIndex];
    if (!state.answers[q.id]) return;

    if (state.currentIndex < QUESTIONS.length - 1) {
        state.currentIndex++;
        renderQuestion(state.currentIndex);
    } else {
        // All questions answered - calculate and show score reveal
        calculateScore();
        calculateRouting();
        showScoreReveal();
    }
}

function goBack() {
    if (state.currentIndex > 0) {
        state.currentIndex--;
        renderQuestion(state.currentIndex);
    }
}

// ─── Score reveal screen ─────────────────────

function showScoreReveal() {
    showScreen('screen-score');
    const { score, band } = state;
    const copy = getBandCopy(band, score);

    // Animate counter
    const counter = document.getElementById('scoreCounter');
    const bandLabel = document.getElementById('scoreBand');
    const scoreBody = document.getElementById('scoreBody');
    const scoreRes = document.getElementById('scoreResource');

    // Band label + colour
    const bandMeta = {
        'not-ready': { label: 'Not ready yet', cls: 'band-low' },
        'start-planning': { label: 'Start planning', cls: 'band-mid' },
        'talk-to-us': { label: 'Talk to us now', cls: 'band-high' },
    };
    const meta = bandMeta[band];

    if (bandLabel) {
        bandLabel.textContent = meta.label;
        bandLabel.className = 'score-band-label ' + meta.cls;
    }
    if (scoreBody) scoreBody.textContent = copy.body;
    if (scoreRes) {
        if (copy.resource) {
            scoreRes.innerHTML = copy.resource;
            scoreRes.style.display = 'block';
        } else {
            scoreRes.style.display = 'none';
        }
    }

    // Animate number counting up
    if (counter) {
        let current = 0;
        const target = score;
        const duration = 1200;
        const steps = 40;
        const increment = target / steps;
        const interval = duration / steps;
        const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            counter.textContent = current.toFixed(1);
            if (current >= target) clearInterval(timer);
        }, interval);
    }
}

// ─── Email gate submission ───────────────────

function submitEmail() {
    const input = document.getElementById('emailInput');
    const btn = document.getElementById('emailSubmitBtn');
    const errEl = document.getElementById('emailError');
    const email = input ? input.value.trim() : '';

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errEl) {
            errEl.textContent = 'Please enter a valid email address.';
            errEl.style.display = 'block';
        }
        return;
    }

    if (errEl) errEl.style.display = 'none';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    // Build payload
    const payload = {
        email,
        score: state.score,
        band: state.band,
        market: state.market,
        fundingRoute: state.fundingRoute,
        sectorBrief: state.sectorBrief,
    };
    // Attach all question answers
    for (const q of QUESTIONS) {
        const ans = state.answers[q.id];
        payload[q.id] = ans ? ans.label : '';
    }

    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
        .then(r => r.json())
        .then(() => {
            showFullResult();
        })
        .catch(() => {
            // If submission fails, still show the result - don't block the user
            showFullResult();
        });
}

// ─── Full result screen ──────────────────────

function showFullResult() {
    showScreen('screen-result');

    const bandCopy = getBandCopy(state.band, state.score);
    const marketCopy = getMarketCopy(state.market);
    const fundCopy = getFundingCopy(state.fundingRoute);

    // Market block
    const marketName = document.getElementById('resultMarketName');
    const marketFlag = document.getElementById('resultMarketFlag');
    const marketBody = document.getElementById('resultMarketBody');
    const marketPartner = document.getElementById('resultMarketPartner');
    const marketGrants = document.getElementById('resultMarketGrants');

    if (marketName) marketName.textContent = marketCopy.name;
    if (marketFlag) marketFlag.textContent = marketCopy.flag;
    if (marketBody) marketBody.textContent = marketCopy.body;
    if (marketPartner) marketPartner.textContent = marketCopy.partner;
    if (marketGrants) marketGrants.textContent = marketCopy.grants;

    // Funding copy
    const fundEl = document.getElementById('resultFundingCopy');
    if (fundEl) fundEl.textContent = fundCopy;

    // CTA
    const ctaEl = document.getElementById('resultCta');
    const ctaLabel = document.getElementById('resultCtaLabel');
    if (ctaEl && bandCopy.cta) {
        ctaEl.href = bandCopy.cta;
        ctaEl.target = bandCopy.cta.startsWith('mailto:') ? '_self' : '_blank';
        ctaEl.style.display = 'inline-flex';
    } else if (ctaEl) {
        ctaEl.style.display = 'none';
    }
    if (ctaLabel && bandCopy.ctaLabel) ctaLabel.textContent = bandCopy.ctaLabel;

    // Secondary CTA (e.g. LinkedIn follow for the "not ready" band)
    const cta2El = document.getElementById('resultCta2');
    const cta2Label = document.getElementById('resultCta2Label');
    if (cta2El && bandCopy.cta2) {
        cta2El.href = bandCopy.cta2;
        if (cta2Label) cta2Label.textContent = bandCopy.ctaLabel2;
        cta2El.style.display = 'inline-flex';
    } else if (cta2El) {
        cta2El.style.display = 'none';
    }

    // Sector brief download
    const briefBlock = document.getElementById('resultBriefBlock');
    const briefLink = document.getElementById('resultBriefLink');
    const briefName = document.getElementById('resultBriefName');

    const briefLabels = {
        fintech: 'Fintech & Payments',
        saas: 'B2B SaaS',
        ai: 'AI',
        cloud: 'Cloud & Security',
        healthtech: 'Healthtech',
        greentech: 'Greentech & Cleantech',
    };

    if (state.sectorBrief && briefBlock && briefLink) {
        const label = briefLabels[state.sectorBrief] || state.sectorBrief;
        if (briefName) briefName.textContent = label;
        // Brief PDFs: /briefs/{key}.pdf - placeholder until files exist
        briefLink.href = `/briefs/${state.sectorBrief}.pdf`;
        briefBlock.style.display = 'block';
    } else if (briefBlock) {
        briefBlock.style.display = 'none';
    }

    // Score summary in result header
    const resultScoreEl = document.getElementById('resultScoreSummary');
    if (resultScoreEl) {
        resultScoreEl.textContent = `${state.score.toFixed(1)}/10 - ${state.band === 'not-ready' ? 'Not ready yet' : state.band === 'start-planning' ? 'Start planning' : 'Talk to us now'}`;
    }
}

// ─── Start / restart ─────────────────────────

function startQuiz() {
    // Reset state
    state.currentIndex = 0;
    state.answers = {};
    state.score = null;
    state.band = null;
    state.market = null;
    state.fundingRoute = null;
    state.sectorBrief = null;

    showScreen('screen-questions');
    renderQuestion(0);
    updateProgress(0);
}

function restartQuiz() {
    startQuiz();
}
