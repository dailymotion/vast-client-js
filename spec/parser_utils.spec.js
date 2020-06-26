import { parserUtils } from '../src/parser/parser_utils.js';

describe('ParserUtils', function() {
  describe('splitVAST', function() {
    it('should parse normally defined vast pods', () => {
      const input = [
        { id: 2, sequence: 1 },
        { id: 3, sequence: 2 },
        { id: 4 },
        { id: 5, sequence: 1 },
        { id: 6, sequence: 2 },
        { id: 7, sequence: 3 },
        { id: 8, sequence: 1 },
        { id: 9, sequence: 2 },
        { id: 10 },
        { id: 11, sequence: 1 },
        { id: 12 }
      ];

      const expectedOutput = [
        [{ id: 2, sequence: 1 }, { id: 3, sequence: 2 }],
        [{ id: 4 }],
        [
          { id: 5, sequence: 1 },
          { id: 6, sequence: 2 },
          { id: 7, sequence: 3 }
        ],
        [{ id: 8, sequence: 1 }, { id: 9, sequence: 2 }],
        [{ id: 10 }],
        [{ id: 11, sequence: 1 }],
        [{ id: 12 }]
      ];

      const output = parserUtils.splitVAST(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should parse vast pods with single sequence', () => {
      const input = [
        { id: 1, sequence: 1 },
        { id: 2, sequence: 1 },
        { id: 3, sequence: 1 }
      ];

      const expectedOutput = [
        [{ id: 1, sequence: 1 }],
        [{ id: 2, sequence: 1 }],
        [{ id: 3, sequence: 1 }]
      ];

      const output = parserUtils.splitVAST(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should parse vast pods with no pods', () => {
      const input = [{ id: 1 }, { id: 2 }, { id: 3 }];

      const expectedOutput = [[{ id: 1 }], [{ id: 2 }], [{ id: 3 }]];

      const output = parserUtils.splitVAST(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should parse vast pods with weird sequences', () => {
      const input = [
        { id: 1, sequence: 99 },
        { id: 2, sequence: 99 },
        { id: 3, sequence: 99 }
      ];

      const expectedOutput = [[{ id: 1 }], [{ id: 2 }], [{ id: 3 }]];

      const output = parserUtils.splitVAST(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should parse vast pods with sequences that not start with index = 1', () => {
      const input = [
        { id: 1, sequence: 2 },
        { id: 4 },
        { id: 98, sequence: 3 },
        { id: 99, sequence: 4 },
        { id: 5, sequence: 1 },
        { id: 6, sequence: 2 },
        { id: 7, sequence: 3 },
        { id: 8, sequence: 1 },
        { id: 9, sequence: 2 },
        { id: 10 },
        { id: 11, sequence: 1 },
        { id: 12 }
      ];

      const expectedOutput = [
        [{ id: 1 }],
        [{ id: 4 }],
        [{ id: 98 }],
        [{ id: 99 }],
        [
          { id: 5, sequence: 1 },
          { id: 6, sequence: 2 },
          { id: 7, sequence: 3 }
        ],
        [{ id: 8, sequence: 1 }, { id: 9, sequence: 2 }],
        [{ id: 10 }],
        [{ id: 11, sequence: 1 }],
        [{ id: 12 }]
      ];

      const output = parserUtils.splitVAST(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should parse vast pods with sequences that not start with index = 1, and not following incrementally', () => {
      const input = [
        { id: 1, sequence: 2 },
        { id: 2, sequence: 4 },
        { id: 4 },
        { id: 98, sequence: 3 },
        { id: 99, sequence: 4 },
        { id: 100, sequence: 17 },
        { id: 101, sequence: 18 },
        { id: 5, sequence: 1 },
        { id: 6, sequence: 2 },
        { id: 7, sequence: 3 },
        { id: 8, sequence: 1 },
        { id: 9, sequence: 2 },
        { id: 10 },
        { id: 11, sequence: 1 },
        { id: 12 }
      ];

      const expectedOutput = [
        [{ id: 1 }],
        [{ id: 2 }],
        [{ id: 4 }],
        [{ id: 98 }],
        [{ id: 99 }],
        [{ id: 100 }],
        [{ id: 101 }],
        [
          { id: 5, sequence: 1 },
          { id: 6, sequence: 2 },
          { id: 7, sequence: 3 }
        ],
        [{ id: 8, sequence: 1 }, { id: 9, sequence: 2 }],
        [{ id: 10 }],
        [{ id: 11, sequence: 1 }],
        [{ id: 12 }]
      ];

      const output = parserUtils.splitVAST(input);

      expect(output).toEqual(expectedOutput);
    });
  });

  describe('parseDuration', function() {
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
      it(`should not return NaN for \`${item}\``, function() {
        expect(parserUtils.parseDuration(item)).not.toBeNaN();
      })
    );
  });

  describe('parseAttributes', function() {
    document.body.innerHTML = `<foo id='1234' width='400' height='250'></foo>`;
    const element = document.getElementById('1234');

    it('parses attributes correctly', function() {
      expect(parserUtils.parseAttributes(element)).toEqual({
        id: '1234',
        width: '400',
        height: '250'
      });
    });

    afterAll(function() {
      document.body.innerHTML = '';
    });
  });

  describe('mergeWrapperAdData', function() {
    let unwrappedAd = {
      id: null,
      sequence: 1,
      title: null,
      description: null,
      advertiser: null,
      pricing: null,
      survey: null,
      errorURLTemplates: ['unwrappedAd1', 'unwrappedAd2'],
      impressionURLTemplates: [
        {
          id: 'unwrappedAd',
          url: 'https://unwrappedAd.com'
        }
      ],
      creatives: [
        {
          type: 'companion',
          trackingEvents: {
            creativeView: [
              'http://example.com/companion1-unwrappedAd-creativeview'
            ]
          },
          variations: [
            {
              adType: 'companionAd',
              companionClickTrackingURLTemplates: [
                {
                  id: '1',
                  url:
                    'http://example.com/companion1-unwrappedAd-clicktracking-first'
                },
                {
                  id: '2',
                  url:
                    'http://example.com/companion1-unwrappedAd-clicktracking-second'
                }
              ]
            },
            {
              type: 'linear',
              videoClickThroughURLTemplate: null,
              videoClickTrackingURLTemplates: [
                {
                  id: 'video-click-1',
                  url:
                    'http://example.com/linear-clicktracking1_ts:[TIMESTAMP]_adplayhead:[ADPLAYHEAD]'
                }
              ],
              videoCustomClickURLTemplates: [
                {
                  id: 'custom-click-1',
                  url: 'http://example.com/linear-customclick'
                }
              ]
            }
          ]
        }
      ],
      extensions: [
        {
          name: 'Extension',
          value: null,
          attributes: {
            type: 'geo'
          },
          children: [
            {
              name: 'Country',
              value: 'FR',
              attributes: {},
              children: []
            },
            {
              name: 'Bandwidth',
              value: '5',
              attributes: {},
              children: []
            }
          ]
        }
      ],
      adVerifications: ['unwrappedAd'],
      blockedAdCategories: ['unwrappedAd'],
      trackingEvents: { nonlinear: [], linear: [] },
      videoClickTrackingURLTemplates: [],
      videoCustomClickURLTemplates: [],
      followAdditionalWrappers: null,
      allowMultipleAds: null,
      fallbackOnNoAd: null
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
      impressionURLTemplates: [
        {
          id: 'wrapper1',
          url: 'https://wrapper1.com'
        },
        {
          id: 'wrapper2',
          url: 'https://wrapper2.com'
        }
      ],
      creatives: [
        {
          type: 'companion',
          trackingEvents: {
            creativeView: ['http://example.com/companion1-wrapper-creativeview']
          },
          variations: [
            {
              companionClickTrackingURLTemplates: [
                {
                  id: '1',
                  url:
                    'http://example.com/companion1-wrapper-clicktracking-first'
                },
                {
                  id: '2',
                  url:
                    'http://example.com/companion1-wrapper-clicktracking-second'
                }
              ]
            }
          ]
        },
        {
          type: 'linear',
          videoClickThroughURLTemplate: {
            id: 'click-through',
            url:
              'http://example.com/linear-clickthrough_adplayhead:[ADPLAYHEAD]'
          },
          videoClickTrackingURLTemplates: [
            {
              id: 'video-click-1',
              url:
                'http://example.com/linear-clicktracking1_ts:[TIMESTAMP]_adplayhead:[ADPLAYHEAD]'
            },
            {
              id: 'video-click-2',
              url: 'http://example.com/linear-clicktracking2'
            }
          ],
          videoCustomClickURLTemplates: [
            {
              id: 'custom-click-1',
              url: 'http://example.com/linear-customclick'
            }
          ]
        }
      ],
      extensions: [
        {
          name: 'Extension',
          value: null,
          attributes: {
            type: 'geo'
          },
          children: [
            {
              name: 'Country',
              value: 'US',
              attributes: {},
              children: []
            },
            {
              name: 'Bandwidth',
              value: '4',
              attributes: {},
              children: []
            }
          ]
        }
      ],
      adVerifications: ['wrapper1', 'wrapper2'],
      blockedAdCategories: ['wrapper1', 'wrapper2'],
      trackingEvents: { nonlinear: [], linear: [] },
      videoClickTrackingURLTemplates: [],
      videoCustomClickURLTemplates: [],
      followAdditionalWrappers: true,
      allowMultipleAds: true,
      fallbackOnNoAd: true
    };

    beforeAll(() => {
      return parserUtils.mergeWrapperAdData(unwrappedAd, wrapper);
    });

    it('merge the wrapper and unwrappedAd errorURLTemplates together', function() {
      expect(unwrappedAd.errorURLTemplates).toEqual([
        'wrapper1',
        'wrapper2',
        'unwrappedAd1',
        'unwrappedAd2'
      ]);
    });

    it('merge the wrapper and unwrappedAd impressionURLTemplates together', function() {
      expect(unwrappedAd.impressionURLTemplates).toEqual([
        {
          id: 'wrapper1',
          url: 'https://wrapper1.com'
        },
        {
          id: 'wrapper2',
          url: 'https://wrapper2.com'
        },
        {
          id: 'unwrappedAd',
          url: 'https://unwrappedAd.com'
        }
      ]);
    });

    it('merge the wrapper and unwrappedAd extensions together', function() {
      expect(unwrappedAd.extensions).toEqual([
        {
          attributes: {
            type: 'geo'
          },
          children: [
            {
              attributes: {},
              children: [],
              name: 'Country',
              value: 'US'
            },
            {
              attributes: {},
              children: [],
              name: 'Bandwidth',
              value: '4'
            }
          ],
          name: 'Extension',
          value: null
        },
        {
          attributes: {
            type: 'geo'
          },
          children: [
            {
              attributes: {},
              children: [],
              name: 'Country',
              value: 'FR'
            },
            {
              attributes: {},
              children: [],
              name: 'Bandwidth',
              value: '5'
            }
          ],
          name: 'Extension',
          value: null
        }
      ]);
    });

    it('override unwrapped followAdditionalWrappers with wrapper one', function() {
      expect(unwrappedAd.followAdditionalWrappers).toEqual(
        wrapper.followAdditionalWrappers
      );
    });

    it('override unwrapped allowMultipleAds with wrapper one', function() {
      expect(unwrappedAd.allowMultipleAds).toEqual(wrapper.allowMultipleAds);
    });

    it('override unwrapped fallbackOnNoAd with wrapper one', function() {
      expect(unwrappedAd.fallbackOnNoAd).toEqual(wrapper.fallbackOnNoAd);
    });

    it('merge the wrapper and unwrappedAd creatives together', function() {
      expect(unwrappedAd.creatives).toEqual([
        {
          trackingEvents: {
            creativeView: ['http://example.com/companion1-wrapper-creativeview']
          },
          type: 'companion',
          variations: [
            {
              companionClickTrackingURLTemplates: [
                {
                  id: '1',
                  url:
                    'http://example.com/companion1-wrapper-clicktracking-first'
                },
                {
                  id: '2',
                  url:
                    'http://example.com/companion1-wrapper-clicktracking-second'
                }
              ]
            }
          ]
        },
        {
          trackingEvents: {
            creativeView: [
              'http://example.com/companion1-unwrappedAd-creativeview'
            ]
          },
          type: 'companion',
          variations: [
            {
              adType: 'companionAd',
              companionClickTrackingURLTemplates: [
                {
                  id: '1',
                  url:
                    'http://example.com/companion1-unwrappedAd-clicktracking-first'
                },
                {
                  id: '2',
                  url:
                    'http://example.com/companion1-unwrappedAd-clicktracking-second'
                },
                {
                  id: '1',
                  url:
                    'http://example.com/companion1-wrapper-clicktracking-first'
                },
                {
                  id: '2',
                  url:
                    'http://example.com/companion1-wrapper-clicktracking-second'
                }
              ]
            },
            {
              companionClickTrackingURLTemplates: [
                {
                  id: '1',
                  url:
                    'http://example.com/companion1-wrapper-clicktracking-first'
                },
                {
                  id: '2',
                  url:
                    'http://example.com/companion1-wrapper-clicktracking-second'
                }
              ],
              type: 'linear',
              videoClickThroughURLTemplate: null,
              videoClickTrackingURLTemplates: [
                {
                  id: 'video-click-1',
                  url:
                    'http://example.com/linear-clicktracking1_ts:[TIMESTAMP]_adplayhead:[ADPLAYHEAD]'
                }
              ],
              videoCustomClickURLTemplates: [
                {
                  id: 'custom-click-1',
                  url: 'http://example.com/linear-customclick'
                }
              ]
            }
          ]
        }
      ]);
    });
  });
});
