const osmosis = require('osmosis')
const _ = require('lodash')
const UrlUtils = require('../util/url-util');

const NEScraper = {};

NEScraper.scrape = (item, limit) => {
    return new Promise((resolve, reject) => {
        const url = 'https://www.newegg.ca/p/pl?d=' + UrlUtils.replaceSpaces(item);
        console.log(url)
        let resultLimit = limit || 10;
        let results = [];
        osmosis.config('concurrency', 5);
        osmosis.config('tries', 10)
        osmosis.config('user_agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36');
        osmosis
            .get(url)
            .find(':not(.search-suggestions)>.items-view .item-container .item-info')
            .set({
                dollars: ".price-current > strong",
                cents: ".price-current > sup",
                name: 'a.item-title',
                link: 'a.item-title @href',
            })
            .log(console.log)
            .data(result => results.push(result))
            .done(() => {
                results = _.chain(results)
                    .map(res => {
                        let dollars = res.dollars || '0'
                        dollars = dollars.replace(',', '')
                        return {
                            price: parseFloat(dollars + res.cents),
                            name: res.name,
                            link: res.link,
                            web_id: res.web_id
                        }
                    })
                    .filter(res => Object.keys(res).length > 0)
                    .value()
                    .splice(0, resultLimit)
                resolve(results)
            })
    })

}


module.exports = NEScraper;