const fs       = require('fs')
const path     = require('path')
const {name}   = require('./package.json')
const requireg = require('requireg')

module.exports = (job, settings, { input, provider, params }, type) => {
    if (type != 'postrender') {
        throw new Error(`Action ${name} can be only run in postrender mode, you provided: ${type}.`)
    }

    if (!provider) {
        throw new Error(`Provider is missing.`)
    }

    /* check if input has been provided */
    input = input || job.output;

    /* fill absolute/relative paths */
    if (!path.isAbsolute(input)) input = path.join(job.workpath, input);

    settings.logger.log(`[${job.uid}] starting action-upload action`)

    let requirePackage = ''
    try {
        /* try requiring official providers */
        requirePackage = `@nexrender/provider-${provider}`
        return requireg('@nexrender/provider-' + provider).upload(job, settings, input, params || {});

    } catch (e) {
        if (e.message.indexOf('Could not require module') !== -1) {
            try{
                /* try requiring custom providers */
                requirePackage = provider
                return requireg(provider).upload(job, settings, input, params || {});

            } catch(e) {
                if (e.message.indexOf('Could not require module') !== -1) {
                    return Promise.reject(new Error(`Couldn\'t find module ${requirePackage}, Unknown provider given.`))
                }

                throw e;
            }
        }

        throw e;
    }
}
