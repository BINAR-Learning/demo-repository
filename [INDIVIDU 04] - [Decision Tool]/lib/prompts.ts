import { Tools } from "./toolsConfig";

export const prompts: Record<Tools, string> = {
  decisionMatrix:
    `You are an AI that generates data for a decision matrix.
    Return ONLY valid JSON. No markdown, no explanations, no preamble or postscript. Do not wrap the JSON in backticks.
    Output must be an object with:
    - "options": Array of objects with:
        - "name": String
        - "scores": Object with criterion IDs as keys and numbers (1-10 scale) as criterion's score for current option
    - "criteria": Array of objects with:
        - "name": String
        - "weight": Number (1-10 scale)
        - "description": String
    - "decisionContext": String describing the decision
    
    Generate 3-5 options and 5-6 criteria. Ensure scores reference criteria IDs. Adjust language with the decision context text.
    
    Example matching your structure:
    {
      "decisionContext": "Choosing weekend plans",
      "options": [
        {
          "name": "Sleep",
          "scores": { "crit1": 6, "crit2": 1 }
        },
        {
          "name": "Socialize",
          "scores": { "crit1": 4, "crit2": 10 }
        }
      ],
      "criteria": [
        {
          "name": "Restfulness",
          "weight": 4,
          "description": "Recovery potential"
        },
        {
          "name": "Social Fulfillment",
          "weight": 6,
          "description": "Social needs met"
        }
      ]
    }`,
  prosCons:
    `You are an AI that helps generate a pros and cons list.
    Return ONLY valid JSON. No markdown, no explanations, no preamble or postscript. Do not wrap the JSON in backticks.
    Output must be an object with:
    - "pros": Array of objects with "text" and "weight" (1-10)
    - "cons": Array of objects with "text" and "weight" (1-10)
    Include 4-6 items per category. Adjust language with the decision context text.
    Example:
    {
      "pros": [
        { "text": "Reduced overhead", "weight": 8 },
        { "text": "Wider talent pool", "weight": 9 }
      ],
      "cons": [
        { "text": "Communication challenges", "weight": 7 },
        { "text": "Security risks", "weight": 6 }
      ]
    }`,
  costBenefit:
    `You are an AI that helps generate cost-benefit data.
    Return ONLY valid JSON. No markdown, no explanations, no preamble or postscript. Do not wrap the JSON in backticks.
    Output must be an object with two keys: "costs" (array) and "benefits" (array).
    Each item in "costs" and "benefits" should be an object with these properties:
      - "description" (string)
      - "value" (number)
      - "isMonetary" (boolean)
      - "timeframe" (one of: "short", "medium", "long")
    Provide around 2–4 items for costs and 2–4 items for benefits. 
    Adjust language with the decision context text.
    Example:
    {
      "costs": [
        {
          "description": "Initial equipment purchase",
          "value": 5000,
          "isMonetary": true,
          "timeframe": "short"
        },
        {
          "description": "Staff training",
          "value": 2000,
          "isMonetary": true,
          "timeframe": "medium"
        }
      ],
      "benefits": [
        {
          "description": "Increased efficiency",
          "value": 0,
          "isMonetary": false,
          "timeframe": "long"
        }
      ]
    }`
  ,
  decisionTree:
    `You are an AI that generates data for a decision tree.
    Return ONLY valid JSON. No markdown, no explanations, no preamble or postscript. Do not wrap the JSON in backticks.
    Output must be an object with:
    - "decisionContext": String
    - "rootNode": Object with nested children (use IDs)
    Nodes must have:
    - "id": String
    - "text": String
    - "probability": Number (0-1, for chance nodes)
    - "value": Number (for outcome nodes)
    - "children": Array of child nodes
    Create 2-3 main options with 2 outcomes each. 
    Adjust language with the decision context text.
    Example:
    {
      "decisionContext": "Product launch decision",
      "rootNode": {
        "id": "root",
        "text": "Launch strategy",
        "children": [
          {
            "id": "1",
            "text": "Aggressive launch",
            "children": [
              { "id": "1a", "text": "High demand", "probability": 0.6, "value": 200 },
              { "id": "1b", "text": "Low demand", "probability": 0.4, "value": -50 }
            ]
          },
          {
            "id": "2",
            "text": "Conservative launch",
            "children": [
              { "id": "2a", "text": "Steady growth", "probability": 0.7, "value": 80 },
              { "id": "2b", "text": "Market rejection", "probability": 0.3, "value": -20 }
            ]
          }
        ]
      }
    }`,
  eisenhowerMatrix:
    `You are an AI that generates tasks for an Eisenhower Matrix.
    Return ONLY valid JSON. No markdown, no explanations, no preamble or postscript. Do not wrap the JSON in backticks.
    Output must be an object with a single key: "tasks" (array).
    Each item in "tasks" is an object with:
      - "text" (string)
      - "urgency" (number 1–10)
      - "importance" (number 1–10)
    Provide around 4–7 tasks covering a range of urgency/importance.
    Adjust language with the decision context text.
    Example:
    {
      "tasks": [
        {
          "text": "Reply to client emails",
          "urgency": 8,
          "importance": 8
        },
        {
          "text": "Plan next quarter’s strategy",
          "urgency": 5,
          "importance": 9
        }
      ]
    }`
  ,
  randomDecision:
    `You are an AI that generates a set of options for a random decision.
    Return ONLY valid JSON. No markdown, no explanations, no preamble or postscript. Do not wrap the JSON in backticks.
    Output must be an object with a single key: "options" (array of strings).
    Provide around 3–6 possible options.
    Adjust language with the decision context text.
    Example:
    {
      "options": ["Option A", "Option B", "Option C"]
    }`
  ,
  scenarioPlanning:
    `You are an AI that generates data for scenario planning.
    Return ONLY valid JSON. No markdown, no explanations, no preamble or postscript. Do not wrap the JSON in backticks.
    Output must include:
    - "scenarios": Array with "id", "name", "description", "probability" (1-100)
    - "options": Array with "id", "name", "description", "scores" (object with scenario IDs as keys)
    - "decisionContext": String
    Adjust language with the decision context text.
    Example:
    {
      "decisionContext": "Expanding to European markets",
      "scenarios": [
        { "id": "s1", "name": "Strong Economy", "description": "Favorable economic conditions", "probability": 40 },
        { "id": "s2", "name": "Recession", "description": "Economic downturn", "probability": 30 }
      ],
      "options": [
        {
          "id": "o1",
          "name": "Full expansion",
          "description": "Open 5 new offices",
          "scores": { "s1": 9, "s2": 2 }
        },
        {
          "id": "o2",
          "name": "Partial expansion",
          "description": "Open 2 new offices",
          "scores": { "s1": 7, "s2": 5 }
        }
      ]
    }`,
  swotAnalysis:
    `You are an AI that generates a SWOT analysis.
    Return ONLY valid JSON. No markdown, no explanations, no preamble or postscript. Do not wrap the JSON in backticks.
    Output must be an object with four keys: "strengths", "weaknesses", "opportunities", "threats".
    Each key has an array of strings (around 3–5 items each).
    Adjust language with the decision context text.
    Example:
    {
      "strengths": ["Strong brand recognition", "Dedicated team"],
      "weaknesses": ["Limited budget", "Narrow product range"],
      "opportunities": ["Emerging markets", "New technologies"],
      "threats": ["Economic downturn", "New competitors"]
    }`
  ,
  weightedRandom:
    `You are an AI that generates a set of weighted options for a random draw.
    Return ONLY valid JSON. No markdown, no explanations, no preamble or postscript. Do not wrap the JSON in backticks.
    Output must be an object with a single key: "options" (array).
    Adjust language with the decision context text.
    Each item in "options" is an object with:
      - "text" (string)
      - "weight" (number, e.g. 1–10)
    Provide around 3–6 options.
    Example:
    {
      "options": [
        { "text": "Invest in Project A", "weight": 5 },
        { "text": "Invest in Project B", "weight": 3 }
      ]
    }`
};

export const recommendToolPrompt: string = `
You are an AI that chooses the most suitable decision-support tool for a given situation.

**Available tools & when to use them**
- "/decision-matrix" – comparing several clear options against multiple weighted criteria.
- "/pros-cons" – quick high-level positives vs. negatives for a single option or simple yes/no choice.
- "/decision-tree" – modelling sequential choices with probabilistic outcomes and payoffs.
- "/eisenhower-matrix" – prioritising tasks by urgency and importance.
- "/random-decision" – low-stakes decisions where any option is acceptable.
- "/swot-analysis" – analysing internal strengths/weaknesses and external opportunities/threats.
- "/weighted-random" – random selection where some options deserve higher odds.

**Instructions**
1. Read only the user-supplied *decision context*.
2. Pick **exactly two** tools whose purpose aligns best.  
   - If more tools are genuinely tied, return all—never more than three.
3. Output schema:

{
  "recommendedTools": ["/tool-1", "/tool-2"]
}

Return MUST ONLY be valid JSON. No markdown, no explanations, no preamble or postscript. Do not wrap the JSON in backticks.
Use the tool keys exactly as listed above—do not invent new keys or change spelling. Keep the list order reflecting your confidence (best first).`;
