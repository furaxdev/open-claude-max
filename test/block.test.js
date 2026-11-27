// Tests du bloc d'instructions : insertion, mise à jour, retrait, marqueurs corrompus.
import assert from 'node:assert/strict';
import test from 'node:test';
import { END, START, buildBlock, hasBlock, removeBlock, upsertBlock } from '../src/block.js';
import { SKILLS } from '../src/skills.js';

const block = buildBlock(SKILLS);

test('le bloc est délimité par les marqueurs et cite chaque skill', () => {
  assert.ok(block.startsWith(START) && block.endsWith(END));
  for (const s of SKILLS) assert.ok(block.includes(`\`${s.name}\``), s.name);
  assert.ok(block.includes('Non affilié à Anthropic'));
});

test('insertion dans un fichier vide puis retrait redonne un fichier vide', () => {
  const text = upsertBlock('', block);
  assert.equal(text, `${block}\n`);
  assert.equal(removeBlock(text), '');
});

test("le contenu de l'utilisateur est conservé à l'insertion et au retrait", () => {
  const original = '# Mes règles\n\nToujours répondre en français.\n';
  const withBlock = upsertBlock(original, block);
  assert.ok(withBlock.startsWith(original.trimEnd()));
  assert.ok(hasBlock(withBlock));
  assert.equal(removeBlock(withBlock), original);
});

test('une deuxième insertion remplace le bloc au lieu de le dupliquer', () => {
  const once = upsertBlock('# Titre\n', block);
  const twice = upsertBlock(once, buildBlock(SKILLS.slice(0, 2)));
  assert.equal(twice.split(START).length - 1, 1);
  assert.ok(!twice.includes('`omax-chat`'));
  assert.equal(upsertBlock(once, block), once, 'idempotent');
});

test('du texte après le bloc est conservé au retrait', () => {
  const text = `Avant\n\n${block}\n\nAprès\n`;
  assert.equal(removeBlock(text), 'Avant\n\nAprès\n');
});

test('des marqueurs incohérents lèvent une erreur au lieu de modifier le fichier', () => {
  assert.throws(() => upsertBlock(`${START}\nsans fin`, block), /incohérents/);
  assert.throws(() => removeBlock(`${END}\n${START}`), /incohérents/);
});
