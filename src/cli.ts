#!/usr/bin/env node
import { translate } from "./main";
const { Command } = require('commander');
const program = new Command();
program.version('0.0.1')
    .name("translate")
    .usage("<English>")
    .arguments("<English>")
    .action(function (english: string) {
        translate(english)

    });
program.parse(process.argv);