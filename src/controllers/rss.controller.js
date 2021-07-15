const got = require('got')

/**
 * Get RSS Feed.
 *
 * Returns the RSS feed from Reddit as a proxy server to circumvent the CORS error.
 *
 * @param req   HTTP request argument to the middleware function.
 * @param res   HTTP response argument to the middleware function.
 */
exports.getRss = async (req, res) => {
    try {
        const response = await got('https://www.reddit.com/r/Hydroponics/.rss')
        res.header('Access-Control-Allow-Origin', '*')
        res.set('Content-Type', 'application/rss+xml')
        res.send(Buffer.from(response.body))
    } catch (error) {
        console.error(error.response.body);
    }
}