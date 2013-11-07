App.controller('IPhoneCtrl', [
    '$rootScope', '$scope', '$http', 'PlayerService', 'UtilService', 'TesterService',
    function($rootScope, $scope, $http, Player, Util, Tester)
    {
        Tester.init({
            '$scope': $scope
        });

        Tester.addTest('Valid URL', function(done, fail)
        {
            var self = this,
                err = {
                    message: null,
                    data: null,
                    hint: null
                };

            $.get($scope.vastUrl).always(function(res, status, evt)
            {
                switch (status)
                {
                    case 'success':
                        Tester.set('xmlSource', evt.responseText);
                        done();
                        break;

                    case 'parsererror':
                        err.message = 'Your XML document doesn\'t seems to be well-formed';
                        err.data = res.responseText;

                        Tester.set('parserror', err);
                        done();
                        break;

                    case 'error':
                        err.message = res.statusText + ' (' + res.status + ')';

                        switch (res.statusText)
                        {
                            case 'error':
                                var _navigator;
                                if ((_navigator = window.navigator) && !_navigator.onLine)
                                {
                                    err.hint = 'Check your internet connection, you appears to be offline.';
                                }
                                else
                                {
                                    err.hint = 'The VAST response seems to not support CORS server-side (Access-Control-Allow-Origin). Check your JavaScript console or network traces for more details';
                                }
                                break;

                            case 'Not Found':
                                err.hint = 'Check your URL'
                                break;
                        }

                        fail(err);
                        break;
                }
            });
        });

        Tester.addTest('Valid XML Response', function()
        {
            var err;

            if (err = Tester.get('parserror'))
            {
                this.error = err;
                this.modal = new Tester.Modal({
                    link: '+',
                    title: err.message,
                    template: 'views/modal-xml-source.html',
                    data: err.data
                });

                return false;
            }

            this.modal = new Tester.Modal({
                link: '+',
                title: 'XML Source',
                template: 'views/modal-xml-source.html',
                data: Tester.get('xmlSource')
            });

            return true;
        });

        Tester.addTest('Valid VAST Response', function(done, fail)
        {
            DMVAST.client.get($scope.vastUrl, function(err, response)
            {
                var vastTracker;

                if (err)
                {
                    fail(err);
                }

                if (response)
                {
                    Tester.set('vastResponse', response);
                    done();
                }
            });
        });

        Tester.addTest('VAST Ad', function(done, fail)
        {
            var response = Tester.get('vastResponse'),
                self = this;

            for (var adIdx = 0, adLen = response.ads.length; adIdx < adLen; adIdx++)
            {
                var ad = response.ads[adIdx];
                for (var creaIdx = 0, creaLen = ad.creatives.length; creaIdx < creaLen; creaIdx++)
                {
                    var linearCreative = ad.creatives[creaIdx];
                    if (linearCreative.type != "linear") continue;

                    for (var mfIdx = 0, mfLen = linearCreative.mediaFiles.length; mfIdx < mfLen; mfIdx++)
                    {
                        var mediaFile = linearCreative.mediaFiles[mfIdx];
                        if (mediaFile.mimeType != $scope.wantedFormat) continue;

                        vastTracker = new DMVAST.tracker(ad, linearCreative);

                        self.modal = new Tester.Modal({
                            link: '+',
                            title: 'Ad Details',
                            template: 'views/modal-ad-details.html',
                            data: ad
                        });

                        Tester.set('vastTracker', vastTracker);
                        Tester.set('vastTracker.ad', ad);
                        Tester.set('vastTracker.linearCreative', linearCreative);
                        Tester.set('vastTracker.mediaFile', mediaFile);
                        break;
                    }

                    if (vastTracker)
                    {
                        break;
                    }
                }

                if (vastTracker)
                {
                    break;
                }
            }

            if (vastTracker)
            {
                done();
            }
            else
            {
                fail();
            }
        });

        Tester.addTest('Can Play Ad', function(done, fail)
        {
            var vastTracker = Tester.get('vastTracker'),
                ad = Tester.get('vastTracker.ad'),
                linearCreative = Tester.get('vastTracker.linearCreative'),
                mediaFile = Tester.get('vastTracker.mediaFile'),
                self = this;

            // TODO: display, log and check all sent events
            // ------------------------------------------------
            // var _trackingEvents = Object.keys(linearCreative),
            //     _teName, _teUrls;
            // for (var i = 0, len = _trackingEvents; i < len; i++)
            // {
            //     _teName = _trackingEvents[i];
            //     _teUrls = linearCreative[_teName];

            //     vastTracker.on(_teName, function()
            //     {
            //         console.log(_teName, 'called');
            //     });
            // }

            Player.on('canplay', function() {vastTracker.load();});
            Player.on('timeupdate', function() {vastTracker.setProgress(this.currentTime);});
            Player.on('play', function() {vastTracker.setPaused(false);});
            Player.on('pause', function() {vastTracker.setPaused(true);});
            Player.on('loadedmetadata', function()
            {
                if (Math.abs(this.duration - linearCreative.duration) > 0.2)
                {
                    self.warn([
                        'Linear creative duration does not match current video duration: ',
                        '(vast) ',
                        linearCreative.duration,
                        's / ',
                        this.duration,
                        's (video)'
                    ].join(''));
                }
            });

            Player.on('playing', function()
            {
                done();
            })

            Player.on('error', function(e, err)
            {
                fail(err);
            });

            Player.load(mediaFile.fileURL);
            Player.play();
        });

        // Scope properties
        $scope.vastUrl = '';
        $scope.wantedFormat = 'video/mp4';
        $scope.Tester = Tester;

        $scope.runTests = function()
        {
            var vastUrl = $scope.vastUrl;
            if (!vastUrl || !$scope.vastUrl.length) return;

            Player.reset();
            Tester.reset();
            Tester.run();
        };

        var $iphoneUi = $(document.querySelector('.iphone-ui')),
            $iphoneScreenshot = $iphoneUi.find('.iphone-screenshot'),
            $iphoneDevice = $iphoneUi.find('.iphone-device'),
            $screenshotList = $(document.querySelector('.screenshots'));

        $iphoneScreenshot.on('webkitAnimationEnd', function()
        {
            $iphoneScreenshot.removeClass('animation');
        });

        $scope.takeScreenshot = function()
        {
            var $exportElt = $('<img class="iphone-export"/>'),
                player = document.querySelector('#player'),
                canvas = document.querySelector('#can'),
                ctx = canvas.getContext('2d');

            canvas.originClean = true;
            player.crossOrigin = 'Anonymous';

            ctx.drawImage($iphoneDevice[0], 0, 0);//5, 5, 320, 120);
            try
            {
                console.log(canvas.toDataURL());
            }
            catch(e)
            {
                console.log(e);
            }

            // try
            // {
            //     $exportElt.attr('src', canvas.toDataURL());
            // }
            // catch(e)
            // {
            //     console.log(e);
            // }

            // $screenshotList.append($exportElt);

            // html2canvas($iphoneDevice[0],
            // {
            //     onrendered: function(canvas)
            //     {
            //         console.log(canvas);
            //         var dataURL = canvas.toDataURL();
            //         $exportElt.attr('src', dataURL);
            //         $screenshots.append($exportElt);
            //         // var uriContent = "data:application/octet-stream," + encodeURIComponent(dataURL);
            //         // console.log(uriContent);
            //         // window.open(uriContent, 'Yeah');
            //     }
            // });

            $iphoneScreenshot.addClass('animation');
        };
    }
]);