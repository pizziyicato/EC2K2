// Course translations are bundled locally. No source text is sent in a request.
const BUNDLE_URL = '/translations-zh.json?v=7';
const openStates = new Map();
const pendingControls = new Map();
const boundButtons = new WeakSet();
const textHashes = new Map();
let serial = 0;
let dictionary = null;
let dictionaryRequest = null;

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

class TranslationError extends Error {
  constructor(kind) { super(kind); this.kind = kind; }
}

async function loadDictionary(refresh = false) {
  if (dictionaryRequest) return dictionaryRequest;
  if (dictionary && !refresh) return dictionary;
  const request = (async () => {
    const response = await fetch(BUNDLE_URL, {
      credentials: 'same-origin', cache: 'no-store', redirect: 'error', headers: { Accept: 'application/json' }
    });
    if (response.status === 401 || response.status === 403) throw new TranslationError('account');
    if (!response.ok) throw new TranslationError('load');
    const data = await response.json();
    if (data?.version !== 1 || data?.language !== 'zh-Hans' || !data.entries ||
        typeof data.entries !== 'object' || Array.isArray(data.entries)) {
      throw new TranslationError('load');
    }
    return data.entries;
  })();
  dictionaryRequest = request;
  try {
    dictionary = await request;
    return dictionary;
  } finally {
    if (dictionaryRequest === request) dictionaryRequest = null;
  }
}

function hashText(text) {
  if (!textHashes.has(text)) {
    const promise = (async () => {
      if (!globalThis.crypto?.subtle) throw new TranslationError('hash');
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
    })();
    textHashes.set(text, promise);
    promise.catch(() => { if (textHashes.get(text) === promise) textHashes.delete(text); });
  }
  return textHashes.get(text);
}

/**
 * Return an inline control. Supply only text already permitted on this screen.
 * Labels are presentation text, not part of the dictionary lookup. Array order
 * is preserved, including the currently shuffled order of question choices.
 */
export function translationControl(key, segments, label = 'Translate question · 中文') {
  const parts = Array.isArray(segments) ? segments
    .filter(part => part && typeof part.text === 'string' && part.text.trim())
    .map(part => ({ text: part.text, label: typeof part.label === 'string' ? part.label : '' })) : [];
  if (!parts.length) return '';
  const identity = `ec2k2-translation-${++serial}`;
  const stateKey = String(key);
  const open = openStates.get(stateKey) === true;
  pendingControls.set(identity, { identity, key: stateKey, parts, open, run: 0 });
  return `<section class="inline-translation" data-translation-control="${identity}">
    <button type="button" class="translation-toggle" id="${identity}-button" data-translation-toggle="${identity}" aria-expanded="${open}" aria-controls="${identity}-panel">
      <span class="translation-label">${escape(label)}</span>
      <span class="translation-action" data-translation-action data-no-i18n>${open ? 'Hide translation / 隐藏译文' : 'Show translation / 显示译文'}</span>
    </button>
    <div class="translation-panel" id="${identity}-panel" data-translation-panel="${identity}" role="region" aria-labelledby="${identity}-button" data-no-i18n${open ? '' : ' hidden'}>
      <p class="translation-note"><span lang="en">Chinese translation for study support. If wording differs, use the English original.</span><br><span lang="zh-Hans">中文译文供辅助学习。如有差异，请以英文原文为准。</span></p>
      <div class="translation-content" data-translation-content aria-live="polite" aria-atomic="false"></div>
      <button type="button" class="translation-hide" data-translation-hide>Hide translation / 隐藏译文</button>
    </div>
  </section>`;
}

function stillActive(record, run) {
  const { button, container, panel, output, action } = record;
  return record.run === run && record.open && button.isConnected && container.isConnected &&
    container.dataset.translationControl === record.identity &&
    button.dataset.translationToggle === record.identity &&
    panel.dataset.translationPanel === record.identity &&
    button.getAttribute('aria-controls') === panel.id &&
    container.contains(button) && container.contains(panel) && panel.contains(output) &&
    button.contains(action) && !panel.hidden;
}

function status(record, message) {
  const paragraph = record.output.ownerDocument.createElement('p');
  paragraph.className = 'translation-status';
  paragraph.textContent = message;
  record.output.replaceChildren(paragraph);
}

function setOpen(record, open) {
  record.run += 1;
  record.open = open;
  openStates.set(record.key, open);
  record.button.setAttribute('aria-expanded', String(open));
  record.panel.hidden = !open;
  record.action.textContent = open ? 'Hide translation / 隐藏译文' : 'Show translation / 显示译文';
  if (open) void showTranslation(record);
  else record.output.setAttribute('aria-busy', 'false');
}

async function showTranslation(record, refresh = false) {
  const run = ++record.run;
  if (!stillActive(record, run)) return;
  record.output.setAttribute('aria-busy', 'true');
  status(record, 'Loading translation… / 正在加载译文…');
  try {
    const [entries, hashes] = await Promise.all([
      loadDictionary(refresh), Promise.all(record.parts.map(part => hashText(part.text)))
    ]);
    // Match full source content, never the question key or an old option order.
    const translations = hashes.map(hash => Object.hasOwn(entries, hash) ? entries[hash] : null);
    if (translations.some(text => typeof text !== 'string' || !text.trim())) throw new TranslationError('missing');
    if (!stillActive(record, run)) return;
    const doc = record.output.ownerDocument;
    const fragment = doc.createDocumentFragment();
    record.parts.forEach((part, index) => {
      const section = doc.createElement('div');
      section.className = 'translation-segment';
      if (part.label) {
        const heading = doc.createElement('p');
        heading.className = 'translation-segment-label';
        heading.textContent = part.label;
        section.append(heading);
      }
      const paragraph = doc.createElement('p');
      paragraph.className = 'translation-copy';
      paragraph.lang = 'zh-Hans';
      paragraph.textContent = translations[index];
      section.append(paragraph);
      fragment.append(section);
    });
    record.output.replaceChildren(fragment);
    record.output.setAttribute('aria-busy', 'false');
  } catch (error) {
    if (!stillActive(record, run)) return;
    record.output.setAttribute('aria-busy', 'false');
    const messages = {
      account: 'Sign in to your study account, then retry the translation. / 请先登录学习账户，再重试翻译。',
      missing: 'Some text is not translated in this version yet. Retry to check for an update, or continue with the English original. / 当前版本暂缺部分译文。请重试以检查更新，或继续阅读英文原文。',
      hash: 'Translation could not open in this browser. Reload the page and retry, or continue with the English original. / 此浏览器暂时无法打开译文。请刷新页面后重试，或继续阅读英文原文。',
      load: 'Translation could not load. Check your connection and retry, or continue with the English original. / 译文未能加载。请检查网络后重试，或继续阅读英文原文。'
    };
    status(record, messages[error?.kind] || messages.load);
    const retry = record.output.ownerDocument.createElement('button');
    retry.type = 'button';
    retry.className = 'translation-retry';
    retry.textContent = 'Retry translation / 重试翻译';
    retry.addEventListener('click', () => {
      if (stillActive(record, run)) void showTranslation(record, true);
    });
    record.output.append(retry);
  }
}

/** Bind after each HTML render. It is safe to call repeatedly on the same root. */
export function bindTranslations(root = document) {
  const buttons = [...root.querySelectorAll('[data-translation-toggle]')];
  if (root.matches?.('[data-translation-toggle]')) buttons.unshift(root);
  for (const button of buttons) {
    if (boundButtons.has(button)) continue;
    const identity = button.dataset.translationToggle;
    const record = pendingControls.get(identity);
    const container = button.closest('[data-translation-control]');
    const panel = container?.querySelector('[data-translation-panel]');
    const output = panel?.querySelector('[data-translation-content]');
    const hide = panel?.querySelector('[data-translation-hide]');
    const action = button.querySelector('[data-translation-action]');
    if (!record || container?.dataset.translationControl !== identity ||
        panel?.dataset.translationPanel !== identity || !output || !hide || !action) continue;
    Object.assign(record, { button, container, panel, output, action });
    pendingControls.delete(identity);
    boundButtons.add(button);
    button.addEventListener('click', () => setOpen(record, !record.open));
    hide.addEventListener('click', () => {
      setOpen(record, false);
      if (button.isConnected) button.focus({ preventScroll: true });
    });
    if (record.open) void showTranslation(record);
  }
}
