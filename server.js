const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate-note", async (req, res) => {
  try {
    const {
      cptCode,
      clientName,
      sessionDate,
      serviceLocation,
      rawNote,
      targetsGoals,
      interventionsUsed,
      clientResponse,
    } = req.body;

    const prompt = `
You are an expert ABA/EIDBI documentation generator. Convert the provider’s raw session note into a fully compliant, medically necessary narrative following Minnesota EIDBI, DHS, and CPT requirements.

You must produce a professional, billable clinical note under the selected CPT code:
- 97153: Adaptive Behavior Treatment by Technician
- 97155: Supervision, protocol modification by BCBA/qualified supervisor
- 97156: Parent/Caregiver Training
- H0032: Treatment Plan Development / Review

Follow these general required elements for ALL notes:
- Identify the client, date, provider, code, and location.
- Clearly connect all content to ITP/CMDE goals.
- Interventions must be active, observable, and measurable.
- Include specific behaviors addressed, progress, barriers, and safety concerns.
- Describe data trends, learning opportunities, and generalization.
- Avoid prohibited or non-billable terms unless tied to treatment.

Then follow CPT-specific rules and construct the final note appropriately.

Inputs:
CPT Code: ${cptCode}
Client Name: ${clientName || "N/A"}
Session Date: ${sessionDate || "N/A"}
Service Location: ${serviceLocation || "N/A"}
Raw Note: ${rawNote}
Targets/Goals: ${targetsGoals || ""}
Interventions: ${interventionsUsed || ""}
Client Response: ${clientResponse || ""}

Return ONLY the final compliant session note. Do not explain anything.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "Generate EIDBI/ABA compliant session notes." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const generatedNote = completion.choices?.[0]?.message?.content?.trim();
    res.json({ generatedNote });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Failed to generate note." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Note generator backend running on port ${PORT}`);
});


