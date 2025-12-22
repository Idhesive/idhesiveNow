import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { XMLParser, XMLValidator } from "fast-xml-parser";

// ============================================================================
// QTI Validation Tool
// ============================================================================

export const validateQtiTool = tool(
    async (qtiXml: string) => {
        if (!qtiXml || qtiXml.toLowerCase() === "none" || qtiXml.trim() === "") {
            return JSON.stringify({ valid: false, errors: ["No XML provided"], warnings: [] });
        }

        // Strip markdown code blocks if present
        const cleanXml = qtiXml.replace(/^```xml\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

        const errors: string[] = [];
        const warnings: string[] = [];

        // 1. Basic XML validation
        const xmlValidation = XMLValidator.validate(cleanXml, {
            allowBooleanAttributes: true,
        });

        if (xmlValidation !== true) {
            return JSON.stringify({
                valid: false,
                errors: [`XML parsing error: ${xmlValidation.err.msg} at line ${xmlValidation.err.line}`],
                warnings: [],
            });
        }

        // 2. Parse XML for structure validation
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            textNodeName: "#text",
        });

        let parsed;
        try {
            parsed = parser.parse(cleanXml);
        } catch (e) {
            return JSON.stringify({
                valid: false,
                errors: [`Failed to parse XML: ${e}`],
                warnings: [],
            });
        }

        // 3. Check for required QTI 3.0 elements
        const assessmentItem =
            parsed["qti-assessment-item"] || parsed["?xml"]?.["qti-assessment-item"];

        if (!assessmentItem) {
            errors.push("Missing root element: qti-assessment-item");
        } else {
            // Check required attributes
            if (!assessmentItem["@_identifier"]) {
                errors.push("Missing required attribute: identifier on qti-assessment-item");
            }
            if (!assessmentItem["@_title"]) {
                warnings.push("Missing recommended attribute: title on qti-assessment-item");
            }

            // Check for response declaration
            const responseDecl = assessmentItem["qti-response-declaration"];
            if (!responseDecl) {
                errors.push("Missing required element: qti-response-declaration");
            } else {
                const decl = Array.isArray(responseDecl) ? responseDecl[0] : responseDecl;
                if (!decl["@_identifier"]) {
                    errors.push("Missing required attribute: identifier on qti-response-declaration");
                }
                if (!decl["@_cardinality"]) {
                    warnings.push("Missing recommended attribute: cardinality on qti-response-declaration");
                }
                if (!decl["@_base-type"]) {
                    warnings.push("Missing recommended attribute: base-type on qti-response-declaration");
                }
            }

            // Check for item body
            const itemBody = assessmentItem["qti-item-body"];
            if (!itemBody) {
                errors.push("Missing required element: qti-item-body");
            } else {
                // Check for at least one interaction
                const hasInteraction =
                    itemBody["qti-choice-interaction"] ||
                    itemBody["qti-text-entry-interaction"] ||
                    itemBody["qti-inline-choice-interaction"] ||
                    itemBody["qti-extended-text-interaction"] ||
                    itemBody["qti-match-interaction"] ||
                    itemBody["qti-order-interaction"] ||
                    JSON.stringify(itemBody).includes("-interaction");

                if (!hasInteraction) {
                    errors.push("Missing interaction element in qti-item-body (e.g., qti-choice-interaction)");
                }
            }

            // Check for response processing (optional but recommended)
            if (!assessmentItem["qti-response-processing"]) {
                warnings.push("Missing qti-response-processing element (recommended for scoring)");
            }
        }

        // 4. Check for correct-response if using standard response processing
        if (qtiXml.includes("match_correct") && !qtiXml.includes("qti-correct-response")) {
            errors.push("Using match_correct template but missing qti-correct-response element");
        }

        return JSON.stringify({
            valid: errors.length === 0,
            errors,
            warnings,
        });
    },
    {
        name: "validate_qti",
        description: "Validates a QTI 3.0 XML string. Input must be the FULL, RAW XML string. Do NOT use placeholders like '(insert XML here)' - pass the actual XML content.",
        schema: z.string().describe("Full QTI XML string"),
    }
);

// ============================================================================
// QTI Generation Templates
// ============================================================================

export function generateChoiceQuestionXml({
    identifier,
    title,
    questionText,
    choices,
    correctChoiceId,
    shuffle = true,
}: {
    identifier: string;
    title: string;
    questionText: string;
    choices: { id: string; text: string }[];
    correctChoiceId: string;
    shuffle?: boolean;
}): string {
    const choicesXml = choices
        .map((c) => `        <qti-simple-choice identifier="${c.id}">${escapeXml(c.text)}</qti-simple-choice>`)
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                     identifier="${identifier}"
                     title="${escapeXml(title)}"
                     adaptive="false"
                     time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response>
      <qti-value>${correctChoiceId}</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>

  <qti-item-body>
    <p>${escapeXml(questionText)}</p>
    <qti-choice-interaction response-identifier="RESPONSE" shuffle="${shuffle}" max-choices="1">
${choicesXml}
    </qti-choice-interaction>
  </qti-item-body>

  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`;
}

export function generateTextEntryQuestionXml({
    identifier,
    title,
    questionText,
    correctAnswer,
    expectedLength = 15,
}: {
    identifier: string;
    title: string;
    questionText: string;
    correctAnswer: string;
    expectedLength?: number;
}): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                     identifier="${identifier}"
                     title="${escapeXml(title)}"
                     adaptive="false"
                     time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="string">
    <qti-correct-response>
      <qti-value>${escapeXml(correctAnswer)}</qti-value>
    </qti-correct-response>
  </qti-response-declaration>

  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
    <qti-default-value>
      <qti-value>0</qti-value>
    </qti-default-value>
  </qti-outcome-declaration>

  <qti-item-body>
    <p>${escapeXml(questionText)}</p>
    <p>Answer: <qti-text-entry-interaction response-identifier="RESPONSE" expected-length="${expectedLength}"/></p>
  </qti-item-body>

  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`;
}

function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// Export all QTI tools
export const qtiTools = [validateQtiTool];
