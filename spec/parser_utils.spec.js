import { parserUtils } from '../src/parser/parser_utils.js';

describe('ParserUtils', function () {
  describe('getSortedAdPods', function () {
    it('should return sorted ad pods based on sequence attribute', function () {
      const ads = [
        { sequence: '3', id: 'ad3' },
        { sequence: '1', id: 'ad1' },
        { sequence: '2', id: 'ad2' },
      ];
      const sortedAds = parserUtils.getSortedAdPods(ads);
      expect(sortedAds).toEqual([
        { sequence: '1', id: 'ad1' },
        { sequence: '2', id: 'ad2' },
        { sequence: '3', id: 'ad3' },
      ]);
    });

    it('should filter out ads without sequence attribute', function () {
      const ads = [
        { sequence: '3', id: 'ad3' },
        { id: 'adWithoutSequence' },
        { sequence: '2', id: 'ad2' },
        { sequence: '1', id: 'ad1' },
      ];
      const sortedAds = parserUtils.getSortedAdPods(ads);
      expect(sortedAds).toEqual([
        { sequence: '1', id: 'ad1' },
        { sequence: '2', id: 'ad2' },
        { sequence: '3', id: 'ad3' },
      ]);
    });

    it('should return an empty array if no adPods are provided', function () {
      const ads = [
        { id: 'adWithoutSequence1' },
        { id: 'adWithoutSequence2' },
        { id: 'adWithoutSequence3' },
      ];
      const sortedAds = parserUtils.getSortedAdPods(ads);
      expect(sortedAds).toEqual([]);
    });
  });

  describe('getStandAloneAds', function () {
    it('should return standalone ads without sequence attribute', function () {
      const ads = [
        { sequence: '3', id: 'ad3' },
        { id: 'adWithoutSequence1' },
        { sequence: '1', id: 'ad1' },
        { id: 'adWithoutSequence2' },
      ];
      const standAloneAds = parserUtils.getStandAloneAds(ads);
      expect(standAloneAds).toEqual([
        { id: 'adWithoutSequence1' },
        { id: 'adWithoutSequence2' },
      ]);
    });

    it('should return an empty array if all ads have sequence attribute', function () {
      const ads = [
        { sequence: '1', id: 'ad1' },
        { sequence: '2', id: 'ad2' },
      ];
      const standAloneAds = parserUtils.getStandAloneAds(ads);
      expect(standAloneAds).toEqual([]);
    });
  });

  describe('parseDuration', function () {
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
      '00:00:01.test',
    ].map((item) =>
      it(`should not return NaN for \`${item}\``, function () {
        expect(parserUtils.parseDuration(item)).not.toBeNaN();
      })
    );
  });

  describe('parseAttributes', function () {
    document.body.innerHTML = `<foo id='1234' width='400' height='250'></foo>`;
    const element = document.getElementById('1234');

    it('parses attributes correctly', function () {
      expect(parserUtils.parseAttributes(element)).toEqual({
        id: '1234',
        width: '400',
        height: '250',
      });
    });

    afterAll(function () {
      document.body.innerHTML = '';
    });
  });

  describe('mergeWrapperAdData', function () {
    let unwrappedAd = {
      id: null,
      sequence: 1,
      title: null,
      description: null,
      advertiser: null,
      pricing: null,
      survey: null,
      errorURLTemplates: ['unwrappedAd1', 'unwrappedAd2'],
      viewableImpression: [
        {
          id: '1543',
          notviewable: [
            'http://search.iabtechlab.com/error?errcode=102&imprid=s5-ea2f7f298e28c0c98374491aec3dfeb1&ts=1243',
          ],
          viewable: [
            'http://search.iabtechlab.com/error?errcode=102&imprid=s5-ea2f7f298e28c0c98374491aec3dfeb1&ts=1243',
          ],
          viewundetermined: [
            'http://search.iabtechlab.com/error?errcode=102&imprid=s5-ea2f7f298e28c0c98374491aec3dfeb1&ts=1243',
          ],
        },
      ],
      impressionURLTemplates: [
        {
          id: 'unwrappedAd',
          url: 'https://unwrappedAd.com',
        },
      ],
      creatives: [
        {
          type: 'companion',
          trackingEvents: {
            creativeView: [
              'http://example.com/companion1-unwrappedAd-creativeview',
            ],
          },
          variations: [
            {
              adType: 'companionAd',
              companionClickTrackingURLTemplates: [
                {
                  id: '1',
                  url: 'http://example.com/companion1-unwrappedAd-clicktracking-first',
                },
                {
                  id: '2',
                  url: 'http://example.com/companion1-unwrappedAd-clicktracking-second',
                },
              ],
            },
            {
              type: 'linear',
              videoClickThroughURLTemplate: null,
              videoClickTrackingURLTemplates: [
                {
                  id: 'video-click-1',
                  url: 'http://example.com/linear-clicktracking1_ts:[TIMESTAMP]_adplayhead:[ADPLAYHEAD]',
                },
              ],
              videoCustomClickURLTemplates: [
                {
                  id: 'custom-click-1',
                  url: 'http://example.com/linear-customclick',
                },
              ],
            },
          ],
        },
      ],
      extensions: [
        {
          name: 'Extension',
          value: null,
          attributes: {
            type: 'geo',
          },
          children: [
            {
              name: 'Country',
              value: 'FR',
              attributes: {},
              children: [],
            },
            {
              name: 'Bandwidth',
              value: '5',
              attributes: {},
              children: [],
            },
          ],
        },
      ],
      adVerifications: ['unwrappedAd'],
      blockedAdCategories: ['unwrappedAd'],
      trackingEvents: { nonlinear: [], linear: [] },
      videoClickTrackingURLTemplates: [],
      videoCustomClickURLTemplates: [],
      followAdditionalWrappers: null,
      allowMultipleAds: null,
      fallbackOnNoAd: null,
    };
    let wrapper = {
      id: null,
      sequence: 2,
      title: null,
      description: null,
      advertiser: null,
      pricing: null,
      survey: null,
      errorURLTemplates: ['wrapper1', 'wrapper2'],
      viewableImpression: [
        {
          id: '1234',
          notviewable: ['http://search.iabtechlab.com/1234'],
          viewable: ['http://search.iabtechlab.com/1234'],
          viewundetermined: ['http://search.iabtechlab.com/1234'],
        },
      ],
      impressionURLTemplates: [
        {
          id: 'wrapper1',
          url: 'https://wrapper1.com',
        },
        {
          id: 'wrapper2',
          url: 'https://wrapper2.com',
        },
      ],
      creatives: [
        {
          type: 'companion',
          trackingEvents: {
            creativeView: [
              'http://example.com/companion1-wrapper-creativeview',
            ],
          },
          variations: [
            {
              companionClickTrackingURLTemplates: [
                {
                  id: '1',
                  url: 'http://example.com/companion1-wrapper-clicktracking-first',
                },
                {
                  id: '2',
                  url: 'http://example.com/companion1-wrapper-clicktracking-second',
                },
              ],
            },
          ],
        },
        {
          type: 'linear',
          videoClickThroughURLTemplate: {
            id: 'click-through',
            url: 'http://example.com/linear-clickthrough_adplayhead:[ADPLAYHEAD]',
          },
          videoClickTrackingURLTemplates: [
            {
              id: 'video-click-1',
              url: 'http://example.com/linear-clicktracking1_ts:[TIMESTAMP]_adplayhead:[ADPLAYHEAD]',
            },
            {
              id: 'video-click-2',
              url: 'http://example.com/linear-clicktracking2',
            },
          ],
          videoCustomClickURLTemplates: [
            {
              id: 'custom-click-1',
              url: 'http://example.com/linear-customclick',
            },
          ],
        },
        {
          type: 'linear',
          adId: '3447226',
          id: 'linearCreativeWithIcons',
          mediaFiles: [],
          icons: [
            {
              program: 'iconWrapper1',
              height: 1,
              width: 1,
              xPosition: 0,
              yPosition: 0,
              apiFramework: 'omid',
              offset: 5,
              duration: 12,
              type: 'image/jpeg',
              staticResource: 'link',
              htmlResource: '<body><h1>title</h1></body>',
              iframeResource: 'link',
              pxratio: '2',
              iconClickThroughURLTemplate: 'https://iabtechlab.com',
              iconClickTrackingURLTemplates: [
                {
                  id: 'iconTracking',
                  url: 'http://exemple.com/tracker/clicktrack?clickpos=[CLICKPOS]',
                },
                {
                  id: 'iconTracking',
                  url: 'http://exemple.com/tracker/clicktrack?clickpos2=[CLICKPOS]',
                },
              ],
              iconViewTrackingURLTemplate: 'http://adserver.com/fallback.png',
              iconClickFallbackImages: [
                {
                  url: 'http://adserver.com/fallback.png',
                  width: '10px',
                  height: '10px',
                },
              ],
            },
          ],
        },
      ],
      extensions: [
        {
          name: 'Extension',
          value: null,
          attributes: {
            type: 'geo',
          },
          children: [
            {
              name: 'Country',
              value: 'US',
              attributes: {},
              children: [],
            },
            {
              name: 'Bandwidth',
              value: '4',
              attributes: {},
              children: [],
            },
          ],
        },
      ],
      adVerifications: ['wrapper1', 'wrapper2'],
      blockedAdCategories: ['wrapper1', 'wrapper2'],
      trackingEvents: { nonlinear: [], linear: [] },
      videoClickTrackingURLTemplates: [],
      videoCustomClickURLTemplates: [],
      followAdditionalWrappers: true,
      allowMultipleAds: true,
      fallbackOnNoAd: true,
    };

    beforeAll(() => {
      return parserUtils.mergeWrapperAdData(unwrappedAd, wrapper);
    });

    it('merge the wrapper and unwrappedAd errorURLTemplates together', function () {
      expect(unwrappedAd.errorURLTemplates).toEqual([
        'wrapper1',
        'wrapper2',
        'unwrappedAd1',
        'unwrappedAd2',
      ]);
    });

    it('merge the wrapper and unwrappedAd impressionURLTemplates together', function () {
      expect(unwrappedAd.impressionURLTemplates).toEqual([
        {
          id: 'wrapper1',
          url: 'https://wrapper1.com',
        },
        {
          id: 'wrapper2',
          url: 'https://wrapper2.com',
        },
        {
          id: 'unwrappedAd',
          url: 'https://unwrappedAd.com',
        },
      ]);
    });

    it('merge the wrapper and unwrappedAd extensions together', function () {
      expect(unwrappedAd.extensions).toEqual([
        {
          attributes: {
            type: 'geo',
          },
          children: [
            {
              attributes: {},
              children: [],
              name: 'Country',
              value: 'US',
            },
            {
              attributes: {},
              children: [],
              name: 'Bandwidth',
              value: '4',
            },
          ],
          name: 'Extension',
          value: null,
        },
        {
          attributes: {
            type: 'geo',
          },
          children: [
            {
              attributes: {},
              children: [],
              name: 'Country',
              value: 'FR',
            },
            {
              attributes: {},
              children: [],
              name: 'Bandwidth',
              value: '5',
            },
          ],
          name: 'Extension',
          value: null,
        },
      ]);
    });

    it('merged unwrapped ViewableImpression with wrapper one', function () {
      expect(unwrappedAd.viewableImpression).toEqual([
        {
          id: '1543',
          notviewable: [
            'http://search.iabtechlab.com/error?errcode=102&imprid=s5-ea2f7f298e28c0c98374491aec3dfeb1&ts=1243',
          ],
          viewable: [
            'http://search.iabtechlab.com/error?errcode=102&imprid=s5-ea2f7f298e28c0c98374491aec3dfeb1&ts=1243',
          ],
          viewundetermined: [
            'http://search.iabtechlab.com/error?errcode=102&imprid=s5-ea2f7f298e28c0c98374491aec3dfeb1&ts=1243',
          ],
        },
        {
          id: '1234',
          notviewable: ['http://search.iabtechlab.com/1234'],
          viewable: ['http://search.iabtechlab.com/1234'],
          viewundetermined: ['http://search.iabtechlab.com/1234'],
        },
      ]);
    });

    it('override unwrapped followAdditionalWrappers with wrapper one', function () {
      expect(unwrappedAd.followAdditionalWrappers).toEqual(
        wrapper.followAdditionalWrappers
      );
    });

    it('override unwrapped allowMultipleAds with wrapper one', function () {
      expect(unwrappedAd.allowMultipleAds).toEqual(wrapper.allowMultipleAds);
    });

    it('override unwrapped fallbackOnNoAd with wrapper one', function () {
      expect(unwrappedAd.fallbackOnNoAd).toEqual(wrapper.fallbackOnNoAd);
    });

    it('merge the wrapper and unwrappedAd creatives together', function () {
      expect(unwrappedAd.creatives).toEqual([
        {
          trackingEvents: {
            creativeView: [
              'http://example.com/companion1-wrapper-creativeview',
            ],
          },
          type: 'companion',
          variations: [
            {
              companionClickTrackingURLTemplates: [
                {
                  id: '1',
                  url: 'http://example.com/companion1-wrapper-clicktracking-first',
                },
                {
                  id: '2',
                  url: 'http://example.com/companion1-wrapper-clicktracking-second',
                },
              ],
            },
          ],
        },
        {
          trackingEvents: {
            creativeView: [
              'http://example.com/companion1-unwrappedAd-creativeview',
            ],
          },
          type: 'companion',
          variations: [
            {
              adType: 'companionAd',
              companionClickTrackingURLTemplates: [
                {
                  id: '1',
                  url: 'http://example.com/companion1-unwrappedAd-clicktracking-first',
                },
                {
                  id: '2',
                  url: 'http://example.com/companion1-unwrappedAd-clicktracking-second',
                },
                {
                  id: '1',
                  url: 'http://example.com/companion1-wrapper-clicktracking-first',
                },
                {
                  id: '2',
                  url: 'http://example.com/companion1-wrapper-clicktracking-second',
                },
              ],
            },
            {
              companionClickTrackingURLTemplates: [
                {
                  id: '1',
                  url: 'http://example.com/companion1-wrapper-clicktracking-first',
                },
                {
                  id: '2',
                  url: 'http://example.com/companion1-wrapper-clicktracking-second',
                },
              ],
              type: 'linear',
              videoClickThroughURLTemplate: null,
              videoClickTrackingURLTemplates: [
                {
                  id: 'video-click-1',
                  url: 'http://example.com/linear-clicktracking1_ts:[TIMESTAMP]_adplayhead:[ADPLAYHEAD]',
                },
              ],
              videoCustomClickURLTemplates: [
                {
                  id: 'custom-click-1',
                  url: 'http://example.com/linear-customclick',
                },
              ],
            },
          ],
        },
        {
          type: 'linear',
          adId: '3447226',
          id: 'linearCreativeWithIcons',
          mediaFiles: [],
          icons: [
            {
              program: 'iconWrapper1',
              height: 1,
              width: 1,
              xPosition: 0,
              yPosition: 0,
              apiFramework: 'omid',
              offset: 5,
              duration: 12,
              type: 'image/jpeg',
              staticResource: 'link',
              htmlResource: '<body><h1>title</h1></body>',
              iframeResource: 'link',
              pxratio: '2',
              iconClickThroughURLTemplate: 'https://iabtechlab.com',
              iconClickTrackingURLTemplates: [
                {
                  id: 'iconTracking',
                  url: 'http://exemple.com/tracker/clicktrack?clickpos=[CLICKPOS]',
                },
                {
                  id: 'iconTracking',
                  url: 'http://exemple.com/tracker/clicktrack?clickpos2=[CLICKPOS]',
                },
              ],
              iconViewTrackingURLTemplate: 'http://adserver.com/fallback.png',
              iconClickFallbackImages: [
                {
                  url: 'http://adserver.com/fallback.png',
                  width: '10px',
                  height: '10px',
                },
              ],
            },
          ],
        },
      ]);
    });
  });
});
