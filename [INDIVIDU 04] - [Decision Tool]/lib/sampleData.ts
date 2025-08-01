import { CostBenefitData, DecisionMatrixData, DecisionTreeData, EisenhowerMatrixData, EisenhowerTask, OptionPlan, ProsConsData, RandomDecisionData, Scenario, ScenarioPlanningData, SwotAnalysisData, SwotItem, TreeNode, WeightedOption, WeightedRandomData } from "./toolsConfigType";

export function getDecisionMatrixData(t: any): DecisionMatrixData {
    return {
        options: [
            {
                id: "0",
                name: t("decisionMatrix.initialOptions.option1"),
                scores: { "1": 8, "2": 6, "3": 9 },
            },
            {
                id: "1",
                name: t("decisionMatrix.initialOptions.option2"),
                scores: { "1": 7, "2": 9, "3": 7 },
            },
            {
                id: "2",
                name: t("decisionMatrix.initialOptions.option3"),
                scores: { "1": 9, "2": 7, "3": 8 },
            },
        ],
        criteria: [
            {
                id: "1",
                name: t("decisionMatrix.initialCriteria.criterion1.name"),
                weight: 8,
                description: t("decisionMatrix.initialCriteria.criterion1.description"),
            },
            {
                id: "2",
                name: t("decisionMatrix.initialCriteria.criterion2.name"),
                weight: 7,
                description: t("decisionMatrix.initialCriteria.criterion2.description"),
            },
            {
                id: "3",
                name: t("decisionMatrix.initialCriteria.criterion3.name"),
                weight: 9,
                description: t("decisionMatrix.initialCriteria.criterion3.description"),
            },
        ],
        decisionContext: t("decisionMatrix.initialDecisionContext"),
        showResult: true
    };
}

export function getProsConsData(t: any): ProsConsData {
    return {
        pros: [
            { id: "pro1", text: t("prosCons.initial.pros.pro1"), weight: 5 },
            { id: "pro2", text: t("prosCons.initial.pros.pro2"), weight: 4 },
            { id: "pro3", text: t("prosCons.initial.pros.pro3"), weight: 4 },
            { id: "pro4", text: t("prosCons.initial.pros.pro4"), weight: 3 },
        ],
        cons: [
            { id: "con1", text: t("prosCons.initial.cons.con1"), weight: 5 },
            { id: "con2", text: t("prosCons.initial.cons.con2"), weight: 4 },
            { id: "con3", text: t("prosCons.initial.cons.con3"), weight: 3 },
            { id: "con4", text: t("prosCons.initial.cons.con4"), weight: 3 },
        ],
        decisionContext: t("prosCons.initial.decisionContext"),
        showResult: true
    };
}

export function getCostBenefitData(t: any): CostBenefitData {
    return {
        decisionContext: t("costBenefit.initial.decisionContext"),
        discountRate: 12,            // or any default rate you prefer
        activeTab: "costs",         // default tab (costs or benefits)
        showResult: true,           // whether to show the analysis section by default
        costs: [
            {
                id: "c1",
                description: t("costBenefit.initialCosts.cost1.description"),
                value: 50000,
                isMonetary: true,
                timeframe: "short",
            },
            {
                id: "c2",
                description: t("costBenefit.initialCosts.cost2.description"),
                value: 25000,
                isMonetary: true,
                timeframe: "short",
            },
            {
                id: "c3",
                description: t("costBenefit.initialCosts.cost3.description"),
                value: 15000,
                isMonetary: true,
                timeframe: "medium",
            },
            {
                id: "c4",
                description: t("costBenefit.initialCosts.cost4.description"),
                value: 10000,
                isMonetary: false,
                timeframe: "long",
            },
        ],
        benefits: [
            {
                id: "b1",
                description: t("costBenefit.initialBenefits.benefit1.description"),
                value: 75000,
                isMonetary: true,
                timeframe: "medium",
            },
            {
                id: "b2",
                description: t("costBenefit.initialBenefits.benefit2.description"),
                value: 30000,
                isMonetary: false,
                timeframe: "long",
            },
            {
                id: "b3",
                description: t("costBenefit.initialBenefits.benefit3.description"),
                value: 40000,
                isMonetary: false,
                timeframe: "long",
            },
            {
                id: "b4",
                description: t("costBenefit.initialBenefits.benefit4.description"),
                value: 20000,
                isMonetary: false,
                timeframe: "long",
            },
        ],
    };
}

export function getDecisionTreeData(t: any): DecisionTreeData {
    const initialRootNode: TreeNode = {
        id: "root",
        text: t("decisionTree.initial.rootText"), // e.g., "Vacation Planning"
        children: [
            {
                id: "option1",
                text: t("decisionTree.initial.option1.text"), // e.g., "Beach Resort"
                probability: 1,
                children: [
                    {
                        id: "outcome1",
                        text: t("decisionTree.initial.option1.outcome1.text"), // e.g., "Perfect weather"
                        probability: 0.6,
                        value: 100,
                        children: [],
                    },
                    {
                        id: "outcome2",
                        text: t("decisionTree.initial.option1.outcome2.text"), // e.g., "Rainy season"
                        probability: 0.4,
                        value: -30,
                        children: [],
                    },
                ],
            },
            {
                id: "option2",
                text: t("decisionTree.initial.option2.text"), // e.g., "City Trip"
                probability: 1,
                children: [
                    {
                        id: "outcome3",
                        text: t("decisionTree.initial.option2.outcome3.text"), // e.g., "Found great deals"
                        probability: 0.7,
                        value: 70,
                        children: [],
                    },
                    {
                        id: "outcome4",
                        text: t("decisionTree.initial.option2.outcome4.text"), // e.g., "Expensive and crowded"
                        probability: 0.3,
                        value: -10,
                        children: [],
                    },
                ],
            },
            {
                id: "option3",
                text: t("decisionTree.initial.option3.text"), // e.g., "Mountain Retreat"
                probability: 1,
                children: [
                    {
                        id: "outcome5",
                        text: t("decisionTree.initial.option3.outcome5.text"), // e.g., "Beautiful hiking weather"
                        probability: 0.8,
                        value: 80,
                        children: [],
                    },
                    {
                        id: "outcome6",
                        text: t("decisionTree.initial.option3.outcome6.text"), // e.g., "Too cold for activities"
                        probability: 0.2,
                        value: 0,
                        children: [],
                    },
                ],
            },
        ],
    };

    const initialDecisionContext = t("decisionTree.initial.decisionContext"); // e.g., "Planning a family vacation for summer"

    return {
        decisionContext: initialDecisionContext,
        rootNode: initialRootNode,
        showResult: false,
    };
}

export function getEisenhowerMatrixData(t: any): EisenhowerMatrixData {
    const initialTasks: EisenhowerTask[] = [
        { id: "1", text: t("eisenhowerMatrix.initial.tasks.task1"), urgency: 9, importance: 8, quadrant: 1 },
        { id: "2", text: t("eisenhowerMatrix.initial.tasks.task2"), urgency: 8, importance: 7, quadrant: 1 },
        { id: "3", text: t("eisenhowerMatrix.initial.tasks.task3"), urgency: 3, importance: 9, quadrant: 2 },
        { id: "4", text: t("eisenhowerMatrix.initial.tasks.task4"), urgency: 4, importance: 8, quadrant: 2 },
        { id: "5", text: t("eisenhowerMatrix.initial.tasks.task5"), urgency: 7, importance: 3, quadrant: 3 },
        { id: "6", text: t("eisenhowerMatrix.initial.tasks.task6"), urgency: 2, importance: 4, quadrant: 4 },
    ];

    const initialDecisionContext = t("eisenhowerMatrix.initial.decisionContext"); // e.g., "I need to prioritize my tasks for the upcoming week to maximize productivity."

    return {
        decisionContext: initialDecisionContext,
        tasks: initialTasks,
        showResult: true
    };
}

export function getRandomDecisionData(t: any): RandomDecisionData {
    return {
        decisionContext: t("randomDecision.initial.decisionContext"),

        options: [
            t("randomDecision.initial.options.option1"),
            t("randomDecision.initial.options.option2"),
            t("randomDecision.initial.options.option3"),
            t("randomDecision.initial.options.option4"),
            t("randomDecision.initial.options.option5"),
        ],

        rouletteMode: false,
        selectedOption: null,
        isSpinning: false,

        showResult: true,
    };
}

export function getScenarioPlanningData(t: any): ScenarioPlanningData {
    const initialDecisionContext = t("scenarioPlanning.initial.decisionContext"); // e.g., "Planning our company's expansion strategy considering different possible future scenarios."

    const initialScenarios: Scenario[] = [
        {
            id: "s1",
            name: t("scenarioPlanning.initial.scenarios.s1.name"), // e.g., "Economic Growth"
            description: t("scenarioPlanning.initial.scenarios.s1.description"), // e.g., "Strong economic growth with increased consumer spending and business investment."
            probability: 40,
        },
        {
            id: "s2",
            name: t("scenarioPlanning.initial.scenarios.s2.name"), // e.g., "Economic Stagnation"
            description: t("scenarioPlanning.initial.scenarios.s2.description"), // e.g., "Flat economic growth with cautious consumer spending and limited business investment."
            probability: 35,
        },
        {
            id: "s3",
            name: t("scenarioPlanning.initial.scenarios.s3.name"), // e.g., "Economic Downturn"
            description: t("scenarioPlanning.initial.scenarios.s3.description"), // e.g., "Economic recession with reduced consumer spending and business contraction."
            probability: 25,
        },
    ];

    const initialOptions: OptionPlan[] = [
        {
            id: "o1",
            name: t("scenarioPlanning.initial.options.o1.name"), // e.g., "Aggressive Expansion"
            description: t("scenarioPlanning.initial.options.o1.description"), // e.g., "Open multiple new locations and significantly increase marketing budget."
            scores: { s1: 9, s2: 3, s3: 1 },
        },
        {
            id: "o2",
            name: t("scenarioPlanning.initial.options.o2.name"), // e.g., "Moderate Growth"
            description: t("scenarioPlanning.initial.options.o2.description"), // e.g., "Open one new location and moderately increase marketing efforts."
            scores: { s1: 7, s2: 6, s3: 4 },
        },
        {
            id: "o3",
            name: t("scenarioPlanning.initial.options.o3.name"), // e.g., "Consolidation"
            description: t("scenarioPlanning.initial.options.o3.description"), // e.g., "Focus on improving existing operations and building cash reserves."
            scores: { s1: 4, s2: 7, s3: 8 },
        },
    ];

    return {
        decisionContext: initialDecisionContext,
        scenarios: initialScenarios,
        options: initialOptions,
        showResult: true
    };
}

export function getSwotAnalysisData(t: any): SwotAnalysisData {
    const initialDecisionContext = t("swot.initial.decisionContext"); // e.g., "I'm considering launching an e-commerce store selling handmade crafts."

    const initialStrengths: SwotItem[] = [
        { id: "s1", text: t("swot.initial.strengths.s1") },
        { id: "s2", text: t("swot.initial.strengths.s2") },
        { id: "s3", text: t("swot.initial.strengths.s3") },
    ];

    const initialWeaknesses: SwotItem[] = [
        { id: "w1", text: t("swot.initial.weaknesses.w1") },
        { id: "w2", text: t("swot.initial.weaknesses.w2") },
        { id: "w3", text: t("swot.initial.weaknesses.w3") },
    ];

    const initialOpportunities: SwotItem[] = [
        { id: "o1", text: t("swot.initial.opportunities.o1") },
        { id: "o2", text: t("swot.initial.opportunities.o2") },
        { id: "o3", text: t("swot.initial.opportunities.o3") },
    ];

    const initialThreats: SwotItem[] = [
        { id: "t1", text: t("swot.initial.threats.t1") },
        { id: "t2", text: t("swot.initial.threats.t2") },
        { id: "t3", text: t("swot.initial.threats.t3") },
    ];

    return {
        decisionContext: initialDecisionContext,
        strengths: initialStrengths,
        weaknesses: initialWeaknesses,
        opportunities: initialOpportunities,
        threats: initialThreats,
        showResult: true
    };
}

export function getWeightedRandomData(t: any): WeightedRandomData {
    const initialDecisionContext = t("weightedRandom.initial.decisionContext");

    const initialOptions: WeightedOption[] = [
        { id: "1", text: t("weightedRandom.initial.options.option1"), weight: 8 },
        { id: "2", text: t("weightedRandom.initial.options.option2"), weight: 6 },
        { id: "3", text: t("weightedRandom.initial.options.option3"), weight: 9 },
        { id: "4", text: t("weightedRandom.initial.options.option4"), weight: 5 },
        { id: "5", text: t("weightedRandom.initial.options.option5"), weight: 7 },
    ];

    return {
        decisionContext: initialDecisionContext,
        options: initialOptions,
        showProbabilities: false,
        selectedOption: null,
        isSpinning: false,
        showResult: true,
    };
}
