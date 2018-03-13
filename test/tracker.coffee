should = require 'should'
sinon  = require 'sinon'
path = require 'path'
VASTParser = require '../src/parser/parser'
VASTTracker = require '../src/tracker'

now = new Date()

urlfor = (relpath) ->
    return 'file://' + path.resolve(path.dirname(module.filename), 'vastfiles', relpath).replace(/\\/g, '/')

describe 'VASTTracker', ->
    before () =>
        @sinon = sinon.sandbox.create()
        @sinon.stub(Math, 'random').returns(0.1)
        @clock = sinon.useFakeTimers(now.getTime())

    after () =>
        @clock.restore()
        @sinon.restore()

    describe '#constructor', ->
        @Tracker = null
        _eventsSent = []
        @templateFilterCalls = []
        @response = {}

        before (done) =>
            VASTParser.addURLTemplateFilter (url) =>
              @templateFilterCalls.push url
              return url

            VASTParser.parse urlfor('wrapper-a.xml'), (@response) =>
                done()

        after () =>
            VASTParser.clearUrlTemplateFilters()

        describe '#linear', =>
            before () =>
                # Init tracker
                ad = @response.ads[0]
                creative = @response.ads[0].creatives[0]
                @Tracker = new VASTTracker ad, creative
                # Mock emit
                @Tracker.emit = (event) =>
                    _eventsSent.push(event)

            it 'should have firstQuartile set', =>
                @Tracker.quartiles.firstQuartile.should.equal 22.53

            it 'should have midpoint set', =>
                @Tracker.quartiles.midpoint.should.equal 45.06

            it 'should have thirdQuartile set', =>
                @Tracker.quartiles.thirdQuartile.should.equal 67.59

            it 'should have skipDelay disabled', =>
                @Tracker.skipDelay.should.equal -1

            describe '#setProgress', =>

                beforeEach (done) =>
                    _eventsSent = []
                    done()

                it 'should send start event when set at 1', =>
                    @Tracker.setProgress 1
                    _eventsSent.should.eql ["start"]

                it 'should send skip-countdown event', =>
                    @Tracker.skipDelay = 5
                    @Tracker.setProgress 6
                    _eventsSent.should.eql ["skip-countdown"]

                it 'should send rewind event when set back at 5', =>
                    @Tracker.setProgress 5
                    _eventsSent.should.eql ["rewind"]

                it 'should send firstQuartile event', =>
                    @Tracker.setProgress 23
                    _eventsSent.should.eql ["firstQuartile"]

                it 'should send progress-30 event VAST 3.0', =>
                    @Tracker.setProgress 30
                    _eventsSent.should.eql ["progress-30"]

                it 'should send midpoint event', =>
                    @Tracker.setProgress 46
                    _eventsSent.should.eql ["midpoint"]

                it 'should send progress-60% event VAST 3.0', =>
                    @Tracker.setProgress 54
                    _eventsSent.should.eql ["progress-60%"]

                it 'should send thirdQuartile event', =>
                    @Tracker.setProgress 68
                    _eventsSent.should.eql ["thirdQuartile"]

            describe '#setMuted', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.trackingEvents['mute'] = 'http://example.com/muted'
                    @Tracker.trackingEvents['unmute'] = 'http://example.com/muted'
                    @Tracker.setMuted yes
                    done()

                it 'should be muted', =>
                    @Tracker.muted.should.eql yes

                it 'should send muted event', =>
                    _eventsSent.should.eql ["mute"]

                it 'should be unmuted', =>
                    _eventsSent = []
                    @Tracker.setMuted no
                    @Tracker.muted.should.eql no

                it 'should send unmuted event', =>
                    _eventsSent.should.eql ["unmute"]

                it 'should send no event', =>
                    _eventsSent = []
                    @Tracker.setMuted no
                    _eventsSent.should.eql []

            describe '#setPaused', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.setPaused yes
                    done()

                it 'should be paused', =>
                    @Tracker.paused.should.eql yes

                it 'should send pause event', =>
                    _eventsSent.should.eql ["pause"]

                it 'should be resumed', =>
                    _eventsSent = []
                    @Tracker.setPaused no
                    @Tracker.paused.should.eql no

                it 'should send resume event', =>
                    _eventsSent.should.eql ["resume"]

                it 'should send no event', =>
                    _eventsSent = []
                    @Tracker.setPaused no
                    _eventsSent.should.eql []

            describe '#setFullscreen', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.trackingEvents['fullscreen'] = 'http://example.com/fullscreen'
                    @Tracker.trackingEvents['exitFullscreen'] = 'http://example.com/exitFullscreen'
                    @Tracker.setFullscreen yes
                    done()

                it 'should be in fullscreen mode', =>
                    @Tracker.fullscreen.should.eql yes

                it 'should send fullscreen event', =>
                    _eventsSent.should.eql ["fullscreen"]

                it 'should be in exitFullscreen mode', =>
                    _eventsSent = []
                    @Tracker.setFullscreen no
                    @Tracker.fullscreen.should.eql no

                it 'should send exitFullscreen event', =>
                    _eventsSent.should.eql ["exitFullscreen"]

                it 'should send no event', =>
                    _eventsSent = []
                    @Tracker.setFullscreen no
                    _eventsSent.should.eql []

            describe '#setExpand', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.trackingEvents['expand'] = 'http://example.com/expand'
                    @Tracker.trackingEvents['collapse'] = 'http://example.com/collapse'
                    @Tracker.setExpand yes
                    done()

                it 'should be in expanded mode', =>
                    @Tracker.expanded.should.eql yes

                it 'should send expand event', =>
                    _eventsSent.should.eql ["expand"]

                it 'should be in collapsed mode', =>
                    _eventsSent = []
                    @Tracker.setExpand no
                    @Tracker.expanded.should.eql no

                it 'should send collapse event', =>
                    _eventsSent.should.eql ["collapse"]

                it 'should send no event', =>
                    _eventsSent = []
                    @Tracker.setExpand no
                    _eventsSent.should.eql []

            describe '#setSkipDelay', =>

                it 'should have skipDelay set to 3', =>
                    @Tracker.setSkipDelay 3
                    @Tracker.skipDelay.should.eql 3

                it 'should have skipDelay still set to 3', =>
                    @Tracker.setSkipDelay 'blabla'
                    @Tracker.skipDelay.should.eql 3

            describe '#load', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.vastUtil.track = (URLTemplates, variables) ->
                        _eventsSent.push @resolveURLTemplates(URLTemplates, variables)
                    @Tracker.load()
                    done()

                it 'should have impressed set to true', =>
                    @Tracker.impressed.should.eql yes

                it 'should have called impression URLs', =>
                    creative     = @Tracker.vastUtil.encodeURIComponentRFC3986(@Tracker.creative.mediaFiles[0].fileURL)
                    cacheBusting = 10000000
                    _eventsSent[0].should.eql [
                        'http://example.com/wrapperA-impression',
                        'http://example.com/wrapperB-impression1',
                        'http://example.com/wrapperB-impression2',
                        "http://example.com/impression1_asset:#{creative}_#{cacheBusting}",
                        "http://example.com/impression2_#{cacheBusting}",
                        "http://example.com/impression3_#{cacheBusting}"
                    ]

                it 'should have sent creativeView event', =>
                    _eventsSent[1].should.eql 'creativeView'

                it 'should only be called once', =>
                    _eventsSent = []
                    @Tracker.load()
                    _eventsSent.should.eql []

            describe '#errorWithCode', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.vastUtil.track = (URLTemplates, variables) ->
                        _eventsSent.push @resolveURLTemplates(URLTemplates, variables)
                    @Tracker.errorWithCode(405)
                    done()

                it 'should have called error urls', =>
                    _eventsSent[0].should.eql [ 'http://example.com/wrapperA-error', 'http://example.com/wrapperB-error', 'http://example.com/error_405']

            describe '#complete', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.complete()
                    done()

                it 'should have sent complete event and urls', =>
                    _eventsSent.should.eql ['complete', ["http://example.com/linear-complete", "http://example.com/wrapperB-linear-complete", "http://example.com/wrapperA-linear-complete"]]

                it 'should be called multiples times', =>
                    _eventsSent = []
                    @Tracker.complete()
                    _eventsSent.should.eql ['complete', ["http://example.com/linear-complete", "http://example.com/wrapperB-linear-complete", "http://example.com/wrapperA-linear-complete"]]

            describe '#close', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.close()
                    done()

                it 'should have sent close event and urls VAST 2.0', =>
                    _eventsSent.should.eql ['close', [ 'http://example.com/linear-close']]

                it 'should have sent closeLinear event and urls VAST 3.0', =>
                    _eventsSent = []
                    @Tracker.trackingEvents['closeLinear'] = ['http://example.com/closelinear']
                    delete @Tracker.trackingEvents['close']
                    @Tracker.close()
                    _eventsSent.should.eql ['closeLinear', [ 'http://example.com/closelinear']]

            describe '#skip', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.skip()
                    done()

                it 'should have sent skip event', =>
                    _eventsSent.should.eql ['skip']

            describe '#click', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.vastUtil.track = (URLTemplates, variables) ->
                        _eventsSent.push @resolveURLTemplates(URLTemplates, variables)
                    @Tracker.click()
                    done()

                it 'should have sent clicktracking events', =>
                    ISOTimeStamp = @Tracker.vastUtil.encodeURIComponentRFC3986((new Date).toISOString())
                    _eventsSent[0].should.eql [
                        "http://example.com/linear-clicktracking1_ts:#{ISOTimeStamp}",
                        'http://example.com/linear-clicktracking2',
                        'http://example.com/wrapperB-linear-clicktracking',
                        'http://example.com/wrapperA-linear-clicktracking1',
                        'http://example.com/wrapperA-linear-clicktracking2',
                        'http://example.com/wrapperA-linear-clicktracking3'
                    ]

                it 'should have sent clickthrough event', =>
                    _eventsSent[1].should.eql 'clickthrough'

        describe '#companion', =>
            before () =>
                # Init tracker
                ad = @response.ads[0]
                creative = ad.creatives[1]
                variation = creative.variations[0]
                @Tracker = new VASTTracker ad, creative, variation
                # Mock emit
                @Tracker.emit = (event, args...) =>
                    _eventsSent.push({ event: event, args: args })

            describe '#click', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.vastUtil.track = (URLTemplates, variables) ->
                        _eventsSent.push @resolveURLTemplates(URLTemplates, variables)
                    @Tracker.click()
                    done()

                it 'should have sent clicktracking events', =>
                    ISOTimeStamp = @Tracker.vastUtil.encodeURIComponentRFC3986((new Date).toISOString())
                    _eventsSent[0].should.eql [
                        'http://example.com/companion1-clicktracking-first',
                        'http://example.com/companion1-clicktracking-second'
                    ]

                it 'should have sent clickthrough event withy clickThrough url', =>
                    _eventsSent[1].event.should.eql 'clickthrough'
                    _eventsSent[1].args.should.eql [ 'http://example.com/companion1-clickthrough' ]

        describe '#nonlinear', =>
            before () =>
                # Init tracker
                ad = @response.ads[0]
                creative = ad.creatives[2]
                variation = creative.variations[0]
                @Tracker = new VASTTracker ad, creative, variation
                # Mock emit
                @Tracker.emit = (event, args...) =>
                    _eventsSent.push({ event: event, args: args })

            describe '#click', =>

                before (done) =>
                    _eventsSent = []
                    @Tracker.vastUtil.track = (URLTemplates, variables) ->
                        _eventsSent.push @resolveURLTemplates(URLTemplates, variables)
                    @Tracker.click()
                    done()

                it 'should have sent clicktracking events', =>
                    ISOTimeStamp = @Tracker.vastUtil.encodeURIComponentRFC3986((new Date).toISOString())
                    _eventsSent[0].should.eql [
                        'http://example.com/nonlinear-clicktracking-1',
                        'http://example.com/nonlinear-clicktracking-2'
                    ]

                it 'should have sent clickthrough event withy clickThrough url', =>
                    _eventsSent[1].event.should.eql 'clickthrough'
                    _eventsSent[1].args.should.eql [ 'http://example.com/nonlinear-clickthrough' ]
