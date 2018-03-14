/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const should = require('should');
const path = require('path');
const VASTParser = require('../src/parser/parser');
const VASTResponse = require('../src/response');

const vastParser = new VASTParser();

const urlfor = relpath => `file://${path.resolve(path.dirname(module.filename), 'vastfiles', relpath).replace(/\\/g, '/')}`;

describe('VASTParser', function() {
    describe('#parse', function() {
        this.response = null;
        let _response = null;
        this.templateFilterCalls = [];
        let eventsTriggered = null;

        before(done => {
            eventsTriggered = [];

            vastParser.on('resolving', variables => eventsTriggered.push({ name: 'resolving', data: variables }));
            vastParser.on('resolved', variables => eventsTriggered.push({ name: 'resolved', data: variables }));

            vastParser.addURLTemplateFilter(url => {
              this.templateFilterCalls.push(url);
              return url;
            });
            return vastParser.parse(urlfor('wrapper-notracking.xml'), response => {
                this.response = response;
                _response = this.response;
                return done();
            });
        });

        after(() => {
            eventsTriggered = [];
            vastParser.vent.removeAllListeners();
            return vastParser.clearUrlTemplateFilters();
        });

        it('should have 1 filter defined', () => {
            return vastParser.countURLTemplateFilters().should.equal(1);
        });

        it('should have called 4 times URLtemplateFilter ', () => {
            this.templateFilterCalls.should.have.length(4);
            return this.templateFilterCalls.should.eql([urlfor('wrapper-notracking.xml'), urlfor('wrapper-a.xml'), urlfor('wrapper-b.xml'), urlfor('sample.xml')]);
    });

        it('should have emiited resolving/resolved events', () => {
            return eventsTriggered.should.eql([
                { name : 'resolving', data : { url : urlfor('wrapper-notracking.xml') }},
                { name : 'resolved',  data : { url : urlfor('wrapper-notracking.xml') }},
                { name : 'resolving', data : { url : urlfor('wrapper-a.xml') }},
                { name : 'resolved',  data : { url : urlfor('wrapper-a.xml') }},
                { name : 'resolving', data : { url : urlfor('wrapper-b.xml') }},
                { name : 'resolved',  data : { url : urlfor('wrapper-b.xml') }},
                { name : 'resolving', data : { url : urlfor('sample.xml') }},
                { name : 'resolved',  data : { url : urlfor('sample.xml') }},
            ]);
    });

        it('should have found 2 ads', () => {
            return this.response.ads.should.have.length(2);
        });

        it('should have returned a VAST response object', () => {
            return this.response.should.be.an.instanceOf(VASTResponse);
        });

        describe('#duration', () =>
            [null, undefined, -1, 0, 1, '1', '00:00', '00:00:00:00', 'test', '00:test:01', '00:00:01.001', '00:00:01.test'].map((item) =>
                (item =>
                    it(`should not return NaN for \`${item}\``, () => isNaN(vastParser.utils.parseDuration(item)).should.eql(false))
                )(item))
        );

        describe('#duration', () =>
            [null, undefined, -1, 0, 1, '1', '00:00', '00:00:00:00', 'test', '00:test:01', '00:00:01.001', '00:00:01.test'].map((item) =>
                (item =>
                    it(`should not return NaN for \`${item}\``, () => isNaN(vastParser.utils.parseDuration(item)).should.eql(false))
                )(item))
        );

        describe('#For the 1st ad', function() {
            let ad1 = null;

            before(() => {
                return ad1 = _response.ads[0];
        });

            after(() => {
                return ad1 = null;
            });

            it('should have retrieved Ad attributes', () => {
                ad1.id.should.eql("ad_id_0001");
                return ad1.sequence.should.eql("1");
            });

            it('should have retrieved Ad sub-elements values', () => {
                ad1.system.value.should.eql("AdServer");
                ad1.system.version.should.eql("2.0");
                ad1.title.should.eql("Ad title");
                ad1.advertiser.should.eql("Advertiser name");
                ad1.description.should.eql("Description text");
                ad1.pricing.value.should.eql("1.09");
                ad1.pricing.model.should.eql("CPM");
                ad1.pricing.currency.should.eql("USD");
                return ad1.survey.should.eql("http://example.com/survey");
            });

            it('should have merged wrapped ad error URLs', () => {
                return ad1.errorURLTemplates.should.eql([
                    "http://example.com/wrapperNoTracking-error",
                    "http://example.com/wrapperA-error",
                    "http://example.com/wrapperB-error",
                    "http://example.com/error_[ERRORCODE]"
                ]);
        });

            it('should have merged impression URLs', () => {
                return ad1.impressionURLTemplates.should.eql([
                    "http://example.com/wrapperNoTracking-impression",
                    "http://example.com/wrapperA-impression",
                    "http://example.com/wrapperB-impression1",
                    "http://example.com/wrapperB-impression2",
                    "http://example.com/impression1_asset:[ASSETURI]_[CACHEBUSTING]",
                    "http://example.com/impression2_[random]",
                    "http://example.com/impression3_[RANDOM]"
                ]);
        });

            it('should have 3 creatives', () => {
                return ad1.creatives.should.have.length(3);
            });

            it('should have 4 extensions', () => {
                return ad1.extensions.should.have.length(4);
            });

            it('validate first extension', () => {
                ad1.extensions[0].attributes['type'].should.eql("WrapperExtension");
                ad1.extensions[0].children.should.have.length(1);
                ad1.extensions[0].children[0].name.should.eql("extension_tag");
                return ad1.extensions[0].children[0].value.should.eql("extension_value");
            });

            it('validate second extension', () => {
                ad1.extensions[1].attributes['type'].should.eql("Pricing");
                ad1.extensions[1].children.should.have.length(1);
                ad1.extensions[1].children[0].name.should.eql("Price");
                ad1.extensions[1].children[0].value.should.eql("0");
                ad1.extensions[1].children[0].attributes['model'].should.eql("CPM");
                ad1.extensions[1].children[0].attributes['currency'].should.eql("USD");
                return ad1.extensions[1].children[0].attributes['source'].should.eql("someone");
            });

            it('validate third extension', () => {
                ad1.extensions[2].attributes['type'].should.eql("Count");
                ad1.extensions[2].children.should.have.length(1);
                ad1.extensions[2].children[0].name.should.eql("#cdata-section");
                return ad1.extensions[2].children[0].value.should.eql("4");
            });

            it('validate fourth extension', () => {
                ad1.extensions[3].attributes.should.eql({});
                ad1.extensions[3].children.should.have.length(1);
                ad1.extensions[3].children[0].name.should.eql("#text");
                return ad1.extensions[3].children[0].value.should.eql("{ foo: bar }");
            });

            it('should not have trackingEvents property', () => {
                return should.equal(ad1.trackingEvents, undefined);
            });

            it('should not have videoClickTrackingURLTemplates property', () => {
                return should.equal(ad1.videoClickTrackingURLTemplates, undefined);
            });

            it('should not have videoClickThroughURLTemplate property', () => {
                return should.equal(ad1.videoClickThroughURLTemplate, undefined);
            });

            it('should not have videoCustomClickURLTemplates property', () => {
                return should.equal(ad1.videoCustomClickURLTemplates, undefined);
            });

            //Linear
            describe('1st creative (Linear)', function() {
                let linear = null;

                before(() => {
                    return linear = _response.ads[0].creatives[0];
            });

                after(() => {
                    return linear = null;
                });

                it('should have linear type', () => {
                    return linear.type.should.equal("linear");
                });

                it('should have an id', () => {
                    return linear.id.should.equal("id130984");
                });

                it('should have an adId', () => {
                    return linear.adId.should.equal("adId345690");
                });

                it('should have a sequence', () => {
                    return linear.sequence.should.equal("1");
                });

                it('should not have an apiFramework', () => {
                    return should.equal(linear.apiFramework, null);
                });

                it('should have a duration of 90.123s', () => {
                    return linear.duration.should.equal(90.123);
                });

                it('should have 2 media file', () => {
                    return linear.mediaFiles.should.have.length(2);
                });

                it('should have parsed 1st media file attributes', () => {
                    linear.mediaFiles[0].width.should.equal(512);
                    linear.mediaFiles[0].height.should.equal(288);
                    linear.mediaFiles[0].mimeType.should.equal("video/mp4");
                    return linear.mediaFiles[0].fileURL.should.equal("http://example.com/linear-asset.mp4");
                });

                it('should have parsed 2nd media file attributes', () => {
                    linear.mediaFiles[1].width.should.equal(512);
                    linear.mediaFiles[1].height.should.equal(288);
                    linear.mediaFiles[1].mimeType.should.equal("application/javascript");
                    linear.mediaFiles[1].apiFramework.should.equal("VPAID");
                    linear.mediaFiles[1].deliveryType.should.equal("progressive");
                    return linear.mediaFiles[1].fileURL.should.equal("parser.js?adData=http%3A%2F%2Fad.com%2F%3Fcb%3D%5Btime%5D");
                });

                it('should have 1 URL for clickthrough', () => {
                    return linear.videoClickThroughURLTemplate.should.eql('http://example.com/linear-clickthrough');
                });

                it('should have 5 URLs for clicktracking', () => {
                    return linear.videoClickTrackingURLTemplates.should.eql([
                        'http://example.com/linear-clicktracking1_ts:[TIMESTAMP]',
                        'http://example.com/linear-clicktracking2',
                        'http://example.com/wrapperB-linear-clicktracking',
                        'http://example.com/wrapperA-linear-clicktracking1',
                        'http://example.com/wrapperA-linear-clicktracking2',
                        'http://example.com/wrapperA-linear-clicktracking3'
                    ]);
            });

                it('should have 2 URLs for customclick', () => {
                    return linear.videoCustomClickURLTemplates.should.eql(['http://example.com/linear-customclick', 'http://example.com/wrapperA-linear-customclick']);
            });

                it('should have 8 tracking events', () => {
                    return linear.trackingEvents.should.have.keys('start', 'close', 'midpoint', 'complete', 'firstQuartile', 'thirdQuartile', 'progress-30', 'progress-60%');
                });

                it('should have 4 URLs for start event', () => {
                    return linear.trackingEvents['start'].should.eql([
                        'http://example.com/linear-start',
                        'http://example.com/wrapperB-linear-start',
                        'http://example.com/wrapperA-linear-start1',
                        'http://example.com/wrapperA-linear-start2'
                    ]);
            });

                it('should have 3 URLs for complete event', () => {
                    return linear.trackingEvents['complete'].should.eql([
                        'http://example.com/linear-complete',
                        'http://example.com/wrapperB-linear-complete',
                        'http://example.com/wrapperA-linear-complete'
                    ]);
            });

                it('should have 3 URLs for progress-30 event VAST 3.0', () => {
                    return linear.trackingEvents['progress-30'].should.eql([
                        'http://example.com/linear-progress-30sec',
                        'http://example.com/wrapperB-linear-progress-30sec',
                        'http://example.com/wrapperA-linear-progress-30sec'
                    ]);
            });

                it('should have 3 URLs for progress-60% event VAST 3.0', () => {
                    return linear.trackingEvents['progress-60%'].should.eql([
                        'http://example.com/linear-progress-60%',
                        'http://example.com/wrapperB-linear-progress-60%',
                        'http://example.com/wrapperA-linear-progress-60%'
                    ]);
            });

                it('should have 3 URLs for progress-90% event VAST 3.0', () => {
                    return linear.trackingEvents['progress-90%'].should.eql([
                        'http://example.com/wrapperA-linear-progress-90%'
                    ]);
            });

                return it('should have parsed icons element', () => {
                    const icon = linear.icons[0];
                    icon.program.should.equal("ad1");
                    icon.height.should.equal(20);
                    icon.width.should.equal(60);
                    icon.xPosition.should.equal("left");
                    icon.yPosition.should.equal("bottom");
                    icon.apiFramework.should.equal("VPAID");
                    icon.offset.should.equal(15);
                    icon.duration.should.equal(90);
                    icon.type.should.equal("image/gif");
                    icon.staticResource.should.equal("http://example.com/linear-icon.gif");
                    icon.iconClickThroughURLTemplate.should.equal("http://example.com/linear-clickthrough");
                    icon.iconClickTrackingURLTemplates.should.eql(["http://example.com/linear-clicktracking1", "http://example.com/linear-clicktracking2"]);
                    return icon.iconViewTrackingURLTemplate.should.equal("http://example.com/linear-viewtracking");
                });
            });

            //Companions
            describe('2nd creative (Companions)', function() {
                let companions = null;

                before(() => {
                    return companions = _response.ads[0].creatives[1];
            });

                after(() => {
                    return companions = null;
                });

                it('should have companion type', () => {
                    return companions.type.should.equal("companion");
                });

                it('should have an id', () => {
                    return companions.id.should.equal("id130985");
                });

                it('should have an adId', () => {
                    return companions.adId.should.equal("adId345691");
                });

                it('should have a sequence', () => {
                    return companions.sequence.should.equal("2");
                });

                it('should not have an apiFramework', () => {
                    return should.equal(companions.apiFramework, null);
                });

                it('should have 3 variations', () => {
                    return companions.variations.should.have.length(3);
                });

                //Companion
                return describe('#Companion', function() {
                    let companion = null;

                    describe('as image/jpeg', function() {
                        before(() => {
                            return companion = companions.variations[0];
                    });

                        after(() => {
                            return companion = null;
                        });

                        it('should have parsed size and type attributes', () => {
                            companion.width.should.equal('300');
                            companion.height.should.equal('60');
                            return companion.type.should.equal('image/jpeg');
                        });

                        it('should have 1 tracking event', () => {
                            return companion.trackingEvents.should.have.keys('creativeView');
                        });

                        it('should have 1 url for creativeView event', () => {
                            return companion.trackingEvents['creativeView'].should.eql(['http://example.com/companion1-creativeview']);
                    });

                        it('should have checked that AltText exists', () => {
                            return companion.should.have.property('altText');
                        });

                        it('should have parsed AltText for companion and its equal', () => {
                            return companion.altText.should.equal('Sample Alt Text Content!!!!');
                        });

                        it('should have 1 companion clickthrough url', () => {
                            return companion.companionClickThroughURLTemplate.should.equal('http://example.com/companion1-clickthrough');
                        });

                        it('should store the first companion clicktracking url', () => {
                            return companion.companionClickTrackingURLTemplate.should.equal('http://example.com/companion1-clicktracking-first');
                        });

                        return it('should have 2 companion clicktracking urls', () => {
                            return companion.companionClickTrackingURLTemplates.should.eql(['http://example.com/companion1-clicktracking-first', 'http://example.com/companion1-clicktracking-second']);
                    });
                });

                    describe('as IFrameResource', function() {
                      before(() => {
                          return companion = companions.variations[1];
                  });

                      after(() => {
                          return companion = null;
                      });

                      it('should have parsed size and type attributes', () => {
                          companion.width.should.equal('300');
                          companion.height.should.equal('60');
                          return companion.type.should.equal(0);
                      });

                      it('does not have tracking events', () => {
                        return companion.trackingEvents.should.be.empty;
                      });

                      return it('has the #iframeResource set', () => companion.iframeResource.should.equal('http://www.example.com/companion2-example.php'));
                    });

                    return describe('as text/html', function() {
                        before(() => {
                            return companion = companions.variations[2];
                    });

                        after(() => {
                          return companion = null;
                        });

                        it('should have parsed size and type attributes', () => {
                            companion.width.should.equal('300');
                            companion.height.should.equal('60');
                            return companion.type.should.equal('text/html');
                        });

                        it('should have 1 tracking event', () => {
                            return companion.trackingEvents.should.be.empty;
                        });

                        it('should have 1 companion clickthrough url', () => {
                            return companion.companionClickThroughURLTemplate.should.equal('http://www.example.com/companion3-clickthrough');
                        });

                        return it('has #htmlResource available', () => companion.htmlResource.should.equal("<a href=\"http://www.example.com\" target=\"_blank\">Some call to action HTML!</a>"));
                    });
                });
            });

            //Nonlinear
            return describe('3rd creative (Nonlinears)', function() {
                let nonlinears = null;

                before(() => {
                    return nonlinears = _response.ads[0].creatives[2];
            });

                after(() => {
                    return nonlinears = null;
                });

                it('should have nonlinear type', () => {
                    return nonlinears.type.should.equal("nonlinear");
                });

                it('should not have an id', () => {
                    return should.equal(nonlinears.id, null);
                });

                it('should not have an adId', () => {
                    return should.equal(nonlinears.adId, null);
                });

                it('should not have a sequence', () => {
                    return should.equal(nonlinears.sequence, null);
                });

                it('should not have an apiFramework', () => {
                    return should.equal(nonlinears.apiFramework, null);
                });

                it('should have 1 variation', () => {
                    return nonlinears.variations.should.have.length(1);
                });

                //NonLinear
                return describe('#NonLinear', function() {
                    let nonlinear = null;

                    describe('trackingEvents', function() {
                        it('should have 6 tracking events', () => {
                            return nonlinears.trackingEvents.should.have.keys('start', 'close', 'midpoint', 'complete', 'firstQuartile', 'thirdQuartile');
                        });

                        it('should have 3 URLs for start event', () => {
                            return nonlinears.trackingEvents['start'].should.eql(['http://example.com/nonlinear-start', 'http://example.com/wrapperB-nonlinear-start', 'http://example.com/wrapperA-nonlinear-start']);
                    });

                        return it('should have 3 URLs for complete event', () => {
                            return nonlinears.trackingEvents['complete'].should.eql(['http://example.com/nonlinear-complete', 'http://example.com/wrapperB-nonlinear-complete', 'http://example.com/wrapperA-nonlinear-complete']);
                    });
                });

                    return describe('as image/jpeg', function() {
                        before(() => {
                            return nonlinear = nonlinears.variations[0];
                    });

                        after(() => {
                            return nonlinear = null;
                        });

                        it('should have parsed attributes', () => {
                            nonlinear.width.should.equal('300');
                            nonlinear.height.should.equal('200');
                            nonlinear.expandedWidth.should.equal('600');
                            nonlinear.expandedHeight.should.equal('400');
                            nonlinear.scalable.should.equal(false);
                            nonlinear.maintainAspectRatio.should.equal(true);
                            nonlinear.minSuggestedDuration.should.equal(100);
                            nonlinear.apiFramework.should.equal("someAPI");
                            return nonlinear.type.should.equal('image/jpeg');
                        });

                        it('should have 1 nonlinear clickthrough url', () => {
                            return nonlinear.nonlinearClickThroughURLTemplate.should.equal('http://example.com/nonlinear-clickthrough');
                        });

                        it('should have 2 nonlinear clicktracking urls', () => {
                            return nonlinear.nonlinearClickTrackingURLTemplates.should.eql(['http://example.com/nonlinear-clicktracking-1', 'http://example.com/nonlinear-clicktracking-2']);
                    });

                        return it('should have AdParameter', () => {
                            return nonlinear.adParameters.should.equal('{"key":"value"}');
                        });
                    });
                });
            });
        });

        describe('#For the 2nd ad', function() {
            let ad2 = null;

            before(() => {
                return ad2 = _response.ads[1];
        });

            after(() => {
                return ad2 = null;
            });

            it('should have retrieved Ad attributes', () => {
                _response.ads[1].id.should.eql("ad_id_0002");
                return should.equal(_response.ads[1].sequence, null);
            });

            it('should have retrieved Ad sub-elements values', () => {
                ad2.system.value.should.eql("AdServer2");
                ad2.system.version.should.eql("2.1");
                ad2.title.should.eql("Ad title 2");
                should.equal(ad2.advertiser, null);
                should.equal(ad2.description, null);
                should.equal(ad2.pricing, null);
                return should.equal(ad2.survey, null);
            });

            it('should have merged error URLs', () => {
                return ad2.errorURLTemplates.should.eql([
                    "http://example.com/wrapperNoTracking-error",
                    "http://example.com/wrapperA-error",
                    "http://example.com/wrapperB-error"
                ]);
        });

            it('should have merged impression URLs', () => {
                return ad2.impressionURLTemplates.should.eql([
                    "http://example.com/wrapperNoTracking-impression",
                    "http://example.com/wrapperA-impression",
                    "http://example.com/wrapperB-impression1",
                    "http://example.com/wrapperB-impression2",
                    "http://example.com/impression1"
                ]);
        });

            it('should have 1 creative', () => {
                return ad2.creatives.should.have.length(1);
            });

            it('should have 1 extension (from the wrapper)', () => {
                return ad2.extensions.should.have.length(1);
            });

            it('validate the extension', () => {
                ad2.extensions[0].attributes['type'].should.eql("WrapperExtension");
                ad2.extensions[0].children.should.have.length(1);
                ad2.extensions[0].children[0].name.should.eql("extension_tag");
                return ad2.extensions[0].children[0].value.should.eql("extension_value");
            });

            //Linear
            return describe('1st creative (Linear)', function() {
                let linear = null;

                before(() => {
                    return linear = ad2.creatives[0];
            });

                after(() => {
                    return linear = null;
                });

                it('should have linear type', () => {
                    return linear.type.should.equal("linear");
                });

                it('should have an id', () => {
                    return linear.id.should.equal("id873421");
                });

                it('should have an adId', () => {
                    return linear.adId.should.equal("adId221144");
                });

                it('should not have a sequence', () => {
                    return should.equal(linear.sequence, null);
                });

                it('should have an apiFramework', () => {
                    return linear.apiFramework.should.equal("VPAID");
                });

                it('should have a duration of 30', () => {
                    return linear.duration.should.equal(30);
                });

                it('should have wrapper clickthrough URL', () => {
                    return linear.videoClickThroughURLTemplate.should.eql("http://example.com/wrapperB-linear-clickthrough");
                });

                it('should have wrapper customclick URL', () => {
                    return linear.videoCustomClickURLTemplates.should.eql(["http://example.com/wrapperA-linear-customclick"]);
            });

                return it('should have 5 URLs for clicktracking', () => {
                    return linear.videoClickTrackingURLTemplates.should.eql([
                        'http://example.com/linear-clicktracking',
                        'http://example.com/wrapperB-linear-clicktracking',
                        'http://example.com/wrapperA-linear-clicktracking1',
                        'http://example.com/wrapperA-linear-clicktracking2',
                        'http://example.com/wrapperA-linear-clicktracking3'
                    ]);
            });
        });
    });


        return describe('#VPAID', function() {
            this.response = null;

            before(done => {
                return vastParser.parse(urlfor('vpaid.xml'), response => {
                    this.response = response;
                    return done();
                });
            });

            it('should have apiFramework set', () => {
                return this.response.ads[0].creatives[0].mediaFiles[0].apiFramework.should.be.equal("VPAID");
            });

            return it('should have duration set to -1', () => {
                return this.response.ads[0].creatives[0].duration.should.be.equal(-1);
            });
        });
    });


    describe('#load', function() {
        this.response = null;
        this.templateFilterCalls = [];

        before(done => {
            vastParser.addURLTemplateFilter(url => {
                this.templateFilterCalls.push(url);
                return url;
            });
            const url = urlfor('wrapper-notracking.xml');
            return vastParser.urlHandler.get(url, {}, (err, xml) => {
                // `VAST > Wrapper > VASTAdTagURI` in the VAST must be an absolute URL
                for (let node of Array.from(xml.documentElement.childNodes)) {
                    if (node.nodeName === 'Ad') {
                        for (node of Array.from(node.childNodes)) {
                            if (node.nodeName === 'Wrapper') {
                                for (node of Array.from(node.childNodes)) {
                                    if (node.nodeName === 'VASTAdTagURI') {
                                        node.textContent = urlfor(vastParser.utils.parseNodeText(node));
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                return vastParser.load(xml, (err, response) => {
                    this.response = response;
                    return done();
                });
            });
        });

        after(() => {
            return vastParser.clearUrlTemplateFilters();
        });

        it('should have 1 filter defined', () => {
            return vastParser.countURLTemplateFilters().should.equal(1);
        });

        it('should have called 3 times URLtemplateFilter ', () => {
            this.templateFilterCalls.should.have.length(3);
            return this.templateFilterCalls.should.eql([urlfor('wrapper-a.xml'), urlfor('wrapper-b.xml'), urlfor('sample.xml')]);
    });

        it('should have found 2 ads', () => {
            return this.response.ads.should.have.length(2);
        });

        return it('should have returned a VAST response object', () => {
            return this.response.should.be.an.instanceOf(VASTResponse);
        });
    });


    describe('#Tracking', function() {
        let trackCalls = null;
        let dataTriggered = null;

        beforeEach(() => {
            vastParser.vent.removeAllListeners();
            dataTriggered = [];
            trackCalls = [];

            vastParser.on('VAST-error', variables => dataTriggered.push(variables));

            return vastParser.vastUtil.track = (templates, variables) => {
                return trackCalls.push({
                    templates,
                    variables
                });
            };
    });

        describe('#No-Ad', function() {
            it('emits a VAST-error & track', done =>
                vastParser.parse(urlfor('empty-no-ad.xml'), response => {
                    // Response doesn't have any ads
                    response.ads.should.eql([]);
                    // Error has been triggered
                    dataTriggered.length.should.eql(1);
                    dataTriggered[0].ERRORCODE.should.eql(303);
                    dataTriggered[0].extensions.should.eql([]);
                    // Tracking has been done
                    trackCalls.length.should.eql(1);
                    trackCalls[0].templates.should.eql([ 'http://example.com/empty-no-ad' ]);
                    trackCalls[0].variables.should.eql({ ERRORCODE: 303 });
                    return done();
                })
            );

            return it('when wrapped, emits a VAST-error & track', done =>
                vastParser.parse(urlfor('wrapper-empty.xml'), response => {
                    // Response doesn't have any ads
                    response.ads.should.eql([]);
                    // Error has been triggered
                    dataTriggered.length.should.eql(1);
                    dataTriggered[0].ERRORCODE.should.eql(303);
                    dataTriggered[0].extensions[0].children[0].name.should.eql('paramWrapperEmptyNoAd');
                    dataTriggered[0].extensions[0].children[0].value.should.eql('valueWrapperEmptyNoAd');
                    // Tracking has been done
                    trackCalls.length.should.eql(1);
                    trackCalls[0].templates.should.eql([ 'http://example.com/wrapper-empty_wrapper-error', 'http://example.com/empty-no-ad' ]);
                    trackCalls[0].variables.should.eql({ ERRORCODE: 303 });
                    return done();
                })
            );
        });

        describe('#Ad with no creatives', function() {
            it('emits a VAST-error & track', done =>
                vastParser.parse(urlfor('empty-no-creative.xml'), response => {
                    // Response doesn't have any ads
                    response.ads.should.eql([]);
                    // Error has been triggered
                    dataTriggered.length.should.eql(1);
                    dataTriggered[0].ERRORCODE.should.eql(303);
                    dataTriggered[0].extensions[0].children[0].name.should.eql('paramEmptyNoCreative');
                    dataTriggered[0].extensions[0].children[0].value.should.eql('valueEmptyNoCreative');
                    // Tracking has been done
                    trackCalls.length.should.eql(1);
                    trackCalls[0].templates.should.eql([ 'http://example.com/empty-no-creative_inline-error' ]);
                    trackCalls[0].variables.should.eql({ ERRORCODE: 303 });
                    return done();
                })
            );

            return it('when wrapped, emits a VAST-error & track', done =>
                vastParser.parse(urlfor('wrapper-empty-no-creative.xml'), response => {
                    // Response doesn't have any ads
                    response.ads.should.eql([]);
                    // Error has been triggered
                    dataTriggered.length.should.eql(1);
                    dataTriggered[0].ERRORCODE.should.eql(303);
                    dataTriggered[0].extensions[0].children[0].name.should.eql('paramWrapperEmptyNoCreative');
                    dataTriggered[0].extensions[0].children[0].value.should.eql('valueWrapperEmptyNoCreative');
                    dataTriggered[0].extensions[1].children[0].name.should.eql('paramEmptyNoCreative');
                    dataTriggered[0].extensions[1].children[0].value.should.eql('valueEmptyNoCreative');
                    // Tracking has been done
                    trackCalls.length.should.eql(1);
                    trackCalls[0].templates.should.eql([ 'http://example.com/wrapper-no-creative_wrapper-error' , 'http://example.com/empty-no-creative_inline-error' ]);
                    trackCalls[0].variables.should.eql({ ERRORCODE: 303 });
                    return done();
                })
            );
        });

        describe('#Invalid XML file (pasing error)', function() {
            it('returns an error', done =>
                vastParser.parse(urlfor('invalid-xmlfile.xml'), (response, err) => {
                    // No response returned
                    should.not.exist(response);
                    // Error returned
                    err.should.be.instanceof(Error).and.have.property('message', 'Invalid VAST XMLDocument');
                    return done();
                })
            );

            return it('when wrapped, emits a VAST-error & track', done =>
                vastParser.parse(urlfor('wrapper-invalid-xmlfile.xml'), (response, err) => {
                    // Response doesn't have any ads
                    response.ads.should.eql([]);
                    // No error returned
                    should.not.exist(err);
                    // Error has been triggered
                    dataTriggered.length.should.eql(1);
                    dataTriggered[0].ERRORCODE.should.eql(301);
                    dataTriggered[0].extensions[0].children[0].name.should.eql('paramWrapperInvalidXmlfile');
                    dataTriggered[0].extensions[0].children[0].value.should.eql('valueWrapperInvalidXmlfile');
                    // Tracking has been done
                    trackCalls.length.should.eql(1);
                    trackCalls[0].templates.should.eql([ 'http://example.com/wrapper-invalid-xmlfile_wrapper-error' ]);
                    trackCalls[0].variables.should.eql({ ERRORCODE: 301 });
                    return done();
                })
            );
        });

        return describe('#Wrapper limit reached', () =>
            it('emits a VAST-error & track', done =>
                vastParser.parse(urlfor('wrapper-a.xml'), { wrapperLimit: 1 }, (response, err) => {
                    // Response doesn't have any ads
                    response.ads.should.eql([]);
                    // No error returned
                    should.not.exist(err);
                    // Error has been triggered
                    dataTriggered.length.should.eql(1);
                    dataTriggered[0].ERRORCODE.should.eql(302);
                    dataTriggered[0].extensions[0].children[0].name.should.eql('extension_tag');
                    dataTriggered[0].extensions[0].children[0].value.should.eql('extension_value');
                    // Tracking has been done
                    trackCalls.length.should.eql(1);
                    trackCalls[0].templates.should.eql([ 'http://example.com/wrapperA-error' ]);
                    trackCalls[0].variables.should.eql({ ERRORCODE: 302 });
                    return done();
                })
            )
        );
    });


    return describe('#legacy', function() {

        beforeEach(() => {
            return vastParser.vent.removeAllListeners();
        });

        return it('correctly loads a wrapped ad, even with the VASTAdTagURL-Tag', done =>
            vastParser.parse(urlfor('wrapper-legacy.xml'), response => {
                it('should have found 1 ad', () => {
                    return response.ads.should.have.length(1);
                });

                it('should have returned a VAST response object', () => {
                    return response.should.be.an.instanceOf(VASTResponse);
                });

                // we just want to make sure that the sample.xml was loaded correctly
                const linear = response.ads[0].creatives[0];
                it('should have parsed media file attributes', () => {
                    const mediaFile = linear.mediaFiles[0];
                    mediaFile.width.should.equal(512);
                    mediaFile.height.should.equal(288);
                    mediaFile.mimeType.should.equal("video/mp4");
                    return mediaFile.fileURL.should.equal("http://example.com/asset.mp4");
                });

                return done();
            })
        );
    });
});
