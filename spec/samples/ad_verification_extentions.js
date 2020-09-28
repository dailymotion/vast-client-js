export const adVerificationExtensions = `<Ad id="ad_id_0001" sequence="1" adType="video">
  <InLine>
    <AdSystem version="2.0" ><![CDATA[AdServer]]></AdSystem>
    <AdTitle><![CDATA[Ad title]]></AdTitle>
    <Description><![CDATA[Description text]]></Description>
    <Error><![CDATA[http://example.com/error_[ERRORCODE]]]></Error>
    <Impression id="sample-impression1"><![CDATA[http://example.com/impression1_asset:[ASSETURI]_[CACHEBUSTING]]]></Impression>
    <Creatives>
      <Creative id="id130984" adId="adId345690" sequence="1" >
        <Linear>
          <Duration>00:01:30.123</Duration>
          <MediaFiles>
            <MediaFile delivery="progressive" type="video/mp4" bitrate="849" width="512" height="288" scalable="true" fileSize="345670"><![CDATA[http://example.com/linear-asset.mp4]]></MediaFile>
          </MediaFiles>
        </Linear>
      </Creative>
    </Creatives>
    <Extensions>
      <Extension type="Pricing">
        <Price model="CPM" currency="USD" source="someone">
          <![CDATA[ 0 ]]>
        </Price>
      </Extension>
      <Extension type="Count">
        <!-- -->
        <![CDATA[ 4 ]]>
      </Extension>
      <Extension>
          { foo: bar }
      </Extension>
      <Extension type="AdVerifications">
        <AdVerifications>
          <Verification vendor="abc.com-omid">
            <JavaScriptResource apiFramework="omid" browserOptional="true">
              <![CDATA[https://abc.com/omid.js]]>
            </JavaScriptResource>
            <VerificationParameters><![CDATA[...]]></VerificationParameters>
            <TrackingEvents>
              <Tracking event="verificationNotExecuted">
                <![CDATA[https://abc.com/omid_reject?r=[REASON]]]>
              </Tracking>
            </TrackingEvents>
          </Verification>
          <Verification vendor="xyz.com-omidpub">
            <JavaScriptResource apiFramework="omid" browserOptional="true">
              <![CDATA[https://xyz.com/omid-verify.js]]>
            </JavaScriptResource>
            <VerificationParameters><![CDATA[...]]></VerificationParameters>
          </Verification>
        </AdVerifications>
      </Extension>
    </Extensions>
  </InLine>
</Ad>`;
