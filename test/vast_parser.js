import path from 'path';
import should from 'should';
import sinon from 'sinon';
import { VASTParser } from '../src/parser/vast_parser';
import { nodeURLHandler } from '../src/urlhandlers/node_url_handler';
import { parserUtils } from '../src/parser/parser_utils.js';
import { util } from '../src/util/util';

const vastParser = new VASTParser();

const urlfor = relpath =>
  `file:///${path
    .resolve(path.dirname(module.filename), 'vastfiles', relpath)
    .replace(/\\/g, '/')}`;

describe('VASTParser', function() {
  describe('#getAndParseVAST', function() {
    this.response = null;
    let _response = null;
    const options = {
      urlhandler: nodeURLHandler
    };

    before(done => {
      vastParser
        .getAndParseVAST(urlfor('wrapper-notracking.xml'), options)
        .then(response => {
          this.response = response;
          _response = this.response;
          done();
        });
    });

    after(() => {
      vastParser.removeAllListeners();
      vastParser.clearURLTemplateFilters();
    });

    it('should have found 2 ads', () => {
      this.response.ads.should.have.length(2);
    });

    it('should have returned a VAST response object', () => {
      this.response.should.have.properties(
        'ads',
        'errorURLTemplates',
        'version'
      );
    });

    it('should have retrived root VAST version', () => {
      this.response.version.should.eql('2.0');
    });

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
        ad1.advertiser.id.should.eql('advertiser-desc');
        ad1.advertiser.value.should.eql('Advertiser name');
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

      it('should have merged impression URL templates', () => {
        ad1.impressionURLTemplates.should.eql([
          {
            id: null,
            url: 'http://example.com/wrapperNoTracking-impression'
          },
          {
            id: 'wrapper-a-impression',
            url: 'http://example.com/wrapperA-impression'
          },
          {
            id: 'wrapper-b-impression1',
            url: 'http://example.com/wrapperB-impression1'
          },
          {
            id: 'wrapper-b-impression2',
            url: 'http://example.com/wrapperB-impression2'
          },
          {
            id: 'sample-impression1',
            url:
              'http://example.com/impression1_asset:[ASSETURI]_[CACHEBUSTING]'
          },
          {
            id: 'sample-impression2',
            url: 'http://example.com/impression2_[random]'
          },
          {
            id: 'sample-impression3',
            url: 'http://example.com/impression3_[RANDOM]'
          }
        ]);
      });

      it('should have 5 creatives', () => {
        ad1.creatives.should.have.length(5);
      });

      it('should have 4 extensions', () => {
        ad1.extensions.should.have.length(4);
      });

      it('should have 5 AdVerification URLs VAST 4.1', () => {
        ad1.adVerifications.should.have.length(5);
      });

      it('validate second adVerification', () => {
        const adVerification = ad1.adVerifications[1];
        adVerification.resource.should.eql('http://example.com/omid2');
        adVerification.vendor.should.eql('company2.com-omid');
        adVerification.browserOptional.should.eql(false);
        adVerification.apiFramework.should.eql('omid');
        adVerification.parameters.should.eql('test-verification-parameter');
        adVerification.trackingEvents.should.have.keys(
          'verificationNotExecuted'
        );
        adVerification.trackingEvents['verificationNotExecuted'].should.eql([
          'http://example.com/verification-not-executed-JS'
        ]);
      });

      it('validate third adVerification', () => {
        const adVerification = ad1.adVerifications[2];
        adVerification.resource.should.eql('http://example.com/omid1.exe');
        adVerification.vendor.should.eql('company.daily.com-omid');
        adVerification.browserOptional.should.eql(false);
        adVerification.apiFramework.should.eql('omid');
        adVerification.type.should.eql('executable');
        should.equal(adVerification.parameters, null);
        adVerification.trackingEvents.should.have.keys(
          'verificationNotExecuted'
        );
        adVerification.trackingEvents['verificationNotExecuted'].should.eql([
          'http://example.com/verification-not-executed-EXE',
          'http://sample.com/verification-not-executed-EXE'
        ]);
      });

      it('validate wrapper-b adVerification merging', () => {
        const adVerification = ad1.adVerifications[3];
        adVerification.resource.should.eql(
          'https://verification-b.com/omid_verification.js'
        );
        adVerification.vendor.should.eql('verification-b.com-omid');
        adVerification.browserOptional.should.eql(false);
        adVerification.apiFramework.should.eql('omid');
        adVerification.parameters.should.eql(
          'parameterB1=valueB1&parameterB2=valueB2'
        );
        adVerification.trackingEvents.should.not.have.keys(
          'verificationNotExecuted'
        );
      });

      it('validate wrapper-a adVerification merging', () => {
        const adVerification = ad1.adVerifications[4];

        adVerification.resource.should.eql(
          'https://verification-a.com/omid_verification.js'
        );
        adVerification.vendor.should.eql('verification-a.com-omid');
        adVerification.browserOptional.should.eql(false);
        adVerification.apiFramework.should.eql('omid');
        adVerification.parameters.should.eql(
          'parameterA1=valueA1&parameterA2=valueA2'
        );
        adVerification.trackingEvents.should.have.keys(
          'verificationNotExecuted'
        );
        adVerification.trackingEvents['verificationNotExecuted'].should.eql([
          'http://verification-a.com/verification-A-not-executed-JS'
        ]);
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
          linear = _response.ads[0].creatives.filter(
            creative => creative.id === 'id130984'
          )[0];
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

        it('should have a universal ad id', () => {
          linear.universalAdId.idRegistry.should.equal('daily-motion-L');
          linear.universalAdId.value.should.equal('Linear-12345');
        });

        it('should have creativeExtensions of length 3', () => {
          linear.creativeExtensions.should.have.length(3);
        });

        it('should have parsed 1st creativeExtension properties', () => {
          linear.creativeExtensions[0].attributes['type'].should.equal(
            'creativeExt1'
          );
          linear.creativeExtensions[0].children.should.have.length(1);
          linear.creativeExtensions[0].children[0].name.should.equal(
            'CreativeExecution'
          );
          linear.creativeExtensions[0].children[0].value.should.equal('10.0');
        });

        it('should have parsed 2nd creativeExtension properties', () => {
          linear.creativeExtensions[1].attributes['type'].should.equal('Count');
          linear.creativeExtensions[1].value.should.equal('10');
        });

        it('should have parsed 3rd creativeExtension properties', () => {
          linear.creativeExtensions[2].value.should.equal('{ key: value }');
        });

        it('should have 2 media file', () => {
          linear.mediaFiles.should.have.length(2);
        });

        it('should have parsed 1st media file attributes', () => {
          linear.mediaFiles[0].width.should.equal(512);
          linear.mediaFiles[0].height.should.equal(288);
          linear.mediaFiles[0].mimeType.should.equal('video/mp4');
          linear.mediaFiles[0].fileSize.should.equal(345670);
          linear.mediaFiles[0].mediaType.should.equal('2D');
          linear.mediaFiles[0].fileURL.should.equal(
            'http://example.com/linear-asset.mp4'
          );
        });

        it('should have parsed 2nd media file attributes', () => {
          linear.mediaFiles[1].width.should.equal(512);
          linear.mediaFiles[1].height.should.equal(288);
          linear.mediaFiles[1].mimeType.should.equal('application/javascript');
          linear.mediaFiles[1].mediaType.should.equal('3D');
          linear.mediaFiles[1].apiFramework.should.equal('VPAID');
          linear.mediaFiles[1].deliveryType.should.equal('progressive');
          linear.mediaFiles[1].fileURL.should.equal(
            'parser.js?adData=http%3A%2F%2Fad.com%2F%3Fcb%3D%5Btime%5D'
          );
        });

        it('should have parsed mezzanine file attributes', () => {
          linear.mezzanine.delivery.should.equal('progressive');
          linear.mezzanine.type.should.equal('video/mp4');
          linear.mezzanine.width.should.equal(1080);
          linear.mezzanine.height.should.equal(720);
          linear.mezzanine.codec.should.equal('h264');
          linear.mezzanine.id.should.equal('mezzanine-id-165468451');
          linear.mezzanine.fileSize.should.equal(700);
          linear.mezzanine.mediaType.should.equal('2D');
          linear.mezzanine.fileURL.should.equal(
            'http://example.com/linear-mezzanine.mp4'
          );
        });

        it('should have parsed interactivecreative file attributes', () => {
          linear.interactiveCreativeFile.type.should.equal(
            'application/javascript'
          );
          linear.interactiveCreativeFile.apiFramework.should.equal('simpleApp');
          linear.interactiveCreativeFile.variableDuration.should.equal(false);
          linear.interactiveCreativeFile.fileURL.should.equal(
            'http://example.com/linear-interactive-creative.js'
          );
        });

        it('should have 4 closedcaption files', () => {
          linear.closedCaptionFiles.should.have.length(4);
        });

        it('should have parsed 1st closedcaption file attributes', () => {
          linear.closedCaptionFiles[0].type.should.equal('text/srt');
          linear.closedCaptionFiles[0].language.should.equal('en');
          linear.closedCaptionFiles[0].fileURL.should.equal(
            'https://mycdn.example.com/creatives/creative001.srt'
          );
        });

        it('should have parsed 2nd closedcaption file attributes', () => {
          linear.closedCaptionFiles[1].type.should.equal('text/srt');
          linear.closedCaptionFiles[1].language.should.equal('fr');
          linear.closedCaptionFiles[1].fileURL.should.equal(
            'https://mycdn.example.com/creatives/creative001-1.srt'
          );
        });

        it('should have parsed 3rd closedcaption file attributes', () => {
          linear.closedCaptionFiles[2].type.should.equal('text/vtt');
          linear.closedCaptionFiles[2].language.should.equal('zh-TW');
          linear.closedCaptionFiles[2].fileURL.should.equal(
            'https://mycdn.example.com/creatives/creative001.vtt'
          );
        });

        it('should have parsed 4th closedcaption file attributes', () => {
          linear.closedCaptionFiles[3].type.should.equal(
            'application/ttml+xml'
          );
          linear.closedCaptionFiles[3].language.should.equal('zh-CH');
          linear.closedCaptionFiles[3].fileURL.should.equal(
            'https://mycdn.example.com/creatives/creative001.ttml'
          );
        });

        it('should have 1 clickthrough URL template', () => {
          linear.videoClickThroughURLTemplate.should.eql({
            id: 'click-through',
            url: 'http://example.com/linear-clickthrough'
          });
        });

        it('should have 6 clicktracking URL templates', () => {
          linear.videoClickTrackingURLTemplates.should.eql([
            {
              id: 'video-click-1',
              url: 'http://example.com/linear-clicktracking1_ts:[TIMESTAMP]'
            },
            {
              id: 'video-click-2',
              url: 'http://example.com/linear-clicktracking2'
            },
            {
              id: 'WRAP',
              url: 'http://example.com/wrapperB-linear-clicktracking'
            },
            {
              id: 'wrapper-video-click-1',
              url: 'http://example.com/wrapperA-linear-clicktracking1'
            },
            {
              id: null,
              url: 'http://example.com/wrapperA-linear-clicktracking2'
            },
            {
              id: 'wrapper-video-click-3',
              url: 'http://example.com/wrapperA-linear-clicktracking3'
            }
          ]);
        });

        it('should have 2 customclick URL templates', () => {
          linear.videoCustomClickURLTemplates.should.eql([
            {
              id: 'custom-click-1',
              url: 'http://example.com/linear-customclick'
            },
            {
              id: '123',
              url: 'http://example.com/wrapperA-linear-customclick'
            }
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
          icon.pxratio.should.equal('2');
          icon.type.should.equal('image/gif');
          icon.staticResource.should.equal(
            'http://example.com/linear-icon.gif'
          );
          icon.iconClickThroughURLTemplate.should.equal(
            'http://example.com/linear-clickthrough'
          );
          icon.iconClickTrackingURLTemplates.should.eql([
            {
              id: 'icon-click-1',
              url: 'http://example.com/linear-clicktracking1'
            },
            {
              id: 'icon-click-2',
              url: 'http://example.com/linear-clicktracking2'
            }
          ]);
          icon.iconViewTrackingURLTemplate.should.equal(
            'http://example.com/linear-viewtracking'
          );
        });
      });

      //Nonlinear
      describe('3rd creative (Nonlinears)', function() {
        let nonlinears = null;

        before(() => {
          nonlinears = _response.ads[0].creatives.filter(
            creative => creative.id === 'id130986'
          )[0];
        });

        after(() => {
          nonlinears = null;
        });

        it('should have nonlinear type', () => {
          nonlinears.type.should.equal('nonlinear');
        });

        it('should have an id', () => {
          should.equal(nonlinears.id, 'id130986');
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

        it('should have a UniversalAdId', () => {
          should.equal(nonlinears.universalAdId.idRegistry, 'daily-motion-NL');
          should.equal(nonlinears.universalAdId.value, 'NonLinear-12345');
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

            it('should have 2 nonlinear clicktracking URL templates', () => {
              nonlinear.nonlinearClickTrackingURLTemplates.should.eql([
                {
                  id: 'nonlinear-click-1',
                  url: 'http://example.com/nonlinear-clicktracking-1'
                },
                {
                  id: null,
                  url: 'http://example.com/nonlinear-clicktracking-2'
                }
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
      });
      it("should have ignored the wrapper's sequence", () => {
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

      it('should have merged impression URL templates', () => {
        ad2.impressionURLTemplates.should.eql([
          {
            id: null,
            url: 'http://example.com/wrapperNoTracking-impression'
          },
          {
            id: 'wrapper-a-impression',
            url: 'http://example.com/wrapperA-impression'
          },
          {
            id: 'wrapper-b-impression1',
            url: 'http://example.com/wrapperB-impression1'
          },
          {
            id: 'wrapper-b-impression2',
            url: 'http://example.com/wrapperB-impression2'
          },
          {
            id: 'sample-ad2-impression1',
            url: 'http://example.com/impression1'
          }
        ]);
      });

      it('should have 3 creative', () => {
        ad2.creatives.should.have.length(3);
      });

      it('should have 1 extension (from the wrapper)', () => {
        ad2.extensions.should.have.length(1);
      });

      //Linear
      describe('1st creative (Linear)', function() {
        let linear = null;

        before(() => {
          linear = ad2.creatives.filter(
            creative => creative.id === 'id873421'
          )[0];
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

        it('should have a UniversalAdId with value=unknown and idRegistry=null', () => {
          should.equal(linear.universalAdId.value, 'Linear-id873421');
          should.equal(linear.universalAdId.idRegistry, 'unknown');
        });

        it('should have wrapper clickthrough URL', () => {
          linear.videoClickThroughURLTemplate.should.eql({
            id: null,
            url: 'http://example.com/wrapperB-linear-clickthrough'
          });
        });

        it('should have wrapper customclick URL template', () => {
          linear.videoCustomClickURLTemplates.should.eql([
            {
              id: '123',
              url: 'http://example.com/wrapperA-linear-customclick'
            }
          ]);
        });

        it('should have 5 clicktracking URL templates', () => {
          linear.videoClickTrackingURLTemplates.should.eql([
            {
              id: null,
              url: 'http://example.com/linear-clicktracking'
            },
            {
              id: 'WRAP',
              url: 'http://example.com/wrapperB-linear-clicktracking'
            },
            {
              id: 'wrapper-video-click-1',
              url: 'http://example.com/wrapperA-linear-clicktracking1'
            },
            {
              id: null,
              url: 'http://example.com/wrapperA-linear-clicktracking2'
            },
            {
              id: 'wrapper-video-click-3',
              url: 'http://example.com/wrapperA-linear-clicktracking3'
            }
          ]);
        });
      });
    });

    describe('#For the wrapper-1 ad', function() {
      this.response = null;
      this.templateFilterCalls = [];

      before(done => {
        vastParser.addURLTemplateFilter(url => {
          this.templateFilterCalls.push(url);
          return url;
        });
        vastParser
          .getAndParseVAST(urlfor('wrapper-sequence.xml'), options)
          .then(response => {
            this.response = response;
            done();
          });
      });

      it('should have called 4 times URLtemplateFilter ', () => {
        this.templateFilterCalls.should.have.length(4);
        this.templateFilterCalls.should.eql([
          urlfor('wrapper-sequence.xml'),
          urlfor('wrapper-sequence.xml'),
          urlfor('sample-wrapped.xml'),
          urlfor('sample-wrapped.xml')
        ]);
      });

      it('should have carried sequence over from wrapper', () => {
        this.response.ads[0].sequence.should.eql('1');
      });

      it('should have default attributes value for wrapper', () => {
        this.response.ads[0].followAdditionalWrappers.should.eql(true);
        this.response.ads[0].allowMultipleAds.should.eql(false);
        should.equal(this.response.ads[0].fallbackOnNoAd, null);
      });
    });

    describe('#VPAID', function() {
      this.response = null;

      before(done => {
        this.wrapperSpy = sinon.spy(parserUtils, 'resolveVastAdTagURI');
        vastParser
          .getAndParseVAST(urlfor('vpaid.xml'), options)
          .then(response => {
            this.response = response;
            done();
          });
      });

      it('should not try to resolve wrappers', () => {
        sinon.assert.notCalled(this.wrapperSpy);
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

    describe('#Ad Pod', function() {
      this.response = null;

      before(done => {
        vastParser
          .getAndParseVAST(urlfor('wrapper-ad-pod.xml'), options)
          .then(response => {
            this.response = response;
            done();
          });
      });

      it('should have parsed 2 ads', () => {
        this.response.ads.should.have.length(2);
      });

      it('should have maintened the sequence when resolving wrappers', () => {
        this.response.ads[0].sequence.should.be.equal('1');
        this.response.ads[1].sequence.should.be.equal('2');
      });
    });
  });

  describe('#parseVAST', function() {
    const options = {
      urlhandler: nodeURLHandler
    };
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
        for (let nodeKey in xml.documentElement.childNodes) {
          const node = xml.documentElement.childNodes[nodeKey];

          if (node.nodeName === 'Ad') {
            for (let adNodeKey in node.childNodes) {
              const adNode = node.childNodes[adNodeKey];

              if (adNode.nodeName === 'Wrapper') {
                for (let wrapperNodeKey in adNode.childNodes) {
                  const wrapperNode = adNode.childNodes[wrapperNodeKey];

                  if (wrapperNode.nodeName === 'VASTAdTagURI') {
                    wrapperNode.textContent = urlfor(
                      parserUtils.parseNodeText(wrapperNode)
                    );
                    break;
                  }
                }
              }
            }
          }
        }

        vastParser.parseVAST(xml, options).then(response => {
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

    it('should have called 6 times URLtemplateFilter ', () => {
      this.templateFilterCalls.should.have.length(6);
      this.templateFilterCalls.should.eql([
        urlfor('wrapper-a.xml'),
        urlfor('wrapper-a.xml'),
        urlfor('wrapper-b.xml'),
        urlfor('wrapper-b.xml'),
        urlfor('sample.xml'),
        urlfor('sample.xml')
      ]);
    });

    it('should have found 2 ads', () => {
      this.response.ads.should.have.length(2);
    });

    it('should have returned a VAST response object', () => {
      this.response.should.have.properties(
        'ads',
        'errorURLTemplates',
        'version'
      );
    });
  });

  describe('#Tracking', function() {
    let trackCalls = null;
    let dataTriggered = null;
    const options = {
      urlhandler: nodeURLHandler
    };

    beforeEach(() => {
      vastParser.removeAllListeners();
      dataTriggered = [];
      trackCalls = [];

      vastParser.on('VAST-error', variables => dataTriggered.push(variables));

      util.track = (templates, variables) => {
        trackCalls.push({
          templates,
          variables
        });
      };
    });

    describe('#No-Ad', function() {
      it('emits a VAST-error & track', done => {
        vastParser
          .getAndParseVAST(urlfor('empty-no-ad.xml'), options)
          .then(response => {
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
          });
      });

      it('when wrapped, emits a VAST-error & track', done => {
        vastParser
          .getAndParseVAST(urlfor('wrapper-empty.xml'), options)
          .then(response => {
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
          });
      });
    });

    describe('#Ad with no creatives', function() {
      it('emits a VAST-error & track', done => {
        vastParser
          .getAndParseVAST(urlfor('empty-no-creative.xml'), options)
          .then(response => {
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
          });
      });

      it('when wrapped, emits a VAST-error & track', done => {
        vastParser
          .getAndParseVAST(urlfor('wrapper-empty-no-creative.xml'), options)
          .then(response => {
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
          });
      });
    });

    describe('#Wrapper URL unavailable/timeout', () => {
      it('emits a VAST-error & track', done => {
        vastParser
          .getAndParseVAST(urlfor('wrapper-unavailable-url.xml'), options)
          .then(response => {
            // Response doesn't have any ads
            response.ads.should.eql([]);
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
          });
      });
    });

    describe('#Wrapper limit reached', () => {
      it('emits a VAST-error & track', done => {
        vastParser
          .getAndParseVAST(urlfor('wrapper-a.xml'), {
            wrapperLimit: 1,
            urlhandler: nodeURLHandler
          })
          .then(response => {
            // Response doesn't have any ads
            response.ads.should.eql([]);
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
          });
      });
    });
  });

  describe('#legacy', function() {
    const options = {
      urlhandler: nodeURLHandler
    };

    beforeEach(() => {
      vastParser.removeAllListeners();
    });

    it('correctly loads a wrapped ad, even with the VASTAdTagURL-Tag', done => {
      vastParser
        .getAndParseVAST(urlfor('wrapper-legacy.xml'), options)
        .then(response => {
          it('should have found 1 ad', () => {
            response.ads.should.have.length(1);
          });

          it('should have returned a VAST response object', () => {
            response.should.have.properties(
              'ads',
              'errorURLTemplates',
              'version'
            );
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
        });
    });
  });
});
