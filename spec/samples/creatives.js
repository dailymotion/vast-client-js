export const creatives = `<Creatives>
  <Creative id="id130984" adId="adId345690" sequence="1" >
    <UniversalAdId idRegistry="daily-motion-L">Linear-12345</UniversalAdId>
    <CreativeExtensions>
      <CreativeExtension type="creativeExt1">
        <CreativeExecution model="CPM" currency="USD" source="someone">
          <![CDATA[ 10.0 ]]>
        </CreativeExecution>
      </CreativeExtension>
      <CreativeExtension type="Count">
        <![CDATA[ 10 ]]>
      </CreativeExtension>
      <CreativeExtension>
          { key: value }
      </CreativeExtension>
    </CreativeExtensions>
    <Linear>
      <Duration>00:01:30.123</Duration>
      <TrackingEvents>
        <Tracking event="midpoint"><![CDATA[http://example.com/linear-midpoint]]></Tracking>
        <Tracking event="complete"><![CDATA[http://example.com/linear-complete]]></Tracking>
        <Tracking event="start"><![CDATA[http://example.com/linear-start]]></Tracking>
        <Tracking event="firstQuartile"><![CDATA[http://example.com/linear-firstQuartile]]></Tracking>
        <Tracking event="close"><![CDATA[http://example.com/linear-close]]></Tracking>
        <Tracking event="thirdQuartile"><![CDATA[http://example.com/linear-thirdQuartile]]></Tracking>
        <Tracking event="progress" offset="00:00:30.000"><![CDATA[http://example.com/linear-progress-30sec]]></Tracking>
        <Tracking event="progress" offset="60%"><![CDATA[http://example.com/linear-progress-60%]]></Tracking>
      </TrackingEvents>
      <VideoClicks>
        <ClickTracking id='video-click-1'><![CDATA[http://example.com/linear-clicktracking1_ts:[TIMESTAMP]]]></ClickTracking>
        <ClickTracking id='video-click-2'><![CDATA[http://example.com/linear-clicktracking2]]></ClickTracking>
        <ClickThrough id='click-through'><![CDATA[http://example.com/linear-clickthrough]]></ClickThrough>
        <CustomClick id='custom-click-1'><![CDATA[http://example.com/linear-customclick]]></CustomClick>
      </VideoClicks>
      <MediaFiles>
        <MediaFile delivery="progressive" type="video/mp4" bitrate="849" width="512" height="288" scalable="true"><![CDATA[http://example.com/linear-asset.mp4]]></MediaFile>
        <MediaFile apiFramework="VPAID" type="application/javascript" width="512" height="288" delivery="progressive"><![CDATA[parser.js?adData=http%3A%2F%2Fad.com%2F%3Fcb%3D%5Btime%5D]]></MediaFile>
        <Mezzanine id="mezzanine-id-165468451" type="video/mp4" width="1080" height="720" delivery="progressive" codec="h264" fileSize="700"><![CDATA[http://example.com/linear-mezzanine.mp4]]></Mezzanine>
      </MediaFiles>
      <Icons>
        <Icon program="ad1" width="60" height="20" xPosition="left" yPosition="bottom" duration="00:01:30.000" offset="00:00:15.000" apiFramework="VPAID" pxratio="2">
          <StaticResource creativeType="image/gif"><![CDATA[http://example.com/linear-icon.gif]]></StaticResource>
          <IconViewTracking><![CDATA[http://example.com/linear-viewtracking]]></IconViewTracking>
          <IconClicks>
            <IconClickThrough><![CDATA[http://example.com/linear-clickthrough]]></IconClickThrough>
            <IconClickTracking id='icon-click-1'><![CDATA[http://example.com/linear-clicktracking1]]></IconClickTracking>
            <IconClickTracking id='icon-click-2'><![CDATA[http://example.com/linear-clicktracking2]]></IconClickTracking>
          </IconClicks>
        </Icon>
      </Icons>
    </Linear>
  </Creative>
  <Creative id="id130985" AdID="adId345691" sequence="2" >
    <CompanionAds>
      <Companion width="300" height="60">
        <StaticResource creativeType="image/jpeg"><![CDATA[http://example.com/companion1-static-resource]]></StaticResource>
        <AltText><![CDATA[Sample Alt Text Content!!!!]]></AltText>
        <TrackingEvents>
          <Tracking event="creativeView"><![CDATA[http://example.com/companion1-creativeview]]></Tracking>
        </TrackingEvents>
        <CompanionClickThrough><![CDATA[http://example.com/companion1-clickthrough]]></CompanionClickThrough>
        <CompanionClickTracking id="123"><![CDATA[http://example.com/companion1-clicktracking-first]]></CompanionClickTracking>
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
    </CompanionAds>
  </Creative>
  <Creative id="id130986">
    <UniversalAdId idRegistry="daily-motion-NL">NonLinear-12345</UniversalAdId>
    <NonLinearAds>
      <NonLinear width="300" height="200" expandedWidth="600" expandedHeight="400" scalable="false" maintainAspectRatio="true" minSuggestedDuration="00:01:40" apiFramework="someAPI" >
        <StaticResource creativeType="image/jpeg"><![CDATA[http://example.com/nonlinear-static-resource]]></StaticResource>
        <AdParameters>
          <![CDATA[{"key":"value"}]]>
        </AdParameters>
        <NonLinearClickThrough><![CDATA[http://example.com/nonlinear-clickthrough]]></NonLinearClickThrough>
        <NonLinearClickTracking id='nonlinear-click-1'><![CDATA[http://example.com/nonlinear-clicktracking-1]]></NonLinearClickTracking>
        <NonLinearClickTracking><![CDATA[http://example.com/nonlinear-clicktracking-2]]></NonLinearClickTracking>
      </NonLinear>
      <TrackingEvents>
        <Tracking event="midpoint"><![CDATA[http://example.com/nonlinear-midpoint]]></Tracking>
        <Tracking event="complete"><![CDATA[http://example.com/nonlinear-complete]]></Tracking>
        <Tracking event="start"><![CDATA[http://example.com/nonlinear-start]]></Tracking>
        <Tracking event="firstQuartile"><![CDATA[http://example.com/nonlinear-firstQuartile]]></Tracking>
        <Tracking event="close"><![CDATA[http://example.com/nonlinear-close]]></Tracking>
        <Tracking event="thirdQuartile"><![CDATA[http://example.com/nonlinear-thirdQuartile]]></Tracking>
      </TrackingEvents>
    </NonLinearAds>
  </Creative>
</Creatives>`;
