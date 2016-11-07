'use strict';

let assert = require('assert');
let concurrent = require('../lib/concurrent');

let sleep = (t) => {
    return new Promise((resolve) => {
        setTimeout(resolve, t);
    });
};

describe('concurrent', () => {
    it('base', () => {
        let con = concurrent();

        return Promise.race([
            con(() => sleep(50).then(() => 1)),
            con(() => sleep(20).then(() => 2)),
            con(() => sleep(3).then(() => 3))
        ]).then((ret) => {
            assert.equal(ret, 1);
        });
    });

    it('concurrent', () => {
        let con = concurrent({
            maxConcurrent: 3
        });

        return Promise.race([
            con(() => sleep(50).then(() => 1)),
            con(() => sleep(20).then(() => 2)),
            con(() => sleep(3).then(() => 3))
        ]).then((ret) => {
            assert.equal(ret, 3);
        });
    });

    it('replace', () => {
        let con = concurrent({
            maxConcurrent: 2
        });

        return Promise.race([
            con(() => sleep(50).then(() => 1)),
            con(() => sleep(20).then(() => 2)),
            con(() => sleep(3).then(() => 3))
        ]).then((ret) => {
            assert.equal(ret, 2);
        });
    });

    it('all', () => {
        let con = concurrent({
            maxConcurrent: 2
        });

        return Promise.all([
            con(() => sleep(50).then(() => 1)),
            con(() => sleep(20).then(() => 2)),
            con(() => sleep(3).then(() => 3))
        ]).then((ret) => {
            assert.deepEqual(ret, [1, 2, 3]);
        });
    });

    it('another', () => {
        let con = concurrent({
            maxConcurrent: 2
        });

        return Promise.race([
            con(() => sleep(3).then(() => 3)),
            con(() => sleep(50).then(() => 1)),
            con(() => sleep(20).then(() => 2))
        ]).then((ret) => {
            assert.equal(ret, 3);
        });
    });

    it('error', () => {
        let con = concurrent({
            maxConcurrent: 2
        });

        return con(() => sleep(2).then(() => {
            return Promise.reject(123);
        })).catch(err => {
            assert.equal(err.toString() === '123', true);
        });
    });
});
