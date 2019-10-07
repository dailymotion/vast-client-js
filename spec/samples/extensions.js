export const adExtensions = `<Extensions>
  <Extension type="WrapperExtension">
    <extension_tag>
      <![CDATA[ extension_value ]]>
    </extension_tag>
  </Extension>
  <Extension type="Count">
    <!-- -->
    <![CDATA[ 4 ]]>
  </Extension>
  <Extension>
      { foo: bar }
  </Extension>
  <Extension type="Pricing">
    <Prices>
      <Price model="CPM" currency="USD" source="someone">
        <![CDATA[ 0 ]]>
      </Price>
      <Price model="CPL" currency="EUR" source="someone_else">
        <![CDATA[ 42 ]]>
      </Price>
      <Price model="CPL" currency="EUR" source="someone">
        <![CDATA[ 69 ]]>
      </Price>
      <Price model="CPM" currency="USD" source="someone">
        <![CDATA[ 234.5 ]]>
      </Price>
    </Prices>
    <PricingPolicy>
      <!-- Test of comment -->
      <![CDATA[http://example.com/pricing-policy.html]]>
    </PricingPolicy>
  </Extension>
  <Extension type="OverlyNestedExtension">
    <GreatFather age="70">
        <Father age="40" alive="false">
          <Daughter age="20">Maria</Daughter>
          <Daughter age="20">Lola</Daughter>
          <Son age="25">Paul</Son>
        </Father>
    </GreatFather>
  </Extension>
</Extensions>
`;

export const creativeExtensions = `<CreativeExtensions>
  <CreativeExtension type="Count">
    <![CDATA[ 4 ]]>
  </CreativeExtension>
  <CreativeExtension>
      { foo: bar }
  </CreativeExtension>
  <CreativeExtension type="Pricing">
    <Prices>
      <Price model="CPM" currency="USD" source="someone">
        <![CDATA[ 0 ]]>
      </Price>
      <Price model="CPL" currency="EUR" source="someone_else">
        <![CDATA[ 42 ]]>
      </Price>
      <Price model="CPL" currency="EUR" source="someone">
        <![CDATA[ 69 ]]>
      </Price>
      <Price model="CPM" currency="USD" source="someone">
        <![CDATA[ 234.5 ]]>
      </Price>
    </Prices>
    <PricingPolicy>
      <!-- Test of comment -->
      <![CDATA[http://example.com/pricing-policy.html]]>
    </PricingPolicy>
  </CreativeExtension>
  <CreativeExtension type="OverlyNestedExtension">
    <GreatFather age="70">
        <Father age="40" alive="false">
          <Daughter age="20">Maria</Daughter>
          <Daughter age="20">Lola</Daughter>
          <Son age="25">Paul</Son>
        </Father>
    </GreatFather>
  </CreativeExtension>
</CreativeExtensions>
`;
