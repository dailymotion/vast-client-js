export const inlineTrackersParsed = {
  ads: [
    {
      id: 'ad_id_0001',
      sequence: '1',
      adType: 'video',
      adServingId: 'z292x16y-3d7f-6440-bd29-2ec0f153fc89',
      system: { value: 'AdServer', version: '2.0' },
      title: 'Ad title',
      description: 'Description text',
      advertiser: { id: 'advertiser-desc', value: 'Advertiser name' },
      pricing: { value: '1.09', model: 'CPM', currency: 'USD' },
      categories: [
        {
          authority: 'https://www.example.com/categoryauthority',
          value: 'Category-A'
        },
        {
          authority: 'https://www.example.com/categoryauthority',
          value: 'Category-B'
        },
        {
          authority: 'https://www.example.com/categoryauthority',
          value: 'Category-C'
        }
      ],
      survey: 'http://example.com/survey',
      errorURLTemplates: ['http://example.com/error_[ERRORCODE]'],
      impressionURLTemplates: [
        {
          id: 'sample-impression1',
          url: 'http://example.com/impression1_asset:[ASSETURI]_[CACHEBUSTING]'
        },
        {
          id: 'sample-impression2',
          url: 'http://example.com/impression2_[random]'
        },
        {
          id: 'sample-impression3',
          url: 'http://example.com/impression3_[RANDOM]'
        }
      ],
      creatives: [
        {
          id: 'id130984',
          adId: 'adId345690',
          sequence: '1',
          apiFramework: null,
          type: 'linear',
          duration: 90.123,
          skipDelay: null,
          mediaFiles: [
            {
              id: null,
              fileURL: 'http://example.com/linear-asset.mp4',
              deliveryType: 'progressive',
              mimeType: 'video/mp4',
              codec: null,
              bitrate: 849,
              minBitrate: 0,
              maxBitrate: 0,
              width: 512,
              height: 288,
              apiFramework: null,
              scalable: true,
              maintainAspectRatio: null
            },
            {
              id: null,
              fileURL:
                'parser.js?adData=http%3A%2F%2Fad.com%2F%3Fcb%3D%5Btime%5D',
              deliveryType: 'progressive',
              mimeType: 'application/javascript',
              codec: null,
              bitrate: 0,
              minBitrate: 0,
              maxBitrate: 0,
              width: 512,
              height: 288,
              apiFramework: 'VPAID',
              scalable: null,
              maintainAspectRatio: null
            }
          ],
          mezzanine: {
            id: 'mezzanine-id-165468451',
            fileURL: 'http://example.com/linear-mezzanine.mp4',
            delivery: 'progressive',
            codec: 'h264',
            type: 'video/mp4',
            width: 1080,
            height: 720,
            fileSize: 700,
            mediaType: '2D'
          },
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
          ],
          adParameters: null,
          icons: [
            {
              program: 'ad1',
              height: 20,
              width: 60,
              xPosition: 'left',
              yPosition: 'bottom',
              apiFramework: 'VPAID',
              offset: 15,
              duration: 90,
              type: 'image/gif',
              staticResource: 'http://example.com/linear-icon.gif',
              htmlResource: null,
              iframeResource: null,
              pxratio: '2',
              iconClickThroughURLTemplate:
                'http://example.com/linear-clickthrough',
              iconClickTrackingURLTemplates: [
                {
                  id: 'icon-click-1',
                  url: 'http://example.com/linear-clicktracking1'
                },
                {
                  id: 'icon-click-2',
                  url: 'http://example.com/linear-clicktracking2'
                }
              ],
              iconViewTrackingURLTemplate:
                'http://example.com/linear-viewtracking'
            }
          ],
          trackingEvents: {
            midpoint: ['http://example.com/linear-midpoint'],
            complete: ['http://example.com/linear-complete'],
            start: ['http://example.com/linear-start'],
            firstQuartile: ['http://example.com/linear-firstQuartile'],
            close: ['http://example.com/linear-close'],
            thirdQuartile: ['http://example.com/linear-thirdQuartile'],
            'progress-30': ['http://example.com/linear-progress-30sec'],
            'progress-60%': ['http://example.com/linear-progress-60%'],
            otherAdInteraction: [
              'http://example.com/linear-otherAdInteraction'
            ],
            acceptInvitation: [
              'http://example.com/linear-acceptInvitation?category=[ADCATEGORIES]&adServingId=[ADSERVINGID]&adtype=[ADTYPE]'
            ],
            adExpand: ['http://example.com/linear-adExpand'],
            adCollapse: ['http://example.com/linear-adCollapse'],
            minimize: ['http://example.com/linear-minimize'],
            overlayViewDuration: [
              'http://example.com/linear-overlayViewDuration&mph=[MEDIAPLAYHEAD]&ctp=[CONTENTPLAYHEAD]&uadid=[UNIVERSALADID]'
            ],
            notUsed: ['http://example.com/linear-notUsed&assetURI=[ASSETURI]']
          },
          universalAdId: {
            idRegistry: 'sample-registry',
            value: '000123'
          }
        }
      ],
      extensions: [
        {
          name: 'Extension',
          value: null,
          attributes: { type: 'Pricing' },
          children: [
            {
              name: 'Price',
              value: '0',
              attributes: { model: 'CPM', currency: 'USD', source: 'someone' },
              children: []
            }
          ]
        },
        {
          name: 'Extension',
          value: '4',
          attributes: { type: 'Count' },
          children: []
        },
        {
          name: 'Extension',
          value: '{ foo: bar }',
          attributes: {},
          children: []
        }
      ],
      adVerifications: [
        {
          resource: 'http://example.com/omid1',
          vendor: 'company.com-omid',
          browserOptional: true,
          apiFramework: 'omid',
          parameters: null,
          trackingEvents: {
            verificationNotExecuted: [
              'http://example.com/verification-not-executed-JS?reason=[REASON]'
            ]
          }
        }
      ]
    }
  ],
  errorURLTemplates: [],
  version: '2.1'
};
