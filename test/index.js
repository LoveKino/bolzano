'use strict';

let assert = require('assert');

let {
    map, findIndex, reduce, contain, difference, union, interset, forEach, get, mergeMap, filter, any, flat, delay, find, exist, compact
} = require('../index');

describe('index', () => {
    it('map', () => {
        assert.deepEqual(map([1, 2, 3, 4], (item) => item + 1), [2, 3, 4, 5]);
        assert.deepEqual(map({
            a: 1,
            b: 2
        }, (item) => item + 1), [2, 3]);

        assert.deepEqual(map(['a', 'b'], (item, index) => {
            if (index === 0) return 0;
            return item;
        }), [0, 'b']);

        assert.deepEqual(map([], v => v), []);
        assert.deepEqual(map(null), []);
    });

    it('findIndex', () => {
        assert.equal(findIndex([3, 6, 8], 3), 0);
        assert.equal(findIndex([3, 6, 8], 6), 1);
        assert.equal(findIndex([3, 6, 8], 7, {
            eq: (v1, v2) => v1 + 1 === v2
        }), 2);
        assert.equal(findIndex([3, 6, 8], 7, {
            eq: (v1, v2) => v1 - 1 === v2
        }), 1);

        assert.equal(findIndex([3, 6, 8], 11), -1);
    });

    it('reduce', () => {
        assert.equal(reduce([1, 2, 3], (prev, cur) => {
            return prev + cur;
        }, 0), 6);

        assert.equal(reduce([], () => {}, 30), 30);

        // reduce with limit
        assert.equal(reduce([1, 2, 3, 4, 5], (prev, cur) => prev + cur, 0, (prev, item) => item >= 4), 6);

        assert.equal(reduce({
            a: 1,
            b: 2,
            c: 3,
            d: 4
        }, (prev, cur) => prev + cur, 0, (prev) => prev >= 6) <= 6, true);
    });

    it('contain', () => {
        assert.equal(contain([2, 45, 0, 8], 8), true);
        assert.equal(contain([2, 45, 0, 8], -1), false);
        assert.equal(contain([{
            value: 10
        }, {
            value: 6
        }], 6, {
            eq: (item, v) => {
                return v.value === item;
            }
        }), true);

        assert.equal(contain([{
            value: 10
        }, {
            value: 6
        }], 16, {
            eq: (item, v) => {
                return v.value === item;
            }
        }), false);

    });

    it('difference', () => {
        assert.deepEqual(difference([2, 5, 9], [9, 10]), [2, 5]);
        assert.deepEqual(difference([2, 5, 9], [9, 9, 10]), [2, 5]);
    });

    it('union', () => {
        assert.deepEqual(union([2, 5, 9], [9, 10]), [2, 5, 9, 10]);
        assert.deepEqual(union([2, 2, 5, 9], [9, 9, 10]), [2, 5, 9, 10]);
    });

    it('interset', () => {
        assert.deepEqual(interset([2, 5, 9], [9, 10]), [9]);
        assert.deepEqual(interset([2, 5, 9, 11], [9, 10, 11]), [9, 11]);
        assert.deepEqual(interset([2, 5, 9, 11], [19, 100, 1]), []);
    });

    it('forEach', () => {
        let sum = 0;
        forEach([2, 3, 4], (cur) => {
            sum += cur;
        });
        assert.equal(sum, 9);
    });

    it('forEach2', () => {
        let sum = 0;
        forEach([2, 3, 4], (cur) => {
            sum += cur;
            if (cur > 2) return true;
        });
        assert.equal(sum, 5);
    });

    it('get', () => {
        assert.deepEqual(get({
            a: 1
        }, ''), {
            a: 1
        });

        assert.deepEqual(get({
            a: 1
        }, 'a'), 1);

        assert.deepEqual(get({
            a: {
                b: 2
            }
        }, 'a.b'), 2);

        assert.deepEqual(get({
            a: 1
        }, 'd'), null);

        assert.deepEqual(get({
            a: 1
        }, 'a.b.c'), null);
    });

    it('mergeMap', () => {
        assert.deepEqual(mergeMap({
            a: 1,
            c: 3
        }, {
            a: 2,
            b: 2
        }), {
            a: 2,
            c: 3,
            b: 2
        });
    });

    it('filter', () => {
        assert.deepEqual(filter([2, 4, 9, 0], (v) => v < 3), [2, 0]);
    });

    it('any', () => {
        assert.equal(any([2, 4, 9, 0], (v) => v < 3), false);
        assert.equal(any([2, 4, 9, 0], (v) => v < 11), true);
    });

    it('flat', () => {
        assert.deepEqual(flat(1), [1]);
        assert.deepEqual(flat([2, 4, 9, 0]), [2, 4, 9, 0]);
        assert.deepEqual(flat([2, [4, [9]], 0]), [2, 4, 9, 0]);
    });

    it('delay', () => {
        return delay(10);
    });

    it('find', () => {
        assert.equal(find([1, 2, 3], 2), 2);
        assert.equal(find([1, 2, 3], 9), undefined);
    });

    it('exist', () => {
        assert.equal(exist([2, 4, 9, 0], (v) => v < 3), true);
        assert.equal(exist([2, 4, 9, 0], (v) => v < -1), false);
    });

    it('compact', () => {
        assert.deepEqual(compact([null, 12, 3]), [12, 3]);
        assert.deepEqual(compact([null, 12, 0, 3, undefined]), [12, 3]);
    });
});
