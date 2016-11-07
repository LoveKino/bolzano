'use strict';

/**
 * simple api for concurrent tasks
 *
 * async function as a task
 * concurrent window controls the maxium concurrent number
 */

/**
 * @param maxConcurrent int
 */

module.exports = ({
    maxConcurrent = 1
} = {}) => {
    let waitingQueue = [];

    /**
     * two-way linked list
     *
     * {
     *      jobRet,
     *      prev,
     *      next
     * }
     */
    let lastRunningNode = null;
    let runningQueueLength = 0;

    let pushNode = (jobRet) => {
        let newLastNode = {
            jobRet,
            prev: lastRunningNode
        };

        if (lastRunningNode) {
            lastRunningNode.next = newLastNode;
        }

        lastRunningNode = newLastNode;
        runningQueueLength++;

        return newLastNode;
    };

    let deleteNode = (node) => {
        let prev = node.prev;
        let next = node.next;
        if (next) {
            next.prev = prev;
        }
        if (prev) {
            prev.next = next;
        }

        // override last node
        if (node === lastRunningNode) {
            lastRunningNode = node.prev;
        }
        runningQueueLength--;
    };

    let runningJob = (job) => {
        let jobRet = Promise.resolve(job());
        let newLastNode = pushNode(jobRet);

        return jobRet.then((ret) => {
            deleteNode(newLastNode);
            runNext();
            return ret;
        }).catch(err => {
            runNext();
            deleteNode(newLastNode);
            throw err;
        });
    };

    let runNext = () => {
        if (waitingQueue.length) {
            let {
                job, resolve, reject
            } = waitingQueue.shift();

            runningJob(job).then(resolve).catch(reject);
        }
    };

    return (job) => {
        if (runningQueueLength < maxConcurrent) {
            return runningJob(job);
        } else {
            return new Promise((resolve, reject) => {
                waitingQueue.push({
                    job, resolve, reject
                });
            });
        }
    };
};
