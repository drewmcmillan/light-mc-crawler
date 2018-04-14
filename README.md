# light-mc-crawler
Forked from https://github.com/github/lightcrawler

Crawl a website and run it through Google lighthouse, finding mixed content

```bash
npm install -s https://github.com/drewmcmillan/light-mc-crawler

light-mc-crawler --config light-mc-crawler-config.json
```

where `light-mc-crawler-config.json` looks something like this:
```json
{
  "url": "https://www.example.com",
  "maxDepth": 2,
  "maxChromeInstances": 5,
  "limit": "/music/",
  "httpsOnly": true,
  "showHttpLinksDuring": false,
  "showHttpLinksAfter": true
}
```
This will crawl `https://www.example.com` and any pages coming off it with `/music/` in the url.

## Arguments

### limit
Limits the crawling to urls containing a certain substring

### httpsOnly
Converts any http links found into https

### showHttpLinksDuring
Logs any http links found during the crawling

### showHttpLinksAfter
Logs any http links found after the crawling

### Example output
```
Http link on https://www.example.com/music
  http://www.example.com/music/resources/idt-sh/dancing
  http://www.example.com/music/resources/idt-sh/clubs
  http://www.example.com/music/musictime
  http://www.example.com/music/musictime
  http://www.example.com/music/10628994
  http://www.example.com/music/help-41670342

Mixed Content
https://www.example.com/music ✗ is-on-https - Does not use HTTPS
   http://www.petmd.com/sites/default/files/petmd-cat-happy-10.jpg
   http://www.argospetinsurance.co.uk/assets/uploads/2017/12/cat-pet-animal-domestic-104827.jpeg
https://www.example.com/music ✗ mixed-content - Some insecure resources can be upgraded to HTTPS
```

Enjoy!

