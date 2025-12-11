/**
 * Mock QTI XML data for testing
 * Contains sample QTI 3.0 assessment items
 */

// Simple multiple choice question
export const MOCK_QTI_CHOICE = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
                      identifier="choice-example-001"
                      title="Multiple Choice Example"
                      adaptive="false"
                      time-dependent="false"
                      xml:lang="en">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>ChoiceA</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>

  <qti-item-body>
    <p>What is the capital of France?</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="false" max-choices="1">
      <qti-simple-choice identifier="ChoiceA">Paris</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceB">London</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceC">Berlin</qti-simple-choice>
      <qti-simple-choice identifier="ChoiceD">Madrid</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>

  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`;

// Text entry question
export const MOCK_QTI_TEXT_ENTRY = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
                      identifier="text-entry-example-001"
                      title="Text Entry Example"
                      adaptive="false"
                      time-dependent="false"
                      xml:lang="en">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
    <qti-correct-response>
      <qti-value>oxygen</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>

  <qti-item-body>
    <p>What element makes up approximately 21% of Earth's atmosphere?</p>
    <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="10"/>
  </qti-item-body>

  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`;

// Math question with inline choice
export const MOCK_QTI_INLINE_CHOICE = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                      xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd"
                      identifier="inline-choice-example-001"
                      title="Inline Choice Example"
                      adaptive="false"
                      time-dependent="false"
                      xml:lang="en">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>twelve</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>

  <qti-item-body>
    <p>If a rectangle has a length of 4 meters and a width of 3 meters, its area is
    <qti-inline-choice-interaction response-identifier="RESPONSE" shuffle="false">
      <qti-inline-choice identifier="seven">7</qti-inline-choice>
      <qti-inline-choice identifier="twelve">12</qti-inline-choice>
      <qti-inline-choice identifier="fourteen">14</qti-inline-choice>
    </qti-inline-choice-interaction> square meters.</p>
  </qti-item-body>

  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`;

// Export all mock items
export const MOCK_QTI_ITEMS = {
  choice: MOCK_QTI_CHOICE,
  textEntry: MOCK_QTI_TEXT_ENTRY,
  inlineChoice: MOCK_QTI_INLINE_CHOICE,
};

export type MockQtiItemType = keyof typeof MOCK_QTI_ITEMS;
