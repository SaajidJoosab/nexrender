const { send }   = require('micro')
const { fetch }  = require('../helpers/database')
const { update } = require('../helpers/database')

module.exports = async (req, res) => {
    console.log(`fetching a pickup job for a worker`)

    const listing = fetch()
    const queued  = listing.filter(job => job.state == 'queued')

    if (queued.length < 1) {
        return send(res, 200, {})
    }

    let job;

    if (process.env.NEXRENDER_ORDERING == 'random') {
        job = queued[Math.floor(Math.random() * queued.length)];
    }
    else if (process.env.NEXRENDER_ORDERING == 'newest-first') {
        job = queued[0];
    }
    else { /* fifo (oldest-first) */
        job = queued[queued.length-1];
    }

    /* update the job locally, and send it to the worker */
    send(res, 200, update(job.uid, { state: 'picked' }))
}
