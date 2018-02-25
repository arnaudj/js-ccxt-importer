'use strict';

// bitstamp
const typeMap = {
  0: 'deposit',
  1: 'withdrawal',
  2: 'trade',
  14: 'sub-account-transfer'
}

const alias = (mapper, val) => mapper.hasOwnProperty(val) ? mapper[val] : 'unknown';

exports.normalizeJson = function (json) {
  return json
    .map(function (e) {
      e.type = alias(typeMap, e.info.type);
      return e;
    })
    .filter((e) => !['deposit', 'withdrawal'].includes(e.type))
    .map(function (e) {
      let m = {
        type: e.type,
        timestamp: e.timestamp,
        datetime: e.datetime,
        symbol: e.symbol,
        side: e.side,
        amount: e.amount, // ORDERQTY
        price: e.price, // PRICE
        orderId: e.order,
      };

      if (e.hasOwnProperty('fee')) {
        if (e.fee.hasOwnProperty('cost'))
          m.feeCost = e.fee.cost;
        if (e.fee.hasOwnProperty('currency'))
          m.feeCurrency = e.fee.currency;
      }

      return m;
    });
}