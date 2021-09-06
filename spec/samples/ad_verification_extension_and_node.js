export const adVerificationsInDedicatedNodeAndInExtensionsNode = `
<Ad id="20001" sequence="1" conditionalAd="false">
   <InLine>
      <Extensions>
         <Extension type="iab">
            <AdVerifications>
               <Verification>
                  <JavaScriptResource><![CDATA[https://verificationcompany.com/extentionAdVerification1.js]]></JavaScriptResource>
               </Verification>
               <Verification>
                  <JavaScriptResource><![CDATA[https://verificationcompany.com/extentionAdVerification2.js]]></JavaScriptResource>
               </Verification>
            </AdVerifications>
         </Extension>
      </Extensions>
      <AdSystem version="4.0">iabtechlab</AdSystem>
      <AdTitle>Inline Simple Ad</AdTitle>
      <AdVerifications>
         <Verification>
            <JavaScriptResource><![CDATA[https://verificationcompany.com/dedicatedNodeAdVerification1.js]]></JavaScriptResource>
         </Verification>
         <Verification>
            <JavaScriptResource><![CDATA[https://verificationcompany.com/dedicatedNodeAdVerification2.js]]></JavaScriptResource>
         </Verification>
      </AdVerifications>
      <Advertiser>IAB Sample Company</Advertiser>
      <Category authority="http://www.iabtechlab.com/categoryauthority">AD CONTENT description category</Category>
      <Creatives>
         <Creative id="5480" sequence="1" adId="2447226">
            <UniversalAdId idRegistry="Ad-ID" idValue="8465">8465</UniversalAdId>
            <Linear>
               <Duration>00:00:16</Duration>
               <MediaFiles>
                  <MediaFile id="5241" delivery="progressive" type="video/mp4" bitrate="2000" width="1280" height="720" minBitrate="1500" maxBitrate="2500" scalable="1" maintainAspectRatio="1" codec="H.264"><![CDATA[https://iab-publicfiles.s3.amazonaws.com/vast/VAST-4.0-Short-Intro.mp4]]></MediaFile>
                  <MediaFile id="5244" delivery="progressive" type="video/mp4" bitrate="1000" width="854" height="480" minBitrate="700" maxBitrate="1500" scalable="1" maintainAspectRatio="1" codec="H.264"><![CDATA[https://iab-publicfiles.s3.amazonaws.com/vast/VAST-4.0-Short-Intro-mid-resolution.mp4]]></MediaFile>
                  <MediaFile id="5246" delivery="progressive" type="video/mp4" bitrate="600" width="640" height="360" minBitrate="500" maxBitrate="700" scalable="1" maintainAspectRatio="1" codec="H.264"><![CDATA[https://iab-publicfiles.s3.amazonaws.com/vast/VAST-4.0-Short-Intro-low-resolution.mp4]]></MediaFile>
               </MediaFiles>
            </Linear>
         </Creative>
      </Creatives>
   </InLine>
</Ad>
`;
