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
Mixed Content
https://www.example.co.uk/music/politics ✗ is-on-https - Does not use HTTPS
   http://static.stage.bbci.co.uk/news/1.237.02510/img/correspondents/laurakuenssberg.png
   http://static.stage.bbci.co.uk/news/1.237.02510/img/correspondents/johnpienaar.png
   http://static.stage.bbci.co.uk/news/1.237.02510/img/correspondents/markdarcy.png

Mixed Content
https://www.example.co.uk/music/business/economy ✗ is-on-https - Does not use HTTPS
   http://static.stage.bbci.co.uk/news/1.237.02510/img/correspondents/kamalahmed.png

Mixed Content 
https://www.example.co.uk/music/video_and_audio/headlines/43765587 ✗ is-on-https - Does not use HTTPS
   http://news.bbcimg.co.uk/media/images/48351000/gif/_48351578_640x360-world-news.gif

Mixed Content
https://www.stage.bbc.co.uk/news/video_and_audio/headlines/43763410 ✗ is-on-https - Does not use HTTPS
   http://news.bbcimg.co.uk/media/images/48351000/gif/_48351578_640x360-world-news.gif

Mixed Content
https://www.example.co.uk/music/video_and_audio/headlines/43763406 ✗ is-on-https - Does not use HTTPS
   http://news.bbcimg.co.uk/media/images/48351000/gif/_48351578_640x360-world-news.gif

Mixed Content
https://www.example.co.uk/music/video_and_audio/headlines/43765588 ✗ is-on-https - Does not use HTTPS
   http://news.bbcimg.co.uk/media/images/48351000/gif/_48351578_640x360-world-news.gif
   
Http link on https://www.example.co.uk/music
  http://www.example.com/music/resources/idt-sh/dancing
  http://www.example.com/music/resources/idt-sh/clubs
  http://www.example.com/music/musictime
  http://www.example.com/music/musictime
  http://www.example.com/music/10628994
  http://www.example.com/music/help-41670342
```

Enjoy!

