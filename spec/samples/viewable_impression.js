export const viewableImpression = `<InLine>
  <ViewableImpression id="viewable_impression">
    <Viewable>
      <![CDATA[http://www.example.com/viewable_impression_1]]>
    </Viewable>
    <Viewable>
      <![CDATA[http://www.sample.com/viewable_impression_2]]>
    </Viewable>
    <NotViewable>
      <![CDATA[http://www.example.com/not_viewable_1]]>
    </NotViewable>
    <NotViewable>
      <![CDATA[http://www.sample.com/not_viewable_2]]>
    </NotViewable>
    <NotViewable>
      <![CDATA[http://www.sample.com/not_viewable_3]]>
    </NotViewable>
    <ViewUndetermined>
      <![CDATA[http://www.example.com/view_undetermined_1]]>
    </ViewUndetermined>
  </ViewableImpression>
</InLine>
`;

export const viewableImpressionPartial = `<InLine>
  <ViewableImpression>
    <Viewable>
      <![CDATA[http://www.example.com/viewable_impression_1]]>
    </Viewable>
    <NotViewable>
      <![CDATA[]]>
    </NotViewable>
  </ViewableImpression>
</InLine>
`;
