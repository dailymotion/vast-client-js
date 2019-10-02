export const companionAds = `<CompanionAds required="any">
  <Companion id="1" width="300" height="250" assetWidth="250" assetHeight="200" expandedWidth="350" expandedHeight="250" apiFramework="VPAID" adSlotID="1" pxratio="2" renderingMode="end-card">
    <StaticResource creativeType="image/jpeg"><![CDATA[http://example.com/companion1-static-resource1]]></StaticResource>
    <StaticResource creativeType="image/jpeg"><![CDATA[http://example.com/companion1-static-resource2]]></StaticResource>
    <AltText><![CDATA[Sample Alt Text Content]]></AltText>
    <TrackingEvents>
      <Tracking event="creativeView"><![CDATA[http://example.com/companion1-creativeview]]></Tracking>
    </TrackingEvents>
    <AdParameters xmlEncoded="false"><![CDATA[campaign_id=1]]></AdParameters>
    <CompanionClickThrough><![CDATA[http://example.com/companion1-clickthrough]]></CompanionClickThrough>
    <CompanionClickTracking id="1"><![CDATA[http://example.com/companion1-clicktracking-first]]></CompanionClickTracking>
    <CompanionClickTracking id="2"><![CDATA[http://example.com/companion1-clicktracking-second]]></CompanionClickTracking>
  </Companion>
  <Companion id="2" width="300" height="60" assetWidth="250" assetHeight="200" expandedWidth="350" expandedHeight="250" apiFramework="VPAID" adSlotID="2" renderingMode="concurrent">
    <IFrameResource><![CDATA[http://www.example.com/companion2-example.php]]></IFrameResource>
    <AltText><![CDATA[Sample Alt Text Content]]></AltText>
    <TrackingEvents>
      <Tracking event="creativeView"><![CDATA[http://example.com/companion2-creativeview]]></Tracking>
    </TrackingEvents>
    <AdParameters><![CDATA[campaign_id=2]]></AdParameters>
    <CompanionClickThrough><![CDATA[http://www.example.com/companion2-clickthrough]]></CompanionClickThrough>
  </Companion>
  <Companion id="3" width="300" height="60" assetWidth="250" assetHeight="200" expandedWidth="350" expandedHeight="250" apiFramework="VPAID" adSlotID="3">
    <HTMLResource>
      <![CDATA[
        <a href="http://www.example.com" target="_blank">Some call to action HTML!</a>
      ]]>
    </HTMLResource>
    <AltText><![CDATA[Sample Alt Text Content]]></AltText>
    <TrackingEvents>
      <Tracking event="creativeView"><![CDATA[http://example.com/companion3-creativeview]]></Tracking>
    </TrackingEvents>
    <AdParameters><![CDATA[campaign_id=3]]></AdParameters>
    <CompanionClickThrough><![CDATA[http://www.example.com/companion3-clickthrough]]></CompanionClickThrough>
  </Companion>
</CompanionAds>`;
