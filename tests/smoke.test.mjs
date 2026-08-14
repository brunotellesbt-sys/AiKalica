// Teste de fumaça sem navegador: valida dados, roteiro e o motor de batalha.
// Execute com: npm test

import assert from 'node:assert/strict';

import { CHARACTERS, HERO_JUTSU, STYLE_JUTSU, ELEMENTS, elementMultiplier } from '../src/data/characters.js';
import { JUTSU, TEAM_JUTSU } from '../src/data/jutsu.js';
import { ITEMS, SHOP_STOCK } from '../src/data/items.js';
import { ENEMIES, ENCOUNTERS } from '../src/data/enemies.js';
import { STATUS } from '../src/systems/effects.js';
import { SCENES, START_SCENE, validateScenes } from '../src/data/story/index.js';
import { ENDINGS, pickEnding } from '../src/data/story/endings.js';
import { newRecord, grantExp, statOf, maxHp, expToNext } from '../src/systems/progression.js';
import {
  createBattle, resolveAction, aiAction, turnOrder, endRound, checkEnd, battleRewards,
} from '../src/systems/battle.js';
import { newGame, state, recruit, addItem, itemCount, addBond, bond, karmaBalance } from '../src/core/state.js';
import { setSeed } from '../src/core/rng.js';

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    results.push(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    results.push(`  ✗ ${name}\n      ${err.message}`);
  }
}

function section(name) {
  results.push(`\n${name}`);
}

// ============================================================ dados ==========
section('Dados');

test('todo jutsu de personagem existe no catálogo', () => {
  for (const c of Object.values(CHARACTERS)) {
    for (const id of c.jutsu || []) {
      assert.ok(JUTSU[id], `${c.id} referencia jutsu inexistente: ${id}`);
    }
  }
  for (const [elem, list] of Object.entries(HERO_JUTSU)) {
    assert.ok(ELEMENTS[elem], `elemento desconhecido: ${elem}`);
    for (const id of list) assert.ok(JUTSU[id], `HERO_JUTSU.${elem} → ${id} inexistente`);
  }
  for (const list of Object.values(STYLE_JUTSU)) {
    for (const id of list) assert.ok(JUTSU[id], `STYLE_JUTSU → ${id} inexistente`);
  }
});

test('todo jutsu de inimigo existe no catálogo', () => {
  for (const e of Object.values(ENEMIES)) {
    for (const id of e.jutsu || []) assert.ok(JUTSU[id], `${e.id} referencia jutsu inexistente: ${id}`);
  }
});

test('todo drop e item de loja existe', () => {
  for (const e of Object.values(ENEMIES)) {
    for (const d of e.drops || []) assert.ok(ITEMS[d.id], `${e.id} dropa item inexistente: ${d.id}`);
  }
  for (const [tier, list] of Object.entries(SHOP_STOCK)) {
    for (const id of list) assert.ok(ITEMS[id], `loja nível ${tier} vende item inexistente: ${id}`);
  }
});

test('todo status referenciado por jutsu existe', () => {
  const all = [...Object.values(JUTSU), ...Object.values(TEAM_JUTSU)];
  for (const j of all) {
    for (const e of [...(j.apply || []), ...(j.selfApply || [])]) {
      assert.ok(STATUS[e.status], `${j.id} aplica status inexistente: ${e.status}`);
    }
  }
  for (const it of Object.values(ITEMS)) {
    for (const e of it.effect?.apply || []) {
      assert.ok(STATUS[e.status], `${it.id} aplica status inexistente: ${e.status}`);
    }
    for (const s of it.effect?.cure || []) {
      assert.ok(STATUS[s], `${it.id} cura status inexistente: ${s}`);
    }
  }
});

test('membros de jutsu combinado são personagens reais', () => {
  for (const c of Object.values(TEAM_JUTSU)) {
    for (const m of c.members) assert.ok(CHARACTERS[m], `combo ${c.id} usa personagem inexistente: ${m}`);
  }
});

test('encontros referenciam inimigos existentes', () => {
  for (const [id, enc] of Object.entries(ENCOUNTERS)) {
    for (const f of enc.foes) assert.ok(ENEMIES[f], `encontro ${id} usa inimigo inexistente: ${f}`);
  }
});

test('cadeia elemental é um ciclo fechado de 5', () => {
  assert.equal(elementMultiplier('fire', 'wind'), 1.5);
  assert.equal(elementMultiplier('wind', 'fire'), 0.65);
  assert.equal(elementMultiplier('water', 'fire'), 1.5);
  assert.equal(elementMultiplier('fire', 'lightning'), 1);
  assert.equal(elementMultiplier('none', 'fire'), 1);
  let el = 'fire';
  const seen = new Set();
  for (let i = 0; i < 5; i++) {
    seen.add(el);
    el = { fire: 'wind', wind: 'lightning', lightning: 'earth', earth: 'water', water: 'fire' }[el];
  }
  assert.equal(seen.size, 5);
  assert.equal(el, 'fire');
});

// =========================================================== roteiro =========
section('Roteiro');

test('cena inicial existe', () => {
  assert.ok(SCENES[START_SCENE], 'cena inicial ausente');
});

test('todos os destinos de cena existem', () => {
  const problems = validateScenes();
  assert.equal(problems.length, 0, problems.join('\n      '));
});

test('toda batalha do roteiro usa inimigos válidos', () => {
  const walk = (nodes, sceneId) => {
    for (const n of nodes || []) {
      if (!n || typeof n !== 'object') continue;
      if (n.t === 'battle') {
        assert.ok(Array.isArray(n.foes) && n.foes.length, `${sceneId}: batalha sem inimigos`);
        for (const f of n.foes) assert.ok(ENEMIES[f], `${sceneId}: inimigo inexistente ${f}`);
      }
      if (n.t === 'join') assert.ok(CHARACTERS[n.id], `${sceneId}: join de personagem inexistente ${n.id}`);
      if (n.t === 'give') assert.ok(ITEMS[n.item], `${sceneId}: give de item inexistente ${n.item}`);
      if (n.t === 'ending') assert.ok(ENDINGS[n.id], `${sceneId}: final inexistente ${n.id}`);
      if (n.t === 'choice') for (const o of n.options || []) walk(o.then, sceneId);
      if (n.t === 'if') { walk(n.then, sceneId); walk(n.else, sceneId); }
      if (n.t === 'battle') walk(n.then, sceneId);
    }
  };
  for (const [id, sc] of Object.entries(SCENES)) walk(sc.nodes, id);
});

test('toda cena é alcançável a partir do início', () => {
  const reachable = new Set([START_SCENE]);
  const queue = [START_SCENE];
  const collect = (nodes, out) => {
    for (const n of nodes || []) {
      if (!n || typeof n !== 'object') continue;
      if (n.t === 'go') out.push(n.scene);
      if (n.t === 'battle' && n.loseGoto) out.push(n.loseGoto);
      if (n.t === 'choice') for (const o of n.options || []) { if (o.goto) out.push(o.goto); collect(o.then, out); }
      if (n.t === 'if') { collect(n.then, out); collect(n.else, out); }
      if (n.t === 'battle') collect(n.then, out);
    }
  };
  while (queue.length) {
    const id = queue.shift();
    const next = [];
    collect(SCENES[id]?.nodes, next);
    for (const n of next) if (n && !reachable.has(n)) { reachable.add(n); queue.push(n); }
  }
  const orphans = Object.keys(SCENES).filter((id) => !reachable.has(id));
  assert.equal(orphans.length, 0, `cenas órfãs: ${orphans.join(', ')}`);
});

test('todos os finais são alcançáveis pelo roteiro', () => {
  const reached = new Set();
  const collect = (nodes) => {
    for (const n of nodes || []) {
      if (!n || typeof n !== 'object') continue;
      if (n.t === 'ending') reached.add(n.id);
      if (n.t === 'choice') for (const o of n.options || []) collect(o.then);
      if (n.t === 'if') { collect(n.then); collect(n.else); }
      if (n.t === 'battle') collect(n.then);
    }
  };
  for (const sc of Object.values(SCENES)) collect(sc.nodes);
  for (const id of Object.keys(ENDINGS)) assert.ok(reached.has(id), `final "${id}" nunca é disparado`);
});

test('funções embutidas no roteiro rodam sem estourar', () => {
  // `cond` e `effects.run` só executariam em tempo de jogo; aqui elas são
  // exercitadas contra um estado real para pegar erro de digitação/campo ausente.
  newGame({ name: 'Sim', element: 'fire', style: 'ninjutsu' });
  recruit('naruto', 5); recruit('sakura', 5);
  let conds = 0, runs = 0;

  const walk = (nodes, sceneId) => {
    for (const n of nodes || []) {
      if (!n || typeof n !== 'object') continue;
      if (n.t === 'if' && typeof n.cond === 'function') { n.cond(state); conds++; }
      if (n.t === 'set' && typeof n.fn === 'function') { n.fn(state); runs++; }
      if (n.t === 'choice') {
        for (const o of n.options || []) {
          if (typeof o.cond === 'function') { o.cond(state); conds++; }
          if (typeof o.effects?.run === 'function') { o.effects.run(state); runs++; }
          walk(o.then, sceneId);
        }
      }
      if (n.t === 'if') { walk(n.then, sceneId); walk(n.else, sceneId); }
      if (n.t === 'battle') walk(n.then, sceneId);
    }
  };

  for (const [id, sc] of Object.entries(SCENES)) {
    try {
      walk(sc.nodes, id);
    } catch (err) {
      throw new Error(`cena "${id}": ${err.message}`);
    }
  }
  assert.ok(conds > 0, 'nenhuma condição avaliada — o teste não está cobrindo nada');
  assert.ok(runs > 0, 'nenhum efeito executado');
});

test('pickEnding cobre os casos principais', () => {
  const base = { flags: {}, roster: {}, bonds: {} };
  assert.equal(pickEnding({ ...base, flags: { villageFell: true } }, {}), 'fallen');
  assert.equal(pickEnding(base, { karma: -.8 }), 'shadow');
  assert.equal(pickEnding({ ...base, flags: { trueSealPath: true } }, { bondAvg: 70, karma: .5 }), 'dawn');
  assert.equal(pickEnding(base, { bondAvg: 60, karma: .1 }), 'bonds');
  assert.equal(pickEnding(base, { bondAvg: 5, karma: 0 }), 'lone');
});

// ======================================================== progressão ========
section('Progressão');

test('nova partida inicializa o protagonista', () => {
  newGame({ name: 'Testeiro', element: 'fire', style: 'ninjutsu' });
  assert.equal(state.hero.name, 'Testeiro');
  assert.equal(state.party.length, 1);
  assert.ok(state.roster.hero);
  assert.ok(state.roster.hero.hp > 0);
  assert.ok(state.roster.hero.jutsu.includes('greatFireball'), 'deve receber os jutsus de fogo');
  assert.ok(state.roster.hero.jutsu.includes('chakraSurge'), 'deve receber os jutsus do estilo');
});

test('estilo altera os atributos', () => {
  const tai = newRecord('hero', 5, { element: 'fire', style: 'taijutsu' });
  const nin = newRecord('hero', 5, { element: 'fire', style: 'ninjutsu' });
  assert.ok(statOf(tai, 'atk') > statOf(nin, 'atk'), 'taijutsu deve ter mais ATK');
  assert.ok(statOf(nin, 'nin') > statOf(tai, 'nin'), 'ninjutsu deve ter mais NIN');
  assert.ok(maxHp(tai) > maxHp(nin), 'taijutsu deve ter mais HP');
});

test('EXP sobe nível e ensina jutsus', () => {
  const rec = newRecord('sasuke', 1);
  const before = maxHp(rec);
  const report = grantExp(rec, expToNext(1) * 12);
  assert.ok(report.levels > 0, 'deveria subir pelo menos um nível');
  assert.equal(rec.level, report.to);
  assert.ok(maxHp(rec) > before, 'HP máximo deve crescer');
  assert.ok(rec.hp > 0);
  if (rec.level >= 6) assert.ok(report.learned.some((j) => j.id === 'greatFireball'), 'deveria aprender Grande Bola de Fogo');
});

test('elos e karma são limitados corretamente', () => {
  newGame({ name: 'X', element: 'wind', style: 'genjutsu' });
  addBond('naruto', 250);
  assert.equal(bond('naruto'), 100, 'elo satura em 100');
  addBond('naruto', -500);
  assert.equal(bond('naruto'), 0, 'elo não fica negativo');
  assert.equal(karmaBalance(), 0, 'karma começa neutro');
});

test('inventário adiciona e remove', () => {
  newGame({ name: 'X', element: 'water', style: 'ninjutsu' });
  addItem('kunai', 5);
  assert.equal(itemCount('kunai'), 8); // 3 iniciais + 5
  assert.ok(itemCount('naoExiste') === 0);
});

// ========================================================== batalha =========
section('Batalha');

function simulate(foeIds, level, { seed = 1, maxRounds = 200 } = {}) {
  setSeed(seed);
  const allies = state.party.map((id) => state.roster[id]);
  const battle = createBattle({ allies, foes: foeIds, level, difficulty: 'normal' });
  let result = null;
  let rounds = 0;
  while (!result && rounds < maxRounds) {
    rounds++;
    battle.round = rounds;
    for (const unit of turnOrder(battle)) {
      if (!unit.alive) continue;
      // Os dois lados jogam com a IA para conseguirmos simular sem interface.
      resolveAction(battle, unit, aiAction(battle, unit));
      result = checkEnd(battle);
      if (result) break;
    }
    if (result) break;
    endRound(battle);
    result = checkEnd(battle);
  }
  return { result, rounds, battle };
}

test('uma batalha simples termina com vencedor', () => {
  newGame({ name: 'Duelo', element: 'fire', style: 'taijutsu' });
  recruit('naruto', 6); recruit('sakura', 6); recruit('sasuke', 6);
  for (const rec of Object.values(state.roster)) rec.level = 6;
  const { result, rounds } = simulate(['banditThug', 'banditArcher'], 5);
  assert.ok(['win', 'lose'].includes(result), `resultado inesperado: ${result}`);
  assert.ok(rounds < 200, 'batalha não deve entrar em laço infinito');
});

test('time de nível adequado vence encontros comuns na maioria das vezes', () => {
  let wins = 0;
  const runs = 12;
  for (let i = 0; i < runs; i++) {
    newGame({ name: 'Bal', element: 'lightning', style: 'ninjutsu' });
    recruit('naruto', 8); recruit('sakura', 8); recruit('sasuke', 8);
    for (const rec of Object.values(state.roster)) {
      rec.level = 8;
      rec.hp = maxHp(rec);
    }
    const { result } = simulate(['banditThug', 'banditArcher', 'banditThug'], 7, { seed: 100 + i });
    if (result === 'win') wins++;
  }
  assert.ok(wins >= runs * 0.7, `esperado ≥70% de vitórias, obtido ${wins}/${runs}`);
});

test('chefe é significativamente mais difícil', () => {
  let wins = 0;
  const runs = 10;
  for (let i = 0; i < runs; i++) {
    newGame({ name: 'Chefe', element: 'wind', style: 'taijutsu' });
    recruit('naruto', 5); recruit('sakura', 5); recruit('sasuke', 5);
    for (const rec of Object.values(state.roster)) { rec.level = 5; rec.hp = maxHp(rec); }
    const { result } = simulate(['karasu'], 9, { seed: 500 + i });
    if (result === 'win') wins++;
  }
  assert.ok(wins < runs, 'um chefe acima do nível não deveria ser vitória garantida');
});

test('recompensas são positivas ao vencer', () => {
  newGame({ name: 'Rec', element: 'earth', style: 'ninjutsu' });
  recruit('naruto', 10); recruit('sakura', 10);
  for (const rec of Object.values(state.roster)) { rec.level = 10; rec.hp = maxHp(rec); }
  const { battle, result } = simulate(['banditThug'], 4, { seed: 7 });
  if (result === 'win') {
    const r = battleRewards(battle);
    assert.ok(r.exp > 0, 'EXP deve ser positiva');
    assert.ok(r.ryo >= 0);
  }
});

test('status de veneno causa dano ao longo do tempo', () => {
  newGame({ name: 'Tox', element: 'water', style: 'ninjutsu' });
  const battle = createBattle({ allies: [state.roster.hero], foes: ['dummy'], level: 1 });
  const target = battle.allies[0];
  target.status.push({ id: 'poison', turns: 3 });
  const before = target.hp;
  endRound(battle);
  assert.ok(target.hp < before, 'veneno deveria tirar HP');
});

test('substituição anula um golpe', () => {
  setSeed(42);
  newGame({ name: 'Sub', element: 'wind', style: 'taijutsu' });
  const battle = createBattle({ allies: [state.roster.hero], foes: ['banditThug'], level: 3 });
  const ally = battle.allies[0];
  const foe = battle.foes[0];
  ally.status.push({ id: 'subs', turns: 2 });
  const before = ally.hp;
  const events = resolveAction(battle, foe, { kind: 'jutsu', jutsuId: 'attack', targets: [ally.uid] });
  assert.equal(ally.hp, before, 'HP não deveria mudar com substituição ativa');
  assert.ok(events.some((e) => e.t === 'substitute'), 'deveria emitir evento de substituição');
});

test('fraqueza elemental aumenta o dano', () => {
  newGame({ name: 'Elem', element: 'water', style: 'ninjutsu' });
  const rec = state.roster.hero;
  rec.level = 10;

  const run = (foeId, seed) => {
    setSeed(seed);
    const b = createBattle({ allies: [rec], foes: [foeId], level: 10 });
    const foe = b.foes[0];
    const hp0 = foe.hp;
    resolveAction(b, b.allies[0], { kind: 'jutsu', jutsuId: 'waterBullet', targets: [foe.uid] });
    return hp0 - foe.hp;
  };

  // Média de várias amostras para tirar o ruído da variância/crítico.
  let weak = 0, neutral = 0;
  for (let i = 0; i < 40; i++) {
    weak += run('roguePupil', 1000 + i);      // inimigo de fogo → água é forte
    neutral += run('soundGenin', 1000 + i);   // sem elemento → neutro
  }
  assert.ok(weak > neutral, `água contra fogo deveria doer mais (${Math.round(weak)} vs ${Math.round(neutral)})`);
});

test('barra de Vontade de Fogo enche com o combate', () => {
  setSeed(3);
  newGame({ name: 'Will', element: 'fire', style: 'taijutsu' });
  const rec = state.roster.hero;
  rec.level = 8;
  const battle = createBattle({ allies: [rec], foes: ['banditThug'], level: 6 });
  assert.equal(battle.will, 0);
  resolveAction(battle, battle.allies[0], { kind: 'jutsu', jutsuId: 'attack', targets: [battle.foes[0].uid] });
  assert.ok(battle.will > 0, 'atacar deveria encher a Vontade de Fogo');
});

// ============================================================ saída =========
console.log(results.join('\n'));
console.log(`\n${passed} passaram, ${failed} falharam.\n`);
process.exit(failed ? 1 : 0);
