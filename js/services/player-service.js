App.service('PlayerService', function()
{
    var Player = (function()
    {
        var videoElt, baseElt;

        videoElt = baseElt = document.getElementById('player');

        var errorCallback = function(e, clientCallback)
        {
            var videoSrc = this.currentSrc,
                errorObj,
                messageResponse;

            if (videoSrc == this.baseURI || !videoSrc.length) return;

            messageResponse =
            {
                message: '',
                hint: 'Media URL: <input type="text" class="form-control" value="' + videoSrc + '"/>'
            };

            errorObj = e.target.error;

            switch (errorObj.code)
            {
                case errorObj.MEDIA_ERR_ABORTED:
                    messageResponse.message = 'Video playback aborted';
                    break;

                case errorObj.MEDIA_ERR_NETWORK:
                    messageResponse.message = 'A network error caused the video download to fail part-way';
                    break;

                case errorObj.MEDIA_ERR_DECODE:
                    messageResponse.message = 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support';
                    break;

                case errorObj.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    messageResponse.message = 'The video could not be loaded, either because the server or network failed or because the format is not supported';
                    break;

                default:
                    messageResponse.message = 'An unknown error occurred';
                    break;
            }

            clientCallback.call(clientCallback, e, messageResponse);
        };

        return {
            $elt: videoElt,
            load: function(url)
            {
                url = jQuery.trim(url);
                if (url.length)
                {
                    videoElt.src = url;
                    videoElt.load();
                }
            },
            reset: function()
            {
                var newVideoElt = baseElt.cloneNode();
                $(videoElt).replaceWith(newVideoElt);
                videoElt = newVideoElt;
            },
            play: function()
            {
                videoElt.play();
            },
            pause: function()
            {
                videoElt.pause();
            },
            get: function(property)
            {
                return videoElt[property];
            },
            on: function(event, callback)
            {
                if (event === 'error')
                {
                    videoElt.addEventListener('error', function(e)
                    {
                        errorCallback.call(videoElt, e, callback);
                    });
                }
                else
                {
                    videoElt.addEventListener(event, callback);
                }
            }
        }
    })();

    return Player;
});
