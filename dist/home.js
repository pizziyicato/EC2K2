const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const outward = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const instagram = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><circle cx="17.5" cy="6.7" r="1" fill="currentColor"/></svg>';
const github = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.07c-3.09.67-3.74-1.31-3.74-1.31-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1 2.31.7 3.25.3.1-.73.39-1.23.71-1.52-2.47-.28-5.06-1.24-5.06-5.49 0-1.21.43-2.2 1.14-2.98-.12-.28-.5-1.41.11-2.93 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.52.23 2.65.11 2.93.71.78 1.14 1.77 1.14 2.98 0 4.27-2.6 5.21-5.08 5.48.4.35.75 1.02.75 2.06V22c0 .3.2.64.77.53A11.1 11.1 0 0 0 12 .9Z"/></svg>';

const sections = [
  {
    route: 'ib400', number: '01', name: 'IB400', label: 'Build the foundation', count: '400', unit: 'questions',
    facts: ['5 choices', 'Tutorial → Exam → Challenge'],
    description: 'Practise the full EC2102 syllabus, from tutorial fundamentals to exam applications and challenging combinations. Use the feedback to find the missing step in your reasoning.',
    action: 'Open IB400'
  },
  {
    route: 'st100', number: '02', name: 'S&T100', label: 'Push your reasoning', count: '100', unit: 'questions',
    facts: ['6 choices', 'Beyond IB400 Challenge'],
    description: 'Harder synthesis questions combine mechanisms, calculations and awkward boundaries. Work out which assumptions matter before choosing an answer.',
    action: 'Open S&T100'
  },
  {
    route: 'pb20', number: '03', name: 'PB20', label: 'Follow the whole case', count: '20', unit: 'connected cases',
    facts: ['8 parts per case', '160 MCQs · 6 choices'],
    description: 'Carry one setup through eight related questions. Twelve affair-related cases examine fictional recovery budgets, work choices and service businesses. Eight US midterm cases examine spending, taxes, employment and monetary policy. All economic scenarios are hypothetical EC2102 models.',
    action: 'Explore PB20'
  },
  {
    route: 'decoded', number: '04', name: 'EC2102 Decoded', label: 'Understand the mechanism', count: '148', unit: 'concepts across 12 chapters',
    facts: ['Step-by-step derivations', '21 interactive experiments'],
    description: 'Build the equations and graphs one step at a time. Follow positive and negative changes separately, check what stays fixed, and explore zero effects, corners and other boundaries.',
    action: 'Explore Decoded'
  },
  {
    route: 'recaps', number: '05', name: 'Assoc. Prof Wong Wei Kang Recaps', label: 'Reconnect the tutorials', count: '120', unit: 'revision MCQs',
    facts: ['All 10 tutorials', '108 tutorial parts'],
    description: 'Revisit the reasoning behind the supplied tutorials through original questions mapped to their individual parts. Connect familiar exercises to the course models and test each step again.',
    action: 'Open Recaps'
  }
];

function sectionCard(section) {
  return `<a class="path-card home-path" href="#${section.route}" data-home-section="${section.route}">
    <div class="home-path-top"><span class="home-kicker">${section.label}</span><span class="home-index" aria-hidden="true">${section.number}</span></div>
    <h3>${section.name}</h3>
    <p class="home-path-count"><strong>${section.count}</strong><span>${section.unit}</span></p>
    <ul class="home-facts">${section.facts.map(fact => `<li>${fact}</li>`).join('')}</ul>
    <p class="home-path-description">${section.description}</p>
    <span class="home-path-action">${section.action}${arrow}</span>
  </a>`;
}

/** A public course guide; statsHtml is trusted markup supplied by the signed-in app. */
export function renderHome({signedIn = false, statsHtml = ''} = {}) {
  return `<div class="ec-home">
    <section class="home-hero" aria-labelledby="home-title">
      <div class="home-intro">
        <p class="home-kicker">EC2K2 · EC2102 Macroeconomic Analysis I</p>
        <h1 id="home-title">Make every curve<br><em>mean something.</em></h1>
        <p class="home-lead">Understand EC2102 through worked logic, interactive graphs and deliberate practice.</p>
        <div class="home-actions">
          <a class="home-button home-button-primary" href="${signedIn ? '#ib400' : '#account'}">${signedIn ? 'Start practising' : 'Log in / Sign up'}${arrow}</a>
          <a class="home-button home-button-secondary" href="${signedIn ? '#decoded' : '#ib400'}">${signedIn ? 'Explore Decoded' : 'Explore IB400'}${arrow}</a>
        </div>
        <p class="home-entry-note">${signedIn ? 'Learn a mechanism. Test it. Revisit what you missed.' : 'Sign in to open the banks and Decoded, and save your progress.'}</p>
      </div>
      <aside class="home-creator" aria-labelledby="home-creator-title">
        <div class="home-creator-heading"><span class="home-creator-mark" aria-hidden="true">p.</span><div><p class="home-kicker">Made by Ziyi</p><h2 id="home-creator-title">Beyond the graphs.</h2></div></div>
        <div class="home-profile-links">
          <a class="home-profile-link" href="https://www.instagram.com/pizziyicato/" target="_blank" rel="noopener noreferrer" aria-label="Visit pizziyicato on Instagram, opens in a new tab"><span class="home-profile-icon">${instagram}</span><span><strong>Instagram</strong><small>@pizziyicato</small></span>${outward}</a>
          <a class="home-profile-link" href="https://github.com/pizziyicato" target="_blank" rel="noopener noreferrer" aria-label="Visit pizziyicato on GitHub, opens in a new tab"><span class="home-profile-icon">${github}</span><span><strong>GitHub</strong><small>pizziyicato</small></span>${outward}</a>
        </div>
        <a class="home-repository" href="https://github.com/pizziyicato/EC2K2" target="_blank" rel="noopener noreferrer">Explore the EC2K2 repository${outward}<span class="home-sr">, opens in a new tab</span></a>
      </aside>
    </section>
    ${signedIn && statsHtml ? `<section class="home-progress" aria-label="Your study progress">${statsHtml}</section>` : ''}
    <section class="home-guide" aria-labelledby="home-guide-title">
      <div class="home-section-heading"><div><p class="home-kicker">Your guide to the site</p><h2 id="home-guide-title">Five sections. Different jobs.</h2></div><p>Choose the part that helps with<br class="home-desktop-break"> what you need to understand next.</p></div>
      <div class="home-path-grid">${sections.map(sectionCard).join('')}</div>
    </section>
    <section class="home-method" aria-labelledby="home-method-title">
      <div class="home-section-heading"><div><p class="home-kicker">A suggested study route</p><h2 id="home-method-title">From “why?” to “what if?”</h2></div><p>Move back a step whenever the explanation feels shaky.</p></div>
      <ol class="home-study-route">
        <li><a href="#decoded"><span class="home-route-number">1</span><strong>Understand</strong><span>Use Decoded to explain the mechanism in your own words.</span></a></li>
        <li><a href="#ib400"><span class="home-route-number">2</span><strong>Practise</strong><span>Start with IB400, then work through the difficulty levels.</span></a></li>
        <li><a href="#recaps"><span class="home-route-number">3</span><strong>Reconnect</strong><span>Use Recaps to revisit the reasoning in each tutorial.</span></a></li>
        <li><a href="#st100"><span class="home-route-number">4</span><strong>Stretch</strong><span>Use S&T100 to combine ideas and check difficult boundaries.</span></a></li>
        <li><a href="#pb20"><span class="home-route-number">5</span><strong>Apply</strong><span>Follow PB20’s connected cases as their assumptions change.</span></a></li>
      </ol>
    </section>
    <section class="home-practice-note" aria-label="Practice and account information">
      <div><span class="home-note-symbol" aria-hidden="true">↺</span><h2>Make each attempt useful.</h2><p>Every answer choice has an explanation. Strike through an option, restore it if you reconsider, and redo a question after checking the reasoning.</p></div>
      <div><span class="home-note-symbol" aria-hidden="true">↗</span><h2>Your study record.</h2><p>An account is required to use the study tools and save progress. The site owner can view account details and study activity, including pages visited and question attempts.</p><a href="#account" class="home-text-link">${signedIn ? 'Your account' : 'Log in / Sign up'}${arrow}</a></div>
    </section>
    <p class="home-independent">An independent EC2102 study companion. Not an official course platform or an endorsement by the university or lecturer.</p>
  </div>`;
}
