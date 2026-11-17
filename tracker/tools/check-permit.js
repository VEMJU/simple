/* Checks the permit study data after an edit:  node tracker/tools/check-permit.js */
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const js = f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
const { PERMIT: P, PERMIT_SIGNS: SIGNS, PERMIT_QUESTIONS: QS, PERMIT_MORE: MORE } =
  vm.runInNewContext(js('permit-data.js') + js('permit-questions.js') + js('permit-more.js') + ';({ PERMIT, PERMIT_SIGNS, PERMIT_QUESTIONS, PERMIT_MORE })');

const topics = new Set(P.topics.map(t => t.id)), unique = list => new Set(list).size === list.length;
assert(unique(QS.map(q => q.id)), 'two questions share an id');
assert(unique(QS.map(q => q.q + (q.sign || ''))), 'two questions are the same');
for (const q of QS) {
  assert(topics.has(q.t), `${q.id}: unknown topic ${q.t}`);
  assert(q.a.length === 4 && unique(q.a), `${q.id}: needs 4 different answers`);
  assert(q.q && q.why, `${q.id}: needs a question and a reason`);
  assert(!q.sign || SIGNS[q.sign], `${q.id}: unknown sign ${q.sign}`);
}
for (const q of QS) assert(MORE[q.id] || q.sign, `${q.id}: needs a second explanation in permit-more.js`);
for (const id of Object.keys(MORE)) assert(QS.some(q => q.id === id), `permit-more.js: no question ${id}`);
for (const t of P.topics) assert(QS.some(q => q.t === t.id) && t.know.length, `${t.id}: needs questions and a must-know list`);
const M = P.mock, nSigns = QS.filter(q => q.t === 'signs').length;
assert(M.pass <= M.aim && M.aim <= M.size && nSigns >= M.signs && QS.length - nSigns >= M.size - M.signs, 'mock test settings');

const tasks = [...P.days.flatMap(d => d.tasks), ...P.bring, ...P.papers];
assert(unique(tasks.map(t => t.id)), 'two tasks share an id');
for (const d of P.days) for (const id of d.topics) assert(topics.has(id), `day "${d.title}": unknown topic ${id}`);
for (const t of tasks) if (t.quiz && !['mock', 'missed'].includes(t.quiz)) for (const id of t.quiz.split(',')) assert(topics.has(id), `${t.id}: unknown topic ${id}`);
for (const id of topics) assert(P.days.some(d => d.topics.includes(id)), `topic ${id} is in no day`);
const shown = [...P.signGroups.flatMap(g => g.ids), ...P.signKinds.map(k => k[2])];
for (const id of shown) assert(SIGNS[id], `unknown sign ${id}`);
for (const id of Object.keys(SIGNS)) assert(shown.includes(id), `sign ${id} is never shown`);
assert(!isNaN(new Date(P.testDate)), 'test date');
for (const s of Object.values(SIGNS)) { const m = s.svg.match(/src="([^"]+)"/); assert(!m || fs.existsSync(path.join(__dirname, '..', m[1])), `missing picture for sign ${s.id}`); }

const count = id => QS.filter(q => q.t === id).length;
console.log(`ok: ${QS.length} questions (${P.topics.map(t => `${t.id} ${count(t.id)}`).join(', ')}), ${tasks.length} tasks, ${P.days.length} days, ${Object.keys(SIGNS).length} signs`);
console.log('minutes per day: ' + P.days.map(d => d.tasks.reduce((n, t) => n + t.min, 0)).join(', '));
