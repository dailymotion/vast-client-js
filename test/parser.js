import path from 'path';
import should from 'should';
import { VASTParser } from '../src/parser/parser';
import { VASTResponse } from '../src/vast_response';

const vastParser = new VASTParser();

const urlfor = relpath =>
  `file://${path
    .resolve(path.dirname(module.filename), 'vastfiles', relpath)
    .replace(/\\/g, '/')}`;

describe('VASTParser', function() {
  describe('#getAndParse', function() {
    this.response = null;
    let _response = null;
    this.templateFilterCalls = [];
    let eventsTriggered = null;

    before(done => {
      eventsTriggered = [];

      vastParser.on('resolving', variables =>
        eventsTriggered.push({ name: 'resolving', data: variables })
      );
      vastParser.on('resolved', variables =>
        eventsTriggered.push({ name: 'resolved', data: variables })
      );

      vastParser.addURLTemplateFilter(url => {
        this.templateFilterCalls.push(url);
        return url;
      });
      vastParser.getAndParse(
        urlfor('wrapper-notracking.xml'),
        (err, response) => {
          this.response = response;
          _response = this.response;
          done();
        }
      );
    });

    after(() => {
      eventsTriggered = [];
      vastParser.removeAllListeners();
      vastParser.clearURLTemplateFilters();
    });

    it('should have 1 filter defined', () => {
      vastParser.countURLTemplateFilters().should.equal(1);
    });

    it('should have called 4 times URLtemplateFilter ', () => {
      this.templateFilterCalls.should.have.length(4);
      this.templateFilterCalls.should.eql([
        urlfor('wrapper-notracking.xml'),
        urlfor('wrapper-a.xml'),
        urlfor('wrapper-b.xml'),
        urlfor('sample.xml')
      ]);
    });

    it('should have emitted resolving/resolved events', () => {
      eventsTriggered.should.eql([
        { name: 'resolving', data: { url: urlfor('wrapper-notracking.xml') } },
        { name: 'resolved', data: { url: urlfor('wrapper-notracking.xml') } },
        { name: 'resolving', data: { url: urlfor('wrapper-a.xml') } },
        { name: 'resolved', data: { url: urlfor('wrapper-a.xml') } },
        { name: 'resolving', data: { url: urlfor('wrapper-b.xml') } },
        { name: 'resolved', data: { url: urlfor('wrapper-b.xml') } },
        { name: 'resolving', data: { url: urlfor('sample.xml') } },
        { name: 'resolved', data: { url: urlfor('sample.xml') } }
      ]);
    });

    it('should have found 2 ads', () => {
      this.response.ads.should.have.length(2);
    });

    it('should have returned a VAST response object', () => {
      this.response.should.be.an.instanceOf(VASTResponse);
    });

    describe('#duration', () =>
      [
        null,
        undefined,
        -1,
        0,
        1,
        '1',
        '00:00',
        '00:00:00:00',
        'test',
        '00:test:01',
        '00:00:01.001',
        '00:00:01.test'
      ].map(item =>
        (item =>
          it(`should not return NaN for \`${item}\``, () =>
            isNaN(vastParser.parserUtils.parseDuration(item)).should.eql(
              false
            )))(item)
      ));

    describe('#duration', () =>
      [
        null,
        undefined,
        -1,
        0,
        1,
        '1',
        '00:00',
        '00:00:00:00',
        'test',
        '00:test:01',
        '00:00:01.001',
        '00:00:01.test'
      ].map(item =>
        (item =>
          it(`should not return NaN for \`${item}\``, () =>
            isNaN(vastParser.parserUtils.parseDuration(item)).should.eql(
              false
            )))(item)
      ));

    describe('#For the 1st ad', function() {
      let ad1 = null;

      before(() => {
        ad1 = _response.ads[0];
      });

      after(() => {
        ad1 = null;
      });

      it('should have retrieved Ad attributes', () => {
        ad1.id.should.eql('ad_id_0001');
        ad1.sequence.should.eql('1');
      });

      it('should have retrieved Ad sub-elements values', () => {
        ad1.system.value.should.eql('AdServer');
        ad1.system.version.should.eql('2.0');
        ad1.title.should.eql('Ad title');
        ad1.advertiser.should.eql('Advertiser name');
        ad1.description.should.eql('Description text');
        ad1.pricing.value.should.eql('1.09');
        ad1.pricing.model.should.eql('CPM');
        ad1.pricing.currency.should.eql('USD');
        ad1.survey.should.eql('http://example.com/survey');
      });

      it('should have merged wrapped ad error URLs', () => {
        ad1.errorURLTemplates.should.eql([
          'http://example.com/wrapperNoTracking-error',
          'http://example.com/wrapperA-error',
          'http://example.com/wrapperB-error',
          'http://example.com/error_[ERRORCODE]'
        ]);
      });

      it('should have merged impression URLs', () => {
        ad1.impressionURLTemplates.should.eql([
          'http://example.com/wrapperNoTracking-impression',
          'http://example.com/wrapperA-impression',
          'http://example.com/wrapperB-impression1',
          'http://example.com/wrapperB-impression2',
          'http://example.com/impression1_asset:[ASSETURI]_[CACHEBUSTING]',
          'http://example.com/impression2_[random]',
          'http://example.com/impression3_[RANDOM]'
        ]);
      });

      it('should have 3 creatives', () => {
        ad1.creatives.should.have.length(3);
      });

      it('should have 4 extensions', () => {
        ad1.extensions.should.have.length(4);
      });

      it('validate first extension', () => {
        ad1.extensions[0].attributes['type'].should.eql('WrapperExtension');
        ad1.extensions[0].children.should.have.length(1);
        ad1.extensions[0].children[0].name.should.eql('extension_tag');
        ad1.extensions[0].children[0].value.should.eql('extension_value');
      });

      it('validate second extension', () => {
        ad1.extensions[1].attributes['type'].should.eql('Pricing');
        ad1.extensions[1].children.should.have.length(1);
        ad1.extensions[1].children[0].name.should.eql('Price');
        ad1.extensions[1].children[0].value.should.eql('0');
        ad1.extensions[1].children[0].attributes['model'].should.eql('CPM');
        ad1.extensions[1].children[0].attributes['currency'].should.eql('USD');
        ad1.extensions[1].children[0].attributes['source'].should.eql(
          'someone'
        );
      });

      it('validate third extension', () => {
        ad1.extensions[2].attributes['type'].should.eql('Count');
        ad1.extensions[2].children.should.have.length(1);
        ad1.extensions[2].children[0].name.should.eql('#cdata-section');
        ad1.extensions[2].children[0].value.should.eql('4');
      });

      it('validate fourth extension', () => {
        ad1.extensions[3].attributes.should.eql({});
        ad1.extensions[3].children.should.have.length(1);
        ad1.extensions[3].children[0].name.should.eql('#text');
        ad1.extensions[3].children[0].value.should.eql('{ foo: bar }');
      });

      it('should not have trackingEvents property', () => {
        should.equal(ad1.trackingEvents, undefined);
      });

      it('should not have videoClickTrackingURLTemplates property', () => {
        should.equal(ad1.videoClickTrackingURLTemplates, undefined);
      });

      it('should not have videoClickThroughURLTemplate property', () => {
        should.equal(ad1.videoClickThroughURLTemplate, undefined);
      });

      it('should not have videoCustomClickURLTemplates property', () => {
        should.equal(ad1.videoCustomClickURLTemplates, undefined);
      });

      //Linear
      describe('1st creative (Linear)', function() {
        let linear = null;

        before(() => {
          linear = _response.ads[0].creatives[0];
        });

        after(() => {
          linear = null;
        });

        it('should have linear type', () => {
          linear.type.should.equal('linear');
        });

        it('should have an id', () => {
          linear.id.should.equal('id130984');
        });

        it('should have an adId', () => {
          linear.adId.should.equal('adId345690');
        });

        it('should have a sequence', () => {
          linear.sequence.should.equal('1');
        });

        it('should not have an apiFramework', () => {
          should.equal(linear.apiFramework, null);
        });

        it('should have a duration of 90.123s', () => {
          linear.duration.should.equal(90.123);
        });

        it('should have 2 media file', () => {
          linear.mediaFiles.should.have.length(2);
        });

        it('should have parsed 1st media file attributes', () => {
          linear.mediaFiles[0].width.should.equal(512);
          linear.mediaFiles[0].height.should.equal(288);
          linear.mediaFiles[0].mimeType.should.equal('video/mp4');
          linear.mediaFiles[0].fileURL.should.equal(
            'http://example.com/linear-asset.mp4'
          );
        });

        it('should have parsed 2nd media file attributes', () => {
          linear.mediaFiles[1].width.should.equal(512);
          linear.mediaFiles[1].height.should.equal(288);
          linear.mediaFiles[1].mimeType.should.equal('application/javascript');
          linear.mediaFiles[1].apiFramework.should.equal('VPAID');
          linear.mediaFiles[1].deliveryType.should.equal('progressive');
          linear.mediaFiles[1].fileURL.should.equal(
            'parser.js?adData=http%3A%2F%2Fad.com%2F%3Fcb%3D%5Btime%5D'
          );
        });

        it('should have 1 URL for clickthrough', () => {
          linear.videoClickThroughURLTemplate.should.eql(
            'http://example.com/linear-clickthrough'
          );
        });

        it('should have 5 URLs for clicktracking', () => {
          linear.videoClickTrackingURLTemplates.should.eql([
            'http://example.com/linear-clicktracking1_ts:[TIMESTAMP]',
            'http://example.com/linear-clicktracking2',
            'http://example.com/wrapperB-linear-clicktracking',
            'http://example.com/wrapperA-linear-clicktracking1',
            'http://example.com/wrapperA-linear-clicktracking2',
            'http://example.com/wrapperA-linear-clicktracking3'
          ]);
        });

        it('should have 2 URLs for customclick', () => {
          linear.videoCustomClickURLTemplates.should.eql([
            'http://example.com/linear-customclick',
            'http://example.com/wrapperA-linear-customclick'
          ]);
        });

        it('should have 8 tracking events', () => {
          linear.trackingEvents.should.have.keys(
            'start',
            'close',
            'midpoint',
            'complete',
            'firstQuartile',
            'thirdQuartile',
            'progress-30',
            'progress-60%'
          );
        });

        it('should have 4 URLs for start event', () => {
          linear.trackingEvents['start'].should.eql([
            'http://example.com/linear-start',
            'http://example.com/wrapperB-linear-start',
            'http://example.com/wrapperA-linear-start1',
            'http://example.com/wrapperA-linear-start2'
          ]);
        });

        it('should have 3 URLs for complete event', () => {
          linear.trackingEvents['complete'].should.eql([
            'http://example.com/linear-complete',
            'http://example.com/wrapperB-linear-complete',
            'http://example.com/wrapperA-linear-complete'
          ]);
        });

        it('should have 3 URLs for progress-30 event VAST 3.0', () => {
          linear.trackingEvents['progress-30'].should.eql([
            'http://example.com/linear-progress-30sec',
            'http://example.com/wrapperB-linear-progress-30sec',
            'http://example.com/wrapperA-linear-progress-30sec'
          ]);
        });

        it('should have 3 URLs for progress-60% event VAST 3.0', () => {
          linear.trackingEvents['progress-60%'].should.eql([
            'http://example.com/linear-progress-60%',
            'http://example.com/wrapperB-linear-progress-60%',
            'http://example.com/wrapperA-linear-progress-60%'
          ]);
        });

        it('should have 3 URLs for progress-90% event VAST 3.0', () => {
          linear.trackingEvents['progress-90%'].should.eql([
            'http://example.com/wrapperA-linear-progress-90%'
          ]);
        });

        it('should have parsed icons element', () => {
          const icon = linear.icons[0];
          icon.program.should.equal('ad1');
          icon.height.should.equal(20);
          icon.width.should.equal(60);
          icon.xPosition.should.equal('left');
          icon.yPosition.should.equal('bottom');
          icon.apiFramework.should.equal('VPAID');
          icon.offset.should.equal(15);
          icon.duration.should.equal(90);
          icon.type.should.equal('image/gif');
          icon.staticResource.should.equal(
            'http://example.com/linear-icon.gif'
          );
          icon.iconClickThroughURLTemplate.should.equal(
            'http://example.com/linear-clickthrough'
          );
          icon.iconClickTrackingURLTemplates.should.eql([
            'http://example.com/linear-clicktracking1',
            'http://example.com/linear-clicktracking2'
          ]);
          icon.iconViewTrackingURLTemplate.should.equal(
            'http://example.com/linear-viewtracking'
          );
        });
      });

      //Companions
      describe('2nd creative (Companions)', function() {
        let companions = null;

        before(() => {
          companions = _response.ads[0].creatives[1];
        });

        after(() => {
          companions = null;
        });

        it('should have companion type', () => {
          companions.type.should.equal('companion');
        });

        it('should have an id', () => {
          companions.id.should.equal('id130985');
        });

        it('should have an adId', () => {
          companions.adId.should.equal('adId345691');
        });

        it('should have a sequence', () => {
          companions.sequence.should.equal('2');
        });

        it('should not have an apiFramework', () => {
          should.equal(companions.apiFramework, null);
        });

        it('should have 3 variations', () => {
          companions.variations.should.have.length(3);
        });

        //Companion
        describe('#Companion', function() {
          let companion = null;

          describe('as image/jpeg', function() {
            before(() => {
              companion = companions.variations[0];
            });

            after(() => {
              companion = null;
            });

            it('should have parsed size and type attributes', () => {
              companion.width.should.equal('300');
              companion.height.should.equal('60');
              companion.type.should.equal('image/jpeg');
            });

            it('should have 1 tracking event', () => {
              companion.trackingEvents.should.have.keys('creativeView');
            });

            it('should have 1 url for creativeView event', () => {
              companion.trackingEvents['creativeView'].should.eql([
                'http://example.com/companion1-creativeview'
              ]);
            });

            it('should have checked that AltText exists', () => {
              companion.should.have.property('altText');
            });

            it('should have parsed AltText for companion and its equal', () => {
              companion.altText.should.equal('Sample Alt Text Content!!!!');
            });

            it('should have 1 companion clickthrough url', () => {
              companion.companionClickThroughURLTemplate.should.equal(
                'http://example.com/companion1-clickthrough'
              );
            });

            it('should store the first companion clicktracking url', () => {
              companion.companionClickTrackingURLTemplate.should.equal(
                'http://example.com/companion1-clicktracking-first'
              );
            });

            it('should have 2 companion clicktracking urls', () => {
              companion.companionClickTrackingURLTemplates.should.eql([
                'http://example.com/companion1-clicktracking-first',
                'http://example.com/companion1-clicktracking-second'
              ]);
            });
          });

          describe('as IFrameResource', function() {
            before(() => {
              companion = companions.variations[1];
            });

            after(() => {
              companion = null;
            });

            it('should have parsed size and type attributes', () => {
              companion.width.should.equal('300');
              companion.height.should.equal('60');
              companion.type.should.equal(0);
            });

            it('does not have tracking events', () => {
              companion.trackingEvents.should.be.empty;
            });

            it('has the #iframeResource set', () =>
              companion.iframeResource.should.equal(
                'http://www.example.com/companion2-example.php'
              ));
          });

          describe('as text/html', function() {
            before(() => {
              companion = companions.variations[2];
            });

            after(() => {
              companion = null;
            });

            it('should have parsed size and type attributes', () => {
              companion.width.should.equal('300');
              companion.height.should.equal('60');
              companion.type.should.equal('text/html');
            });

            it('should have 1 tracking event', () => {
              companion.trackingEvents.should.be.empty;
            });

            it('should have 1 companion clickthrough url', () => {
              companion.companionClickThroughURLTemplate.should.equal(
                'http://www.example.com/companion3-clickthrough'
              );
            });

            it('has #htmlResource available', () =>
              companion.htmlResource.should.equal(
                '<a href="http://www.example.com" target="_blank">Some call to action HTML!</a>'
              ));
          });
        });
      });

      //Nonlinear
      describe('3rd creative (Nonlinears)', function() {
        let nonlinears = null;

        before(() => {
          nonlinears = _response.ads[0].creatives[2];
        });

        after(() => {
          nonlinears = null;
        });

        it('should have nonlinear type', () => {
          nonlinears.type.should.equal('nonlinear');
        });

        it('should not have an id', () => {
          should.equal(nonlinears.id, null);
        });

        it('should not have an adId', () => {
          should.equal(nonlinears.adId, null);
        });

        it('should not have a sequence', () => {
          should.equal(nonlinears.sequence, null);
        });

        it('should not have an apiFramework', () => {
          should.equal(nonlinears.apiFramework, null);
        });

        it('should have 1 variation', () => {
          nonlinears.variations.should.have.length(1);
        });

        //NonLinear
        describe('#NonLinear', function() {
          let nonlinear = null;

          describe('trackingEvents', function() {
            it('should have 6 tracking events', () => {
              nonlinears.trackingEvents.should.have.keys(
                'start',
                'close',
                'midpoint',
                'complete',
                'firstQuartile',
                'thirdQuartile'
              );
            });

            it('should have 3 URLs for start event', () => {
              nonlinears.trackingEvents['start'].should.eql([
                'http://example.com/nonlinear-start',
                'http://example.com/wrapperB-nonlinear-start',
                'http://example.com/wrapperA-nonlinear-start'
              ]);
            });

            it('should have 3 URLs for complete event', () => {
              nonlinears.trackingEvents['complete'].should.eql([
                'http://example.com/nonlinear-complete',
                'http://example.com/wrapperB-nonlinear-complete',
                'http://example.com/wrapperA-nonlinear-complete'
              ]);
            });
          });

          describe('as image/jpeg', function() {
            before(() => {
              nonlinear = nonlinears.variations[0];
            });

            after(() => {
              nonlinear = null;
            });

            it('should have parsed attributes', () => {
              nonlinear.width.should.equal('300');
              nonlinear.height.should.equal('200');
              nonlinear.expandedWidth.should.equal('600');
              nonlinear.expandedHeight.should.equal('400');
              nonlinear.scalable.should.equal(false);
              nonlinear.maintainAspectRatio.should.equal(true);
              nonlinear.minSuggestedDuration.should.equal(100);
              nonlinear.apiFramework.should.equal('someAPI');
              nonlinear.type.should.equal('image/jpeg');
            });

            it('should have 1 nonlinear clickthrough url', () => {
              nonlinear.nonlinearClickThroughURLTemplate.should.equal(
                'http://example.com/nonlinear-clickthrough'
              );
            });

            it('should have 2 nonlinear clicktracking urls', () => {
              nonlinear.nonlinearClickTrackingURLTemplates.should.eql([
                'http://example.com/nonlinear-clicktracking-1',
                'http://example.com/nonlinear-clicktracking-2'
              ]);
            });

            it('should have AdParameter', () => {
              nonlinear.adParameters.should.equal('{"key":"value"}');
            });
          });
        });
      });
    });

    describe('#For the 2nd ad', function() {
      let ad2 = null;

      before(() => {
        ad2 = _response.ads[1];
      });

      after(() => {
        ad2 = null;
      });

      it('should have retrieved Ad attributes', () => {
        _response.ads[1].id.should.eql('ad_id_0002');
        should.equal(_response.ads[1].sequence, null);
      });

      it('should have retrieved Ad sub-elements values', () => {
        ad2.system.value.should.eql('AdServer2');
        ad2.system.version.should.eql('2.1');
        ad2.title.should.eql('Ad title 2');
        should.equal(ad2.advertiser, null);
        should.equal(ad2.description, null);
        should.equal(ad2.pricing, null);
        should.equal(ad2.survey, null);
      });

      it('should have merged error URLs', () => {
        ad2.errorURLTemplates.should.eql([
          'http://example.com/wrapperNoTracking-error',
          'http://example.com/wrapperA-error',
          'http://example.com/wrapperB-error'
        ]);
      });

      it('should have merged impression URLs', () => {
        ad2.impressionURLTemplates.should.eql([
          'http://example.com/wrapperNoTracking-impression',
          'http://example.com/wrapperA-impression',
          'http://example.com/wrapperB-impression1',
          'http://example.com/wrapperB-impression2',
          'http://example.com/impression1'
        ]);
      });

      it('should have 1 creative', () => {
        ad2.creatives.should.have.length(1);
      });

      it('should have 1 extension (from the wrapper)', () => {
        ad2.extensions.should.have.length(1);
      });

      it('validate the extension', () => {
        ad2.extensions[0].attributes['type'].should.eql('WrapperExtension');
        ad2.extensions[0].children.should.have.length(1);
        ad2.extensions[0].children[0].name.should.eql('extension_tag');
        ad2.extensions[0].children[0].value.should.eql('extension_value');
      });

      //Linear
      describe('1st creative (Linear)', function() {
        let linear = null;

        before(() => {
          linear = ad2.creatives[0];
        });

        after(() => {
          linear = null;
        });

        it('should have linear type', () => {
          linear.type.should.equal('linear');
        });

        it('should have an id', () => {
          linear.id.should.equal('id873421');
        });

        it('should have an adId', () => {
          linear.adId.should.equal('adId221144');
        });

        it('should not have a sequence', () => {
          should.equal(linear.sequence, null);
        });

        it('should have an apiFramework', () => {
          linear.apiFramework.should.equal('VPAID');
        });

        it('should have a duration of 30', () => {
          linear.duration.should.equal(30);
        });

        it('should have wrapper clickthrough URL', () => {
          linear.videoClickThroughURLTemplate.should.eql(
            'http://example.com/wrapperB-linear-clickthrough'
          );
        });

        it('should have wrapper customclick URL', () => {
          linear.videoCustomClickURLTemplates.should.eql([
            'http://example.com/wrapperA-linear-customclick'
          ]);
        });

        it('should have 5 URLs for clicktracking', () => {
          linear.videoClickTrackingURLTemplates.should.eql([
            'http://example.com/linear-clicktracking',
            'http://example.com/wrapperB-linear-clicktracking',
            'http://example.com/wrapperA-linear-clicktracking1',
            'http://example.com/wrapperA-linear-clicktracking2',
            'http://example.com/wrapperA-linear-clicktracking3'
          ]);
        });
      });
    });

    describe('#VPAID', function() {
      this.response = null;

      before(done => {
        vastParser.getAndParse(urlfor('vpaid.xml'), (err, response) => {
          this.response = response;
          done();
        });
      });

      it('should have apiFramework set', () => {
        this.response.ads[0].creatives[0].mediaFiles[0].apiFramework.should.be.equal(
          'VPAID'
        );
      });

      it('should have duration set to -1', () => {
        this.response.ads[0].creatives[0].duration.should.be.equal(-1);
      });
    });
  });

  describe('#parse', function() {
    this.response = null;
    this.templateFilterCalls = [];

    before(done => {
      vastParser.addURLTemplateFilter(url => {
        this.templateFilterCalls.push(url);
        return url;
      });
      const url = urlfor('wrapper-notracking.xml');
      vastParser.urlHandler.get(url, {}, (err, xml) => {
        // `VAST > Wrapper > VASTAdTagURI` in the VAST must be an absolute URL
        for (let node of Array.from(xml.documentElement.childNodes)) {
          if (node.nodeName === 'Ad') {
            for (node of Array.from(node.childNodes)) {
              if (node.nodeName === 'Wrapper') {
                for (node of Array.from(node.childNodes)) {
                  if (node.nodeName === 'VASTAdTagURI') {
                    node.textContent = urlfor(
                      vastParser.parserUtils.parseNodeText(node)
                    );
                    break;
                  }
                }
              }
            }
          }
        }
        vastParser.parse(xml, (err, response) => {
          this.response = response;
          done();
        });
      });
    });

    after(() => {
      vastParser.clearURLTemplateFilters();
    });

    it('should have 1 filter defined', () => {
      vastParser.countURLTemplateFilters().should.equal(1);
    });

    it('should have called 3 times URLtemplateFilter ', () => {
      this.templateFilterCalls.should.have.length(3);
      this.templateFilterCalls.should.eql([
        urlfor('wrapper-a.xml'),
        urlfor('wrapper-b.xml'),
        urlfor('sample.xml')
      ]);
    });

    it('should have found 2 ads', () => {
      this.response.ads.should.have.length(2);
    });

    it('should have returned a VAST response object', () => {
      this.response.should.be.an.instanceOf(VASTResponse);
    });
  });

  describe('#Tracking', function() {
    let trackCalls = null;
    let dataTriggered = null;

    beforeEach(() => {
      vastParser.removeAllListeners();
      dataTriggered = [];
      trackCalls = [];

      vastParser.on('VAST-error', variables => dataTriggered.push(variables));

      vastParser.util.track = (templates, variables) => {
        trackCalls.push({
          templates,
          variables
        });
      };
    });

    describe('#No-Ad', function() {
      it('emits a VAST-error & track', done =>
        vastParser.getAndParse(urlfor('empty-no-ad.xml'), (err, response) => {
          // Response doesn't have any ads
          response.ads.should.eql([]);
          // Error has been triggered
          dataTriggered.length.should.eql(1);
          dataTriggered[0].ERRORCODE.should.eql(303);
          dataTriggered[0].extensions.should.eql([]);
          // Tracking has been done
          trackCalls.length.should.eql(1);
          trackCalls[0].templates.should.eql([
            'http://example.com/empty-no-ad'
          ]);
          trackCalls[0].variables.should.eql({ ERRORCODE: 303 });
          done();
        }));

      it('when wrapped, emits a VAST-error & track', done =>
        vastParser.getAndParse(urlfor('wrapper-empty.xml'), (err, response) => {
          // Response doesn't have any ads
          response.ads.should.eql([]);
          // Error has been triggered
          dataTriggered.length.should.eql(1);
          dataTriggered[0].ERRORCODE.should.eql(303);
          dataTriggered[0].extensions[0].children[0].name.should.eql(
            'paramWrapperEmptyNoAd'
          );
          dataTriggered[0].extensions[0].children[0].value.should.eql(
            'valueWrapperEmptyNoAd'
          );
          // Tracking has been done
          trackCalls.length.should.eql(1);
          trackCalls[0].templates.should.eql([
            'http://example.com/wrapper-empty_wrapper-error',
            'http://example.com/empty-no-ad'
          ]);
          trackCalls[0].variables.should.eql({ ERRORCODE: 303 });
          done();
        }));
    });

    describe('#Ad with no creatives', function() {
      it('emits a VAST-error & track', done =>
        vastParser.getAndParse(
          urlfor('empty-no-creative.xml'),
          (err, response) => {
            // Response doesn't have any ads
            response.ads.should.eql([]);
            // Error has been triggered
            dataTriggered.length.should.eql(1);
            dataTriggered[0].ERRORCODE.should.eql(303);
            dataTriggered[0].extensions[0].children[0].name.should.eql(
              'paramEmptyNoCreative'
            );
            dataTriggered[0].extensions[0].children[0].value.should.eql(
              'valueEmptyNoCreative'
            );
            // Tracking has been done
            trackCalls.length.should.eql(1);
            trackCalls[0].templates.should.eql([
              'http://example.com/empty-no-creative_inline-error'
            ]);
            trackCalls[0].variables.should.eql({ ERRORCODE: 303 });
            done();
          }
        ));

      it('when wrapped, emits a VAST-error & track', done =>
        vastParser.getAndParse(
          urlfor('wrapper-empty-no-creative.xml'),
          (err, response) => {
            // Response doesn't have any ads
            response.ads.should.eql([]);
            // Error has been triggered
            dataTriggered.length.should.eql(1);
            dataTriggered[0].ERRORCODE.should.eql(303);
            dataTriggered[0].extensions[0].children[0].name.should.eql(
              'paramWrapperEmptyNoCreative'
            );
            dataTriggered[0].extensions[0].children[0].value.should.eql(
              'valueWrapperEmptyNoCreative'
            );
            dataTriggered[0].extensions[1].children[0].name.should.eql(
              'paramEmptyNoCreative'
            );
            dataTriggered[0].extensions[1].children[0].value.should.eql(
              'valueEmptyNoCreative'
            );
            // Tracking has been done
            trackCalls.length.should.eql(1);
            trackCalls[0].templates.should.eql([
              'http://example.com/wrapper-no-creative_wrapper-error',
              'http://example.com/empty-no-creative_inline-error'
            ]);
            trackCalls[0].variables.should.eql({ ERRORCODE: 303 });
            done();
          }
        ));
    });

    describe('#Invalid XML file (parsing error)', function() {
      it('returns an error', done =>
        vastParser.getAndParse(
          urlfor('invalid-xmlfile.xml'),
          (err, response) => {
            // No response returned
            should.not.exist(response);
            // Error returned
            err.should.be
              .instanceof(Error)
              .and.have.property('message', 'Invalid VAST XMLDocument');
            done();
          }
        ));

      it('when wrapped, emits a VAST-error & track', done =>
        vastParser.getAndParse(
          urlfor('wrapper-invalid-xmlfile.xml'),
          (err, response) => {
            // Response doesn't have any ads
            response.ads.should.eql([]);
            // No error returned
            should.not.exist(err);
            // Error has been triggered
            dataTriggered.length.should.eql(1);
            dataTriggered[0].ERRORCODE.should.eql(301);
            dataTriggered[0].extensions[0].children[0].name.should.eql(
              'paramWrapperInvalidXmlfile'
            );
            dataTriggered[0].extensions[0].children[0].value.should.eql(
              'valueWrapperInvalidXmlfile'
            );
            // Tracking has been done
            trackCalls.length.should.eql(1);
            trackCalls[0].templates.should.eql([
              'http://example.com/wrapper-invalid-xmlfile_wrapper-error'
            ]);
            trackCalls[0].variables.should.eql({ ERRORCODE: 301 });
            done();
          }
        ));
    });

    describe('#Wrapper limit reached', () =>
      it('emits a VAST-error & track', done =>
        vastParser.getAndParse(
          urlfor('wrapper-a.xml'),
          { wrapperLimit: 1 },
          (err, response) => {
            // Response doesn't have any ads
            response.ads.should.eql([]);
            // No error returned
            should.not.exist(err);
            // Error has been triggered
            dataTriggered.length.should.eql(1);
            dataTriggered[0].ERRORCODE.should.eql(302);
            dataTriggered[0].extensions[0].children[0].name.should.eql(
              'extension_tag'
            );
            dataTriggered[0].extensions[0].children[0].value.should.eql(
              'extension_value'
            );
            // Tracking has been done
            trackCalls.length.should.eql(1);
            trackCalls[0].templates.should.eql([
              'http://example.com/wrapperA-error'
            ]);
            trackCalls[0].variables.should.eql({ ERRORCODE: 302 });
            done();
          }
        )));
  });

  describe('#legacy', function() {
    beforeEach(() => {
      vastParser.removeAllListeners();
    });

    it('correctly loads a wrapped ad, even with the VASTAdTagURL-Tag', done =>
      vastParser.getAndParse(urlfor('wrapper-legacy.xml'), (err, response) => {
        it('should have found 1 ad', () => {
          response.ads.should.have.length(1);
        });

        it('should have returned a VAST response object', () => {
          response.should.be.an.instanceOf(VASTResponse);
        });

        // we just want to make sure that the sample.xml was loaded correctly
        const linear = response.ads[0].creatives[0];
        it('should have parsed media file attributes', () => {
          const mediaFile = linear.mediaFiles[0];
          mediaFile.width.should.equal(512);
          mediaFile.height.should.equal(288);
          mediaFile.mimeType.should.equal('video/mp4');
          mediaFile.fileURL.should.equal('http://example.com/asset.mp4');
        });

        done();
      }));
  });
});
