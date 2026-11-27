#!/usr/bin/env node
// Rôle : point d'entrée du binaire `open-claude-max`.
// Dépend de : src/cli.js
import { main } from '../src/cli.js';

process.exitCode = await main(process.argv.slice(2));
