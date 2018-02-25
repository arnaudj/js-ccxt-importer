#!/usr/bin/env node
/**
 * setopt histignorespace
 * npm start -- -i (-p http://proxyadress/baseproxyscripturl/)
 */
'use strict';

const cli = require('commander');
const fs = require('fs');
var assert = require('assert');
var normalizer = require('./normalizer');
const log = console.log;
cli
  .version('0.1.0')
  .option('-i, --import <exchange>', 'Import for exchange')
  .option('-o, --output <file>', 'Json output file')
  .option('-n, --normalize <file>', 'Normalize json file to common format')
  .option('-p, --proxy [proxyAddress]', 'Proxy URL')
  .option('-l, --list', 'List supported exchanges')
  .option('-u, --uid <uid>', 'Credentials: exchange user id')
  .option('-k, --apikey <api key>', 'Credentials: API key')
  .option('-s, --apisecret <secret>', 'Credentials: API secret')
  .option('-v, --verbose', 'Enable ccxt verbose mode')
  .parse(process.argv);

var ccxt = require('ccxt');

if (cli.list) {
  log(ccxt.exchanges);
}
else if (cli.import) {
  runForExchange(cli.import, cli.output);
}
else if (cli.normalize) {
  normalizeJsonFile(cli.normalize, cli.output);
} else {
  cli.help()
}

function normalizeJsonFile(from, outputFileName) {
  const fromContent = fs.readFileSync(from);
  const json = JSON.parse(fromContent);

  const normalizedJson = normalizer.normalizeJson(json);
  const outStr = JSON.stringify(normalizedJson);

  if (outputFileName) {
    log('Exporting to %s', outputFileName);

    fs.writeFileSync(outputFileName, outStr, (err) => {
      if (err)
        throw err;
    });
  } else {
    log(outStr);
  }
}

async function runForExchange(exchangeName, outputFileName) {
  log(`* Exchange: ${exchangeName}`);
  let exchange = new ccxt[exchangeName]({ 'verbose': cli.verbose });

  log(`Loading ${exchangeName}...`);
  exchange.proxy = cli.proxy || undefined;
  assert(cli.proxy === undefined || cli.proxy.startsWith('http'), `Invalid proxy: '${cli.proxy}'`);

  await exchange.loadMarkets();
  log(`* Loaded ${exchangeName}: ${exchange.symbols.length} pairs: ${exchange.symbols}`);

  if (!exchange.has.fetchMyTrades) {
    log('Exchanges lacks fetchMyTrades capability');
    return;
  }

  exchange.uid = cli.uid || undefined;
  exchange.apiKey = cli.apikey || undefined;
  exchange.secret = cli.apisecret || undefined;

  if ([exchange.uid, exchange.apiKey, exchange.secret].some((e) => e === undefined)) {
    log('Missing your API uid/key/secret');
    return;
  }

  let limit = 1000;
  let trades = await exchange.fetchMyTrades(undefined, undefined, undefined, {limit: limit});
  let tradesStr = JSON.stringify(trades);
  log('Trades found: %d\n', trades.length);

  if (outputFileName) {
    log('Exporting to %s', outputFileName);

    fs.writeFileSync(outputFileName, tradesStr, (err) => {
      if (err)
        throw err;
    });
  } else {
    log(tradesStr);
  }

  log('Done.');

}