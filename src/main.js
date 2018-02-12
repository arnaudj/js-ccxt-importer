#!/usr/bin / env node
/**
 * npm start -- -i (-p http://proxyadress/baseproxyscripturl/)
 */
'use strict';

const cli = require('commander');
var assert = require('assert');
const log = console.log;
cli
  .version('0.1.0')
  .option('-i, --import <exchange>', 'Import for exchange')
  .option('-p, --proxy [proxyAddress]', 'Proxy URL')
  .option('-l, --list', 'List supported exchanges')
  .parse(process.argv);

var ccxt = require('ccxt');

if (cli.list) {
  log(ccxt.exchanges);
  process.exit();
}
else if (cli.import) {
  assert(cli.import !== '');
  assert(cli.proxy !== '' && cli.proxy.startsWith('http'), `Invalid proxy: '${cli.proxy}'`);
  runForExchange(cli.import);
}
else if (!cli.import) {
  log("Nothing to do");
  process.exit();
}

async function runForExchange(exchangeName) {
  log(`* Exchange: ${exchangeName}`);
  let exchange = new ccxt[exchangeName]();
  
  log(`Loading ${exchangeName}...`);
  exchange.proxy = cli.proxy || undefined;

  await exchange.loadMarkets();
  log(`* Loaded ${exchangeName}`);
  log(`> ${exchange.symbols}!`);
}