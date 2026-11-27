// Rôle : affichage terminal (couleurs, spinner) et lecture des réponses de l'utilisateur.
// Les réponses sont lues ligne par ligne, sur un terminal comme sur une entrée redirigée.
// Dépend de : node:readline.
import readline from 'node:readline';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function createUi({ stdin, stdout, env }) {
  const color = Boolean(stdout.isTTY) && !env.NO_COLOR;
  const paint = (code) => (text) => (color ? `\x1b[${code}m${text}\x1b[0m` : text);
  const style = { bold: paint(1), dim: paint(2), red: paint(31), green: paint(32), yellow: paint(33), cyan: paint(36) };

  const println = (text = '') => stdout.write(`${text}\n`);

  // File d'attente de lignes : aucune réponse n'est perdue si l'entrée est redirigée d'un coup.
  const rl = readline.createInterface({ input: stdin, terminal: false });
  const lines = [];
  const waiters = [];
  let closed = false;
  rl.on('line', (line) => (waiters.length ? waiters.shift()(line) : lines.push(line)));
  rl.on('close', () => {
    closed = true;
    while (waiters.length) waiters.shift()(null);
  });

  // Renvoie null si l'entrée est terminée sans réponse.
  function ask(question) {
    stdout.write(question);
    return new Promise((resolve) => {
      if (lines.length) resolve(lines.shift());
      else if (closed) resolve(null);
      else waiters.push(resolve);
    });
  }

  async function spinner(label, task) {
    const done = (mark) => (stdout.isTTY ? stdout.write(`\r\x1b[K${mark} ${label}\n`) : println(`${mark} ${label}`));
    let timer = null;
    if (stdout.isTTY) {
      let i = 0;
      timer = setInterval(() => stdout.write(`\r${style.cyan(FRAMES[i++ % FRAMES.length])} ${label}`), 80);
    } else {
      println(`... ${label}`);
    }
    try {
      const result = await task();
      clearInterval(timer);
      done(style.green('✔'));
      return result;
    } catch (err) {
      clearInterval(timer);
      done(style.red('✖'));
      throw err;
    }
  }

  return { style, println, ask, spinner, close: () => rl.close() };
}
