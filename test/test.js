'use strict';

var expect = require('chai').expect;
var normalizer = require('../src/normalizer');

describe('normalize imported trades', function () {

    describe('bitstamp exchange', function () {
        it('eth sell order', function () {
            let from = {
                id: '46000001',
                info:
                    {
                        usd: '-1.51',
                        order_id: 77300001,
                        datetime: '2018-01-16 09:15:24',
                        fee: '0.12',
                        btc: 0,
                        eth: '0.007',
                        eth_usd: 1078.88,
                        type: '2',
                        id: 46000001,
                        eur: 0
                    },
                timestamp: 1516094124000,
                datetime: '2018-01-16T09:15:24.000Z',
                symbol: 'ETH/USD',
                order: '77300001',
                side: 'sell',
                price: 1078.88,
                amount: 0.007,
                fee: { cost: 0.12, currency: 'USD' },
                type: 'trade'
            };

            let actual = normalizer.normalizeJson([from])[0];
            expect(actual).to.deep.equal({
                type: 'trade',
                timestamp: 1516094124000,
                symbol: 'ETH/USD',
                side: 'sell',
                amount: 0.007,
                datetime: '2018-01-16T09:15:24.000Z',
                price: 1078.88,
                orderId: '77300001',
                feeCost: 0.12,
                feeCurrency: 'USD'
            });
        });
    });
});