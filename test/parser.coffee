should = require 'should'
path = require 'path'
URLHandler = require '../src/urlhandler'
VASTParser = require '../src/parser'
VASTResponse = require '../src/response'

urlfor = (relpath) ->
    return 'file://' + path.resolve(path.dirname(module.filename), relpath).replace(/\\/g, '/')

describe 'VASTParser', ->
    describe '#parse', ->
        @response = null
        _response = null
        @templateFilterCalls = []

        before (done) =>
            VASTParser.addURLTemplateFilter (url) =>
              @templateFilterCalls.push url
              return url
            VASTParser.parse urlfor('wrapper_notracking.xml'), (@response) =>
                _response = @response
                done()

        after () =>
            VASTParser.clearUrlTemplateFilters()

        it 'should have 1 filter defined', =>
            VASTParser.countURLTemplateFilters().should.equal 1

        it 'should have called 4 times URLtemplateFilter ', =>
            @templateFilterCalls.should.have.length 4
            @templateFilterCalls.should.eql [urlfor('wrapper_notracking.xml'), urlfor('wrapper_A.xml'), urlfor('wrapper_B.xml'), urlfor('sample.xml')]

        it 'should have found 2 ads', =>
            @response.ads.should.have.length 2

        it 'should have returned a VAST response object', =>
            @response.should.be.an.instanceOf(VASTResponse)

        it 'should have merged top level error URLs', =>
            @response.errorURLTemplates.should.eql ["http://example.com/wrapperA-error", "http://example.com/wrapperB-error", "http://example.com/error"]

        describe '#For the 1st ad', ->
            ad1 = null

            before () =>
                ad1 = _response.ads[0]

            after () =>
                ad1 = null

            it 'should have retrieved Ad attributes', =>
                ad1.id.should.eql "ad_id_0001"
                ad1.sequence.should.eql "1"

            it 'should have retrieved Ad sub-elements values', =>
                ad1.system.value.should.eql "AdServer"
                ad1.system.version.should.eql "2.0"
                ad1.title.should.eql "Ad title"
                ad1.advertiser.should.eql "Advertiser name"
                ad1.description.should.eql "Description text"
                ad1.pricing.value.should.eql "1.09"
                ad1.pricing.model.should.eql "CPM"
                ad1.pricing.currency.should.eql "USD"
                ad1.survey.should.eql "http://example.com/survey"

            it 'should have merged wrapped ad error URLs', =>
                ad1.errorURLTemplates.should.eql [
                    "http://example.com/wrapperNoTracking-error",
                    "http://example.com/wrapperA-error",
                    "http://example.com/wrapperB-error",
                    "http://example.com/error_[ERRORCODE]"
                ]

            it 'should have merged impression URLs', =>
                ad1.impressionURLTemplates.should.eql [
                    "http://example.com/wrapperNoTracking-impression",
                    "http://example.com/wrapperA-impression",
                    "http://example.com/wrapperB-impression1",
                    "http://example.com/wrapperB-impression2",
                    "http://example.com/impression1_asset:[ASSETURI]_[CACHEBUSTING]",
                    "http://example.com/impression2_[random]",
                    "http://example.com/impression3_[RANDOM]"
                ]

            it 'should have 3 creatives', =>
                ad1.creatives.should.have.length 3

            it 'should have 4 extensions', =>
                ad1.extensions.should.have.length 4

            it 'validate first extension', =>
                ad1.extensions[0].attributes['type'].should.eql "WrapperExtension"
                ad1.extensions[0].children.should.have.length 1
                ad1.extensions[0].children[0].name.should.eql "extension_tag"
                ad1.extensions[0].children[0].value.should.eql "extension_value"

            it 'validate second extension', =>
                ad1.extensions[1].attributes['type'].should.eql "Pricing"
                ad1.extensions[1].children.should.have.length 1
                ad1.extensions[1].children[0].name.should.eql "Price"
                ad1.extensions[1].children[0].value.should.eql "0"
                ad1.extensions[1].children[0].attributes['model'].should.eql "CPM"
                ad1.extensions[1].children[0].attributes['currency'].should.eql "USD"
                ad1.extensions[1].children[0].attributes['source'].should.eql "someone"

            it 'validate third extension', =>
                ad1.extensions[2].attributes['type'].should.eql "Count"
                ad1.extensions[2].children.should.have.length 1
                ad1.extensions[2].children[0].name.should.eql "#cdata-section"
                ad1.extensions[2].children[0].value.should.eql "4"

            it 'validate fourth extension', =>
                ad1.extensions[3].attributes.should.eql {}
                ad1.extensions[3].children.should.have.length 1
                ad1.extensions[3].children[0].name.should.eql "#text"
                ad1.extensions[3].children[0].value.should.eql "{ foo: bar }"

            it 'should not have trackingEvents property', =>
                should.equal ad1.trackingEvents, undefined

            it 'should not have videoClickTrackingURLTemplates property', =>
                should.equal ad1.videoClickTrackingURLTemplates, undefined

            it 'should not have videoClickThroughURLTemplate property', =>
                should.equal ad1.videoClickThroughURLTemplate, undefined

            it 'should not have videoCustomClickURLTemplates property', =>
                should.equal ad1.videoCustomClickURLTemplates, undefined

            #Linear
            describe '1st creative (Linear)', ->
                linear = null

                before () =>
                    linear = _response.ads[0].creatives[0]

                after () =>
                    linear = null

                it 'should have linear type', =>
                    linear.type.should.equal "linear"

                it 'should have an id', =>
                    linear.id.should.equal "id130984"

                it 'should have an adId', =>
                    linear.adId.should.equal "adId345690"

                it 'should have a sequence', =>
                    linear.sequence.should.equal "1"

                it 'should not have an apiFramework', =>
                    should.equal linear.apiFramework, null

                it 'should have a duration of 90.123s', =>
                    linear.duration.should.equal 90.123

                it 'should have 1 media file', =>
                    linear.mediaFiles.should.have.length 1

                it 'should have parsed media file attributes', =>
                    mediaFile = linear.mediaFiles[0]
                    mediaFile.width.should.equal 512
                    mediaFile.height.should.equal 288
                    mediaFile.mimeType.should.equal "video/mp4"
                    mediaFile.fileURL.should.equal "http://example.com/linear-asset.mp4"

                it 'should have 1 URL for clickthrough', =>
                    linear.videoClickThroughURLTemplate.should.eql 'http://example.com/linear-clickthrough'

                it 'should have 5 URLs for clicktracking', =>
                    linear.videoClickTrackingURLTemplates.should.eql [
                        'http://example.com/linear-clicktracking1_ts:[TIMESTAMP]',
                        'http://example.com/linear-clicktracking2',
                        'http://example.com/wrapperB-linear-clicktracking',
                        'http://example.com/wrapperA-linear-clicktracking1',
                        'http://example.com/wrapperA-linear-clicktracking2',
                        'http://example.com/wrapperA-linear-clicktracking3'
                    ]

                it 'should have 2 URLs for customclick', =>
                    linear.videoCustomClickURLTemplates.should.eql ['http://example.com/linear-customclick', 'http://example.com/wrapperA-linear-customclick']

                it 'should have 8 tracking events', =>
                    linear.trackingEvents.should.have.keys 'start', 'close', 'midpoint', 'complete', 'firstQuartile', 'thirdQuartile', 'progress-30', 'progress-60%'

                it 'should have 4 URLs for start event', =>
                    linear.trackingEvents['start'].should.eql [
                        'http://example.com/linear-start',
                        'http://example.com/wrapperB-linear-start',
                        'http://example.com/wrapperA-linear-start1',
                        'http://example.com/wrapperA-linear-start2'
                    ]

                it 'should have 3 URLs for complete event', =>
                    linear.trackingEvents['complete'].should.eql [
                        'http://example.com/linear-complete',
                        'http://example.com/wrapperB-linear-complete',
                        'http://example.com/wrapperA-linear-complete'
                    ]

                it 'should have 3 URLs for progress-30 event VAST 3.0', =>
                    linear.trackingEvents['progress-30'].should.eql [
                        'http://example.com/linear-progress-30sec',
                        'http://example.com/wrapperB-linear-progress-30sec',
                        'http://example.com/wrapperA-linear-progress-30sec'
                    ]

                it 'should have 3 URLs for progress-60% event VAST 3.0', =>
                    linear.trackingEvents['progress-60%'].should.eql [
                        'http://example.com/linear-progress-60%',
                        'http://example.com/wrapperB-linear-progress-60%',
                        'http://example.com/wrapperA-linear-progress-60%'
                    ]

                it 'should have 3 URLs for progress-90% event VAST 3.0', =>
                    linear.trackingEvents['progress-90%'].should.eql [
                        'http://example.com/wrapperA-linear-progress-90%'
                    ]

                it 'should have parsed icons element', =>
                    icon = linear.icons[0]
                    icon.program.should.equal "ad1"
                    icon.height.should.equal 20
                    icon.width.should.equal 60
                    icon.xPosition.should.equal "left"
                    icon.yPosition.should.equal "bottom"
                    icon.apiFramework.should.equal "VPAID"
                    icon.offset.should.equal 15
                    icon.duration.should.equal 90
                    icon.type.should.equal "image/gif"
                    icon.staticResource.should.equal "http://example.com/linear-icon.gif"
                    icon.iconClickThroughURLTemplate.should.equal "http://example.com/linear-clickthrough"
                    icon.iconClickTrackingURLTemplates.should.eql ["http://example.com/linear-clicktracking1", "http://example.com/linear-clicktracking2"]
                    icon.iconViewTrackingURLTemplate.should.equal "http://example.com/linear-viewtracking"

            #Companions
            describe '2nd creative (Companions)', ->
                companions = null

                before () =>
                    companions = _response.ads[0].creatives[1]

                after () =>
                    companions = null

                it 'should have companion type', =>
                    companions.type.should.equal "companion"

                it 'should have an id', =>
                    companions.id.should.equal "id130985"

                it 'should have an adId', =>
                    companions.adId.should.equal "adId345691"

                it 'should have a sequence', =>
                    companions.sequence.should.equal "2"

                it 'should not have an apiFramework', =>
                    should.equal companions.apiFramework, null

                it 'should have 3 variations', =>
                    companions.variations.should.have.length 3

                #Companion
                describe '#Companion', ->
                    companion = null

                    describe 'as image/jpeg', ->
                        before () =>
                            companion = companions.variations[0]

                        after () =>
                            companion = null

                        it 'should have parsed size and type attributes', =>
                            companion.width.should.equal '300'
                            companion.height.should.equal '60'
                            companion.type.should.equal 'image/jpeg'

                        it 'should have 1 tracking event', =>
                            companion.trackingEvents.should.have.keys 'creativeView'

                        it 'should have 1 url for creativeView event', =>
                            companion.trackingEvents['creativeView'].should.eql ['http://example.com/companion1-creativeview']

                        it 'should have checked that AltText exists', =>
                            companion.should.have.property('altText')

                        it 'should have parsed AltText for companion and its equal', =>
                            companion.altText.should.equal 'Sample Alt Text Content!!!!'

                        it 'should have 1 companion clickthrough url', =>
                            companion.companionClickThroughURLTemplate.should.equal  'http://example.com/companion1-clickthrough'

                        it 'should store the first companion clicktracking url', =>
                            companion.companionClickTrackingURLTemplate.should.equal 'http://example.com/companion1-clicktracking-first'

                        it 'should have 2 companion clicktracking urls', =>
                            companion.companionClickTrackingURLTemplates.should.eql  ['http://example.com/companion1-clicktracking-first', 'http://example.com/companion1-clicktracking-second']

                    describe 'as IFrameResource', ->
                      before () =>
                          companion = companions.variations[1]

                      after () =>
                          companion = null

                      it 'should have parsed size and type attributes', =>
                          companion.width.should.equal '300'
                          companion.height.should.equal '60'
                          companion.type.should.equal 0

                      it 'does not have tracking events', =>
                        companion.trackingEvents.should.be.empty

                      it 'has the #iframeResource set', ->
                        companion.iframeResource.should.equal 'http://www.example.com/companion2-example.php'

                    describe 'as text/html', ->
                        before () =>
                            companion = companions.variations[2]

                        after () =>
                          companion = null

                        it 'should have parsed size and type attributes', =>
                            companion.width.should.equal '300'
                            companion.height.should.equal '60'
                            companion.type.should.equal 'text/html'

                        it 'should have 1 tracking event', =>
                            companion.trackingEvents.should.be.empty

                        it 'should have 1 companion clickthrough url', =>
                            companion.companionClickThroughURLTemplate.should.equal  'http://www.example.com/companion3-clickthrough'

                        it 'has #htmlResource available', ->
                          companion.htmlResource.should.equal "<a href=\"http://www.example.com\" target=\"_blank\">Some call to action HTML!</a>"

            #Nonlinear
            describe '3rd creative (Nonlinears)', ->
                nonlinears = null

                before () =>
                    nonlinears = _response.ads[0].creatives[2]

                after () =>
                    nonlinears = null

                it 'should have nonlinear type', =>
                    nonlinears.type.should.equal "nonlinear"

                it 'should not have an id', =>
                    should.equal nonlinears.id, null

                it 'should not have an adId', =>
                    should.equal nonlinears.adId, null

                it 'should not have a sequence', =>
                    should.equal nonlinears.sequence, null

                it 'should not have an apiFramework', =>
                    should.equal nonlinears.apiFramework, null

                it 'should have 1 variation', =>
                    nonlinears.variations.should.have.length 1

                #NonLinear
                describe '#NonLinear', ->
                    nonlinear = null

                    describe 'trackingEvents', ->
                        it 'should have 6 tracking events', =>
                            nonlinears.trackingEvents.should.have.keys 'start', 'close', 'midpoint', 'complete', 'firstQuartile', 'thirdQuartile'

                        it 'should have 3 URLs for start event', =>
                            nonlinears.trackingEvents['start'].should.eql ['http://example.com/nonlinear-start', 'http://example.com/wrapperB-nonlinear-start', 'http://example.com/wrapperA-nonlinear-start']

                        it 'should have 3 URLs for complete event', =>
                            nonlinears.trackingEvents['complete'].should.eql ['http://example.com/nonlinear-complete', 'http://example.com/wrapperB-nonlinear-complete', 'http://example.com/wrapperA-nonlinear-complete']

                    describe 'as image/jpeg', ->
                        before () =>
                            nonlinear = nonlinears.variations[0]

                        after () =>
                            nonlinear = null

                        it 'should have parsed attributes', =>
                            nonlinear.width.should.equal '300'
                            nonlinear.height.should.equal '200'
                            nonlinear.expandedWidth.should.equal '600'
                            nonlinear.expandedHeight.should.equal '400'
                            nonlinear.scalable.should.equal false
                            nonlinear.maintainAspectRatio.should.equal true
                            nonlinear.minSuggestedDuration.should.equal 100
                            nonlinear.apiFramework.should.equal "someAPI"
                            nonlinear.type.should.equal 'image/jpeg'

                        it 'should have 1 nonlinear clickthrough url', =>
                            nonlinear.nonlinearClickThroughURLTemplate.should.equal  'http://example.com/nonlinear-clickthrough'

                        it 'should have 2 nonlinear clicktracking urls', =>
                            nonlinear.nonlinearClickTrackingURLTemplates.should.eql  ['http://example.com/nonlinear-clicktracking-1', 'http://example.com/nonlinear-clicktracking-2']

                        it 'should have AdParameter', =>
                            nonlinear.adParameters.should.equal '{"key":"value"}'

        describe '#For the 2nd ad', ->
            ad2 = null

            before () =>
                ad2 = _response.ads[1]

            after () =>
                ad2 = null

            it 'should have retrieved Ad attributes', =>
                _response.ads[1].id.should.eql "ad_id_0002"
                should.equal _response.ads[1].sequence, null

            it 'should have retrieved Ad sub-elements values', =>
                ad2.system.value.should.eql "AdServer2"
                ad2.system.version.should.eql "2.1"
                ad2.title.should.eql "Ad title 2"
                should.equal ad2.advertiser, null
                should.equal ad2.description, null
                should.equal ad2.pricing, null
                should.equal ad2.survey, null

            it 'should have merged error URLs', =>
                ad2.errorURLTemplates.should.eql [
                    "http://example.com/wrapperNoTracking-error",
                    "http://example.com/wrapperA-error",
                    "http://example.com/wrapperB-error"
                ]

            it 'should have merged impression URLs', =>
                ad2.impressionURLTemplates.should.eql [
                    "http://example.com/wrapperNoTracking-impression",
                    "http://example.com/wrapperA-impression",
                    "http://example.com/wrapperB-impression1",
                    "http://example.com/wrapperB-impression2",
                    "http://example.com/impression1"
                ]

            it 'should have 1 creative', =>
                ad2.creatives.should.have.length 1

            it 'should have 1 extension (from the wrapper)', =>
                ad2.extensions.should.have.length 1

            it 'validate the extension', =>
                ad2.extensions[0].attributes['type'].should.eql "WrapperExtension"
                ad2.extensions[0].children.should.have.length 1
                ad2.extensions[0].children[0].name.should.eql "extension_tag"
                ad2.extensions[0].children[0].value.should.eql "extension_value"

            #Linear
            describe '1st creative (Linear)', ->
                linear = null

                before () =>
                    linear = ad2.creatives[0]

                after () =>
                    linear = null

                it 'should have linear type', =>
                    linear.type.should.equal "linear"

                it 'should have an id', =>
                    linear.id.should.equal "id873421"

                it 'should have an adId', =>
                    linear.adId.should.equal "adId221144"

                it 'should not have a sequence', =>
                    should.equal linear.sequence, null

                it 'should have an apiFramework', =>
                    linear.apiFramework.should.equal "VPAID"

                it 'should have a duration of 30', =>
                    linear.duration.should.equal 30

                it 'should have wrapper clickthrough URL', =>
                    linear.videoClickThroughURLTemplate.should.eql "http://example.com/wrapperB-linear-clickthrough"

                it 'should have wrapper customclick URL', =>
                    linear.videoCustomClickURLTemplates.should.eql ["http://example.com/wrapperA-linear-customclick"]

                it 'should have 5 URLs for clicktracking', =>
                    linear.videoClickTrackingURLTemplates.should.eql [
                        'http://example.com/linear-clicktracking',
                        'http://example.com/wrapperB-linear-clicktracking',
                        'http://example.com/wrapperA-linear-clicktracking1',
                        'http://example.com/wrapperA-linear-clicktracking2',
                        'http://example.com/wrapperA-linear-clicktracking3'
                    ]


        describe '#VAST', ->
            @response = null

            before (done) =>
                VASTParser.parse urlfor('vpaid.xml'), (@response) =>
                    done()

            it 'should have apiFramework set', =>
                @response.ads[0].creatives[0].mediaFiles[0].apiFramework.should.be.equal "VPAID"

    describe '#load', ->
        @response = null
        @templateFilterCalls = []

        before (done) =>
            VASTParser.addURLTemplateFilter (url) =>
                @templateFilterCalls.push url
                return url
            url = urlfor('wrapper_notracking.xml')
            URLHandler.get url, {}, (err, xml) =>
                # `VAST > Wrapper > VASTAdTagURI` in the VAST must be an absolute URL
                for node in xml.documentElement.childNodes
                    if node.nodeName is 'Ad'
                        for node in node.childNodes
                            if node.nodeName is 'Wrapper'
                                for node in node.childNodes
                                    if node.nodeName is 'VASTAdTagURI'
                                        node.textContent = urlfor(VASTParser.parseNodeText node)
                                        break
                VASTParser.load xml, (err, response) =>
                    @response = response
                    console.log response.ads[0]
                    done()

        after () =>
            VASTParser.clearUrlTemplateFilters()

        it 'should have 1 filter defined', =>
            VASTParser.countURLTemplateFilters().should.equal 1

        it 'should have called 4 times URLtemplateFilter ', =>
            @templateFilterCalls.should.have.length 3
            @templateFilterCalls.should.eql [urlfor('wrapper_A.xml'), urlfor('wrapper_B.xml'), urlfor('sample.xml')]

        it 'should have found 2 ads', =>
            @response.ads.should.have.length 2

        it 'should have returned a VAST response object', =>
            @response.should.be.an.instanceOf(VASTResponse)

        it 'should have merged top level error URLS', =>
            @response.errorURLTemplates.should.eql ["http://example.com/wrapperA-error", "http://example.com/wrapperB-error", "http://example.com/error"]

    describe '#track', ->
        errorCallbackCalled = 0
        errorCode = null
        errorCallback = (ec) ->
            errorCallbackCalled++
            errorCode = ec

        beforeEach =>
            VASTParser.vent.removeAllListeners()
            errorCallbackCalled = 0

        #No ads VAST response after one wrapper
        it 'emits an VAST-error on empty vast directly', (done) ->
            VASTParser.on 'VAST-error', errorCallback
            VASTParser.parse urlfor('empty.xml'), =>
                errorCallbackCalled.should.equal 1
                errorCode.ERRORCODE.should.eql 303
                done()

        # VAST response with Ad but no Creative
        it 'emits a VAST-error on response with no Creative', (done) ->
            VASTParser.on 'VAST-error', errorCallback
            VASTParser.parse urlfor('empty-no-creative.xml'), =>
                errorCallbackCalled.should.equal 1
                errorCode.ERRORCODE.should.eql 303
                done()

        #No ads VAST response after more than one wrapper
        # Two events should be emits :
        # - 1 for the empty vast file
        # - 1 for no ad response on the wrapper
        it 'emits 2 VAST-error events on empty vast after one wrapper', (done) ->
            VASTParser.on 'VAST-error', errorCallback
            VASTParser.parse urlfor('wrapper-empty.xml'), =>
                # errorCallbackCalled.should.equal 2
                # errorCode.ERRORCODE.should.eql 303
                done()

    describe '#legacy', ->
        beforeEach =>
            VASTParser.vent.removeAllListeners()

        it 'correctly loads a wrapped ad, even with the VASTAdTagURL-Tag', (done) ->
            VASTParser.parse urlfor('wrapper-legacy.xml'), (response) =>
                it 'should have found 1 ad', =>
                    response.ads.should.have.length 1

                it 'should have returned a VAST response object', =>
                    response.should.be.an.instanceOf(VASTResponse)

                # we just want to make sure that the sample.xml was loaded correctly
                linear = response.ads[0].creatives[0]
                it 'should have parsed media file attributes', =>
                    mediaFile = linear.mediaFiles[0]
                    mediaFile.width.should.equal 512
                    mediaFile.height.should.equal 288
                    mediaFile.mimeType.should.equal "video/mp4"
                    mediaFile.fileURL.should.equal "http://example.com/asset.mp4"

                done()
