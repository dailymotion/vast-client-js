export const vastMissingWrapperValues = `
<VAST version="4.1" xmlns="http://www.iab.com/VAST">
  <Ad id="20011" sequence="1" conditionalAd="false">
  <Wrapper>
      <AdSystem>VAST</AdSystem>
      <Error>http://example.com/wrapper-invalid-xmlfile_wrapper-error</Error>
      <BlockedAdCategories>001,002,003</BlockedAdCategories>
      <Creatives>
        <Creative>
          <CompanionAds>
            <Companion id="urn:a2:287461:103" width="0" height="0">
              <CompanionClickThrough><![CDATA[http://example.com/wrapper-invalid-xmlfile_companion_click-thru]]></CompanionClickThrough>
              <CompanionClickTracking><![CDATA[http://example.com/wrapper-invalid-xmlfile_companion_click-tracking]]></CompanionClickTracking>
            </Companion>
          </CompanionAds>
        </Creative>
        <Creative>
          <Linear>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[http://example.com/wrapper-invalid-xmlfile_linear_start]]></Tracking>
              <Tracking event="complete"><![CDATA[http://example.com/wrapper-invalid-xmlfile_linear_complete]]></Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickTracking><![CDATA[http://example.com/wrapper-invalid-xmlfile_linear_clicktracking]]></ClickTracking>
            </VideoClicks>
          </Linear>
        </Creative>
      </Creatives>
      <Extensions>
        <Extension>
            <paramWrapperInvalidXmlfile><![CDATA[valueWrapperInvalidXmlfile]]></paramWrapperInvalidXmlfile>
        </Extension>
      </Extensions>
    </Wrapper>
  </Ad>
</VAST>
`;
