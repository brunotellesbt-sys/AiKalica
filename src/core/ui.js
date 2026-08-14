// Helpers de DOM, transições e efeitos de tela.

/**
 * Cria um elemento.
 * @param {string} tag  ex.: 'div.panel.big' ou 'button#go.btn'
 * @param {object} [props] atributos/propriedades (on* viram listeners)
 * @param {Array|string|Node} [kids]
 */
export function el(tag, props = {}, kids = []) {
  const [head, ...classes] = tag.split('.');
  const [name, id] = head.split('#');
  const node = document.createElement(name || 'div');
  if (id) node.id = id;
  if (classes.length) node.classList.add(...classes);

  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') node.classList.add(...String(v).split(/\s+/).filter(Boolean));
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in node && k !== 'list') node[k] = v;
    else node.setAttribute(k, v === true ? '' : v);
  }

  for (const kid of [].concat(kids)) {
    if (kid == null || kid === false) continue;
    node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return node;
}

/** Converte string SVG em nó. */
export function svgNode(markup) {
  const wrap = document.createElement('div');
  wrap.innerHTML = markup.trim();
  return wrap.firstElementChild;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Espera o próximo frame. */
export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

const app = () => document.getElementById('app');
const fxLayer = () => document.getElementById('fx-layer');

/** Troca a tela ativa com fade. */
export async function mount(node, { fade = true } = {}) {
  const root = app();
  if (fade) await fadeOut(220);
  clear(root);
  root.append(node);
  if (fade) await fadeIn(240);
  return node;
}

let fadeEl = null;
export async function fadeOut(ms = 260) {
  if (!fadeEl) {
    fadeEl = el('div.fx-fade');
    fxLayer().append(fadeEl);
  }
  fadeEl.style.transitionDuration = ms + 'ms';
  await nextFrame();
  fadeEl.classList.add('on');
  await wait(ms);
}

export async function fadeIn(ms = 260) {
  if (!fadeEl) return;
  fadeEl.style.transitionDuration = ms + 'ms';
  fadeEl.classList.remove('on');
  await wait(ms);
}

/** Flash branco (impacto, jutsu forte). */
export function flash(color = '#fff', ms = 320) {
  const f = el('div.fx-flash', { style: { background: color, animationDuration: ms + 'ms' } });
  fxLayer().append(f);
  setTimeout(() => f.remove(), ms + 40);
}

/** Tremor de tela. */
export function shake(ms = 340) {
  const root = app();
  root.classList.remove('shake');
  void root.offsetWidth; // reflow para reiniciar a animação
  root.classList.add('shake');
  setTimeout(() => root.classList.remove('shake'), ms);
}

/** Notificação curta no topo. */
export function toast(text, kind = 'info') {
  const layer = document.getElementById('toast-layer');
  const t = el(`div.toast.${kind}`, { text });
  layer.append(t);
  setTimeout(() => t.remove(), 2600);
}

/** Efeito de máquina de escrever; retorna { done, skip }. */
export function typewriter(node, text, speed = 22) {
  node.textContent = '';
  let i = 0;
  let cancelled = false;
  let timer = null;

  const done = new Promise((resolve) => {
    const step = () => {
      if (cancelled) return;
      // Escreve tags simples de uma vez para não "vazar" markup.
      node.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        resolve();
        return;
      }
      const ch = text[i - 1];
      const extra = /[.!?…]/.test(ch) ? speed * 6 : /[,;:]/.test(ch) ? speed * 3 : 0;
      timer = setTimeout(step, speed + extra);
    };
    if (!text.length) resolve();
    else step();
  });

  return {
    done,
    skip() {
      if (cancelled) return;
      cancelled = true;
      clearTimeout(timer);
      node.textContent = text;
    },
    get finished() {
      return i >= text.length;
    },
  };
}

/** Modal simples com botões. Resolve com o valor do botão escolhido. */
export function modal({ title, body, buttons = [{ label: 'OK', value: true }], dismissable = true }) {
  return new Promise((resolve) => {
    const wrap = el('div.modal-wrap');
    const close = (v) => {
      wrap.remove();
      document.removeEventListener('keydown', onKey);
      resolve(v);
    };
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissable) close(null);
    };
    const box = el('div.modal.panel', {}, [
      title && el('h3', { text: title }),
      typeof body === 'string' ? el('p', { text: body }) : body,
      el(
        'div.btn-row',
        { style: { marginTop: '12px', justifyContent: 'flex-end' } },
        buttons.map((b) =>
          el(`button.btn${b.primary ? '.primary' : b.ghost ? '.ghost' : ''}`, {
            text: b.label,
            onClick: () => close(b.value),
          })
        )
      ),
    ]);
    wrap.append(box);
    if (dismissable) {
      wrap.addEventListener('click', (e) => {
        if (e.target === wrap) close(null);
      });
    }
    document.addEventListener('keydown', onKey);
    app().append(wrap);
    box.querySelector('.btn')?.focus();
  });
}

/** Aguarda um clique/tecla de "avançar". Retorna função de cancelamento. */
export function onAdvance(node, handler) {
  const click = () => handler();
  const key = (e) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      handler();
    }
  };
  node.addEventListener('click', click);
  document.addEventListener('keydown', key);
  return () => {
    node.removeEventListener('click', click);
    document.removeEventListener('keydown', key);
  };
}
