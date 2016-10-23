'use strict';

let {
    isPromise, likeArray, isObject, funType, isFunction, isUndefined, or, isNumber, isFalsy, isReadableStream, mapType
} = require('basetype');

/**
 * @param opts
 *      preidcate: chose items to iterate
 *      limit: when to stop iteration
 *      transfer: transfer item
 *      output
 *      def: default result
 */
let iterate = funType((domain, opts = {}) => {
    domain = domain || [];
    if (isPromise(domain)) {
        return domain.then(list => {
            return iterate(list, opts);
        });
    }
    return iterateList(domain, opts);
}, [
    or(isPromise, isObject, isFunction, isFalsy),
    or(isUndefined, mapType({
        predicate: or(isFunction, isFalsy),
        transfer: or(isFunction, isFalsy),
        output: or(isFunction, isFalsy),
        limit: or(isUndefined, isNumber, isFunction)
    }))
]);

let iterateList = (domain, opts) => {
    opts = initOpts(opts, domain);

    let rets = opts.def;
    let count = 0; // iteration times

    if (isReadableStream(domain)) {
        let index = -1;

        return new Promise((resolve, reject) => {
            domain.on('data', (chunk) => {
                let itemRet = iterateItem(chunk, domain, ++index, count, rets, opts);
                rets = itemRet.rets;
                count = itemRet.count;
                if (itemRet.stop) {
                    resolve(rets);
                }
            });
            domain.on('end', () => {
                resolve(rets);
            });
            domain.on('error', (err) => {
                reject(err);
            });
        });
    } else if (likeArray(domain)) {
        for (let i = 0; i < domain.length; i++) {
            let item = domain[i];
            let itemRet = iterateItem(item, domain, i, count, rets, opts);
            rets = itemRet.rets;
            count = itemRet.count;
            if (itemRet.stop) return rets;
        }
    } else if (isObject(domain)) {
        for (let name in domain) {
            let item = domain[name];
            let itemRet = iterateItem(item, domain, name, count, rets, opts);
            rets = itemRet.rets;
            count = itemRet.count;
            if (itemRet.stop) return rets;
        }
    }

    return rets;
};

let initOpts = (opts, domain) => {
    let {
        predicate, transfer, output, limit
    } = opts;

    opts.predicate = predicate || truthy;
    opts.transfer = transfer || id;
    opts.output = output || toList;
    if (limit === undefined) limit = domain && domain.length;
    limit = opts.limit = stopCondition(limit);
    return opts;
};

let iterateItem = (item, domain, name, count, rets, {
    predicate, transfer, output, limit
}) => {
    if (limit(rets, item, name, domain, count)) {
        // stop
        return {
            stop: true,
            count,
            rets
        };
    }

    if (predicate(item)) {
        rets = output(rets, transfer(item, name, domain, rets), name, domain);
        count++;
    }
    return {
        stop: false,
        count,
        rets
    };
};

let stopCondition = (limit) => {
    if (isUndefined(limit)) {
        return falsy;
    } else if (isNumber(limit)) {
        return (rets, item, name, domain, count) => count >= limit;
    } else {
        return limit;
    }
};

let toList = (prev, v) => {
    prev.push(v);
    return prev;
};

let truthy = () => true;

let falsy = () => false;

let id = v => v;

module.exports = {
    iterate
};
