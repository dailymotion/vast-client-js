# VAST Javascript Client

[![Build Status](https://travis-ci.org/dailymotion/vast-client-js.png)](https://travis-ci.org/dailymotion/vast-client-js)

Complies with [VAST 3.0 spec](http://www.iab.net/media/file/VASTv3.0.pdf).

## Build / Contribute

See [CONTRIBUTING](CONTRIBUTING.md)

## Usage

If you need to support legacy browsers (e.g. IE8+), don't forget to include [es5.js][es5]

[es5]: https://github.com/inexorabletash/polyfill/blob/master/es5.js

``` javascript
DMVAST.client.get(VASTURL, function(response)
{
    if (response)
    {
        for (var adIdx = 0, adLen = response.ads.length; adIdx < adLen; adIdx++)
        {
            var ad = response.ads[adIdx];
            for (var creaIdx = 0, creaLen = ad.creatives.length; creaIdx < creaLen; creaIdx++)
            {
                var creative = ad.creatives[creaIdx];

                switch (creative.type) {
                    case "linear":
                        for (var mfIdx = 0, mfLen = creative.mediaFiles.length; mfIdx < mfLen; mfIdx++)
                        {
                            var mediaFile = creative.mediaFiles[mfIdx];
                            if (mediaFile.mimeType != "video/mp4") continue;

                            player.vastTracker = new DMVAST.tracker(ad, creative);
                            player.vastTracker.on('clickthrough', function(url)
                            {
                                document.location.href = url;
                            });
                            player.on('canplay', function() {this.vastTracker.load();});
                            player.on('timeupdate', function() {this.vastTracker.setProgress(this.currentTime);});
                            player.on('play', function() {this.vastTracker.setPaused(false);});
                            player.on('pause', function() {this.vastTracker.setPaused(true);});

                            player.href = mediaFile.fileURL;
                            // put player in ad mode
                        }
                    break;

                    case "non-linear":
                        // TODO
                    break;

                    case "companion":
                        for (var cpIdx = 0, cpLen = creative.variations.length; cpIdx < cpLen; cpIdx++)
                        {
                            var companionAd = creative.variations[cpIdx];
                            var docElement = document.createElement("div");

                            switch(companionAd.type) {
                                case 'image/jpeg':
                                    var aElement = document.createElement('a');
                                    var companionAsset = new Image();
                                    aElement.setAttribute('target', '_blank');
                                    companionAsset.src = companionAd.staticResource;
                                    companionAsset.width = companionAd.width;
                                    companionAsset.height = companionAd.height;

                                    aElement.href = companionAd.companionClickThroughURLTemplate;
                                    aElement.appendChild(companionAsset);

                                    docElement.appendChild(aElement);
                                    document.body.appendChild(docElement);
                                    break;
                                case 'text/html':
                                    docElement.innerHTML = companionAd.htmlResource;
                                    document.body.appendChild(docElement);
                                    break;
                                default:
                                    if (companionAd.iframeResource) {
                                        var aElement = document.createElement('iframe');
                                        aElement.src = companionAd.staticResource;
                                        aElement.width = companionAd.width;
                                        aElement.height = companionAd.height;
                                        docElement.appendChild(aElement);
                                        document.body.appendChild(docElement);
                                        break;
                                    }
                                break;
                            }
                        }

                    break;

                    default:
                    break;
                }

            }

            if (player.vastTracker)
            {
                break;
            }
            else
            {
                // Inform ad server we can't find suitable media file for this ad
                DMVAST.util.track(ad.errorURLTemplates, {ERRORCODE: 403});
            }
        }
    }

    if (!player.vastTracker)
    {
        // No pre-roll, start video
    }
});
```
