export const adVerificationFromExtensionsNodeAndFromNode = `
<Ad id="20001" sequence="1" conditionalAd="false">
<InLine>
<Extensions>
<Extension type="iab-Count">
<total_available>
<![CDATA[ 2 ]]>
</total_available>
</Extension>
<Extension type="dailymotion">
<AdVerifications>
<Verification>
<JavaScriptResource>
<![CDATA[ https://verificationcompany.com/iamintheextension1.js ]]>
</JavaScriptResource>
</Verification>
<Verification>
<JavaScriptResource>
<![CDATA[ https://verificationcompany.com/iamintheextension2.js ]]>
</JavaScriptResource>
</Verification>
</AdVerifications>
</Extension>
</Extensions>
<AdSystem version="4.0">iabtechlab</AdSystem>
<Error>http://example.com/error</Error>
<Impression id="Impression-ID">http://example.com/track/impression</Impression>
<Pricing model="cpm" currency="USD">
<![CDATA[ 25.00 ]]>
</Pricing>
<AdTitle>Inline Simple Ad</AdTitle>
<AdVerifications>
<Verification>
<JavaScriptResource>
<![CDATA[ https://verificationcompany.com/iaminadverifications1.js ]]>
</JavaScriptResource>
</Verification>
<Verification>
<JavaScriptResource>
<![CDATA[ https://verificationcompany.com/iaminadverifications2.js ]]>
</JavaScriptResource>
</Verification>
</AdVerifications>
<Advertiser>IAB Sample Company</Advertiser>
<Category authority="http://www.iabtechlab.com/categoryauthority">AD CONTENT description category</Category>
<Creatives>
<Creative id="5480" sequence="1" adId="2447226">
<UniversalAdId idRegistry="Ad-ID" idValue="8465">8465</UniversalAdId>
<Linear>
<TrackingEvents>
<Tracking event="start">http://example.com/tracking/start</Tracking>
<Tracking event="firstQuartile">http://example.com/tracking/firstQuartile</Tracking>
<Tracking event="midpoint">http://example.com/tracking/midpoint</Tracking>
<Tracking event="thirdQuartile">http://example.com/tracking/thirdQuartile</Tracking>
<Tracking event="complete">http://example.com/tracking/complete</Tracking>
<Tracking event="progress" offset="00:00:10">http://example.com/tracking/progress-10</Tracking>
</TrackingEvents>
<Duration>00:00:16</Duration>
<MediaFiles>
<MediaFile id="5241" delivery="progressive" type="video/mp4" bitrate="2000" width="1280" height="720" minBitrate="1500" maxBitrate="2500" scalable="1" maintainAspectRatio="1" codec="H.264">
<![CDATA[ https://iab-publicfiles.s3.amazonaws.com/vast/VAST-4.0-Short-Intro.mp4 ]]>
</MediaFile>
<MediaFile id="5244" delivery="progressive" type="video/mp4" bitrate="1000" width="854" height="480" minBitrate="700" maxBitrate="1500" scalable="1" maintainAspectRatio="1" codec="H.264">
<![CDATA[ https://iab-publicfiles.s3.amazonaws.com/vast/VAST-4.0-Short-Intro-mid-resolution.mp4 ]]>
</MediaFile>
<MediaFile id="5246" delivery="progressive" type="video/mp4" bitrate="600" width="640" height="360" minBitrate="500" maxBitrate="700" scalable="1" maintainAspectRatio="1" codec="H.264">
<![CDATA[ https://iab-publicfiles.s3.amazonaws.com/vast/VAST-4.0-Short-Intro-low-resolution.mp4 ]]>
</MediaFile>
</MediaFiles>
<VideoClicks>
<ClickThrough id="blog">
<![CDATA[ https://iabtechlab.com ]]>
</ClickThrough>
</VideoClicks>
</Linear>
</Creative>
</Creatives>
</InLine>
</Ad>`;
