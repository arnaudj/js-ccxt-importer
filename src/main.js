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
  .option('-u, --uid <uid>', 'Credentials: exchange user id')
  .option('-k, --apikey <api key>', 'Credentials: API key')
  .option('-s, --apisecret <secret>', 'Credentials: API secret')
  .parse(process.argv);

var ccxt = require('ccxt');

if (cli.list) {
  log(ccxt.exchanges);
}
else if (cli.import) {
  assert(cli.import !== '');

  try {
    runForExchange(cli.import);
  } catch (e) {
    log('Exception: ', e);
  }
}

async function runForExchange(exchangeName) {
  log(`* Exchange: ${exchangeName}`);
  let exchange = new ccxt[exchangeName]();

  log(`Loading ${exchangeName}...`);
  exchange.proxy = cli.proxy || undefined;
  assert(cli.proxy === undefined || cli.proxy.startsWith('http'), `Invalid proxy: '${cli.proxy}'`);

  await exchange.loadMarkets();
  log(`* Loaded ${exchangeName}: ${exchange.symbols}`);

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

  let trades = await exchange.fetchMyTrades();
  log('Trades: \n' + JSON.stringify(trades));
}