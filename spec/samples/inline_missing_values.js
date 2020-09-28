const missingRequiredSubElements = `
<InLine>
  <Extensions>
    <Extension>
        { foo: bar }
    </Extension>
  </Extensions>
</InLine>
`;

const childMissingRequiredSubElements = `
<VAST version="2.1">
  <Ad>
    <InLine>
      <AdVerifications>
        <Verification vendor="company2.com-omid">
          <VerificationParameters>
            <![CDATA[test-verification-parameter]]>
          </VerificationParameters>
        </Verification>
      </AdVerifications>
      <Creatives>
        <Creative>
          <Linear>
            <Icons>
              <StaticResource creativeType="image/gif"><![CDATA[http://example.com/linear-icon.gif]]></StaticResource>
            </Icons>
          </Linear>
        </Creative>
        <Creative>
          <Linear>
            <MediaFiles>
              <InteractiveCreativeFile><![CDATA[https://example.com/interactiveCreativeFile]]></InteractiveCreativeFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
  <Ad>
    <InLine>
      <Creatives>
        <paramEmptyNoCreative><![CDATA[valueEmptyNoCreative]]></paramEmptyNoCreative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
`;

const missingRequiredAttributes = `
<VAST version="2.1">
  <Ad id="ad_id_0001" sequence="1">
    <InLine>
      <AdTitle>Test sample ad</AdTitle>
      <Category>0001</Category>
      <AdServingId>a532d16d-4d7f-4440-bd29-2ec0e693fc80</AdServingId>
      <AdSystem version="2.0"><![CDATA[AdServer]]></AdSystem>
      <Advertiser><![CDATA[Advertiser name]]></Advertiser>
      <Description><![CDATA[Description text]]></Description>
      <Pricing><![CDATA[1.09]]></Pricing>
      <Survey><![CDATA[http://example.com/survey]]></Survey>
      <Error><![CDATA[http://example.com/error_[ERRORCODE]]]></Error>
      <Impression><![CDATA[http://example.com/impression1_asset:[ASSETURI]_[CACHEBUSTING]]]></Impression>
      <Impression><![CDATA[http://example.com/impression2_[random]]]></Impression>
      <Impression><![CDATA[http://example.com/impression3_[RANDOM]]]></Impression>
      <AdVerifications>
        <Verification>
          <JavaScriptResource>
            <![CDATA[http://example.com/omid1]]>
          </JavaScriptResource>
        </Verification>
        <Verification>
          <JavaScriptResource apiFramework="omid">
            <![CDATA[http://example.com/omid1]]>
          </JavaScriptResource>
        </Verification>
        <Verification vendor="company2.com-omid">
          <ExecutableResource>
            <![CDATA[http://example.com/omid2.exe]]>
          </ExecutableResource>
          <TrackingEvents>
            <Tracking><![CDATA[http://example.com/verification-not-executed-EXE]]></Tracking>
          </TrackingEvents>
        </Verification>
      </AdVerifications>
      <Creatives>
        <Creative>
          <UniversalAdId>Linear-12345</UniversalAdId>
          <Linear>
            <Duration>00:01:30.123</Duration>
            <MediaFiles>
              <MediaFile><![CDATA[http://example.com/linear-asset.mp4]]></MediaFile>
              <Mezzanine><![CDATA[http://example.com/linear-mezzanine.mp4]]></Mezzanine>
            </MediaFiles>
            <Icons>
              <Icon>
                <StaticResource creativeType="image/gif"><![CDATA[http://example.com/linear-icon.gif]]></StaticResource>
              </Icon>
              <Icon>
                <IFrameResource><![CDATA[http://www.example.com/icon-example.php]]>
                </IFrameResource>
              </Icon>
              <Icon>
                <HTMLResource><![CDATA[<a href="http://www.example.com" target="_blank">Some call to action HTML!</a>]]></HTMLResource>
              </Icon>
              <Icon>
                <test>totot</test>
              </Icon>
            </Icons>
          </Linear>
        </Creative>
        <Creative id="id130985" AdID="adId345691" sequence="2">
          <CompanionAds>
            <Companion>
              <StaticResource><![CDATA[http://example.com/companion1-static-resource]]></StaticResource>
              <AltText><![CDATA[Sample Alt Text Content!!!!]]></AltText>
              <TrackingEvents>
                <Tracking event="creativeView"><![CDATA[http://example.com/companion1-creativeview]]></Tracking>
              </TrackingEvents>
              <CompanionClickThrough><![CDATA[http://example.com/companion1-clickthrough]]></CompanionClickThrough>
              <CompanionClickTracking><![CDATA[http://example.com/companion1-clicktracking-first]]></CompanionClickTracking>
              <CompanionClickTracking><![CDATA[http://example.com/companion1-clicktracking-second]]></CompanionClickTracking>
            </Companion>
            <Companion width="300" height="60">
              <IFrameResource>
                <![CDATA[http://www.example.com/companion2-example.php]]>
              </IFrameResource>
              <CompanionClickThrough>
                http://www.example.com/companion2-clickthrough
              </CompanionClickThrough>
            </Companion>
            <Companion width="300" height="60">
              <HTMLResource>
                <![CDATA[
                <a href="http://www.example.com" target="_blank">Some call to action HTML!</a>
                ]]>
              </HTMLResource>
              <CompanionClickThrough>
                http://www.example.com/companion3-clickthrough
              </CompanionClickThrough>
            </Companion>
            <Companion>
              <CompanionClickThrough>
                http://www.example.com/companion3-clickthrough
              </CompanionClickThrough>
            </Companion>
          </CompanionAds>
        </Creative>
        <Creative id="id130986">
          <NonLinearAds>
            <NonLinear>
              <AdParameters>
                <![CDATA[{"key":"value"}]]>
              </AdParameters>
              <NonLinearClickThrough><![CDATA[http://example.com/nonlinear-clickthrough]]></NonLinearClickThrough>
              <NonLinearClickTracking><![CDATA[http://example.com/nonlinear-clicktracking-1]]></NonLinearClickTracking>
              <NonLinearClickTracking><![CDATA[http://example.com/nonlinear-clicktracking-2]]></NonLinearClickTracking>
            </NonLinear>
            <NonLinear width="300" height="200" expandedWidth="600" expandedHeight="400" scalable="false" maintainAspectRatio="true" minSuggestedDuration="00:01:40" apiFramework="someAPI">
              <StaticResource creativeType="image/jpeg"><![CDATA[http://example.com/nonlinear-static-resource]]></StaticResource>
              <AdParameters>
                <![CDATA[{"key":"value"}]]>
              </AdParameters>
              <NonLinearClickThrough><![CDATA[http://example.com/nonlinear-clickthrough]]></NonLinearClickThrough>
              <NonLinearClickTracking><![CDATA[http://example.com/nonlinear-clicktracking-1]]></NonLinearClickTracking>
              <NonLinearClickTracking><![CDATA[http://example.com/nonlinear-clicktracking-2]]></NonLinearClickTracking>
            </NonLinear>
            <NonLinear width="300" height="200" expandedWidth="600" expandedHeight="400" scalable="false" maintainAspectRatio="true" minSuggestedDuration="00:01:40" apiFramework="someAPI">
              <IFrameResource><![CDATA[http://example.com/nonlinear-iframe-resource]]></IFrameResource>
            </NonLinear>
            <NonLinear width="300" height="200" expandedWidth="600" expandedHeight="400" scalable="false" maintainAspectRatio="true" minSuggestedDuration="00:01:40" apiFramework="someAPI">
              <HTMLResource>
                <![CDATA[
                <a href="http://www.example.com" target="_blank">Some call to action HTML!</a>
                ]]>
              </HTMLResource>
            </NonLinear>
          </NonLinearAds>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
`;

const emptyRequiredValues = `
<VAST version="3.0">
  <Error><![CDATA[https://adtester.dailymotion.com/fake-event/error]]></Error>
  <Ad>
    <InLine>
      <AdServingId></AdServingId>
      <AdSystem></AdSystem>
      <AdTitle></AdTitle>
      <Impression></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration></Duration>
            <MediaFiles></MediaFiles>
          </Linear>
        </Creative>
        <Creative></Creative>
      </Creatives>
    </InLine>
  </Ad>
  <Ad>
    <InLine>
      <AdServingId>xxxx</AdServingId>
      <AdSystem>xxxx</AdSystem>
      <AdTitle>xxxx</AdTitle>
      <Impression><![CDATA[xxxx]]></Impression>
      <Creatives>
      </Creatives>
    </InLine>
  </Ad>
  <Ad>
    <InLine>
    </InLine>
  </Ad>
</VAST>
`;
export const vastInLine = {
  missingRequiredSubElements,
  childMissingRequiredSubElements,
  missingRequiredAttributes,
  emptyRequiredValues
};
