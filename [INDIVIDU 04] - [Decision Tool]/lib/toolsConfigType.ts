// ==== Decision Matrix ====

export type DecisionMatrixResult = {
    options?: Array<{ id?: string; name?: string; scores?: Array<Record<string, number>> }>;
    criteria?: Array<{ id?: string; name?: string; description?: string; weight?: number }>;
}

export type Option = {
    id: string
    name: string
    scores: Record<string, number>
}

export type Criterion = {
    id: string
    name: string
    weight: number
    description?: string
}

export type DecisionMatrixData = {
    decisionContext: string
    options: Option[]
    criteria: Criterion[]
    showResult: boolean
}

// ==== Pros Cons ====

export type ProsConsResult = {
    pros?: Array<{ text?: string; weight?: number; }>;
    cons?: Array<{ text?: string; weight?: number; }>;
}

export type ProsConsData = {
    decisionContext: string
    pros: Array<{ id: string; text: string; weight: number }>
    cons: Array<{ id: string; text: string; weight: number }>
    showResult: boolean
}

// ==== Cost-Benefit ====
export type CostBenefitItem = {
    id: string;
    description: string;
    value: number;
    isMonetary: boolean;
    timeframe: "short" | "medium" | "long";
};

export type CostBenefitData = {
    decisionContext: string;
    costs: CostBenefitItem[];
    benefits: CostBenefitItem[];
    discountRate: number;
    activeTab: "costs" | "benefits";
    showResult: boolean;
};

export type CostBenefitResult = {
    costs?: Array<Partial<CostBenefitItem>>;
    benefits?: Array<Partial<CostBenefitItem>>;
};


// ==== Decision Tree ====
export interface TreeNode {
    id: string;
    text: string;
    probability?: number;
    value?: number;
    children: TreeNode[];
}

export type DecisionTreeData = {
    decisionContext: string;
    rootNode: TreeNode;
    showResult: boolean;
};

export type DecisionTreeResult = {
    outcomes?: Array<{
        description: string;
        probability: number;
        value: number;
    }>;
};

// ==== Eisenhower Matrix ====

export type EisenhowerTask = {
    id: string;
    text: string;
    urgency: number;      // 1–10
    importance: number;   // 1–10
    quadrant: 1 | 2 | 3 | 4;
};

export type EisenhowerMatrixData = {
    decisionContext: string;
    tasks: EisenhowerTask[];
    showResult: boolean;
};

export type EisenhowerMatrixResult = {
    tasks?: Array<Partial<EisenhowerTask>>;
    // etc.
};


// ==== Random Decision ====

export type RandomDecisionData = {
    decisionContext: string;
    options: string[];
    rouletteMode: boolean;
    selectedOption: string | null;
    isSpinning: boolean;
    showResult: boolean;
};

export type RandomDecisionResult = {
    options?: string[];
};


// ==== Scenario Planning ====


export type Scenario = {
    id: string;
    name: string;
    description: string;
    probability: number;
};

export type OptionPlan = {
    id: string;
    name: string;
    description: string;
    scores: Record<string, number>;
};

export type ScenarioPlanningData = {
    decisionContext: string;
    scenarios: Scenario[];
    options: OptionPlan[];
    showResult: boolean;
};

export type ScenarioPlanningResult = {
    scenarios?: Array<Partial<Scenario>>;
    options?: Array<Partial<OptionPlan>>;
};


// ==== SWOT Analysis ====

export type SwotItem = {
    id: string;
    text: string;
};

export type SwotAnalysisData = {
    decisionContext: string;
    strengths: SwotItem[];
    weaknesses: SwotItem[];
    opportunities: SwotItem[];
    threats: SwotItem[];
    showResult: boolean;
};

export type SwotAnalysisResult = {
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
};


// ==== Weighted Random ====

export type WeightedOption = {
    id: string;
    text: string;
    weight: number;
};

export type WeightedRandomData = {
    decisionContext: string;
    options: WeightedOption[];
    showProbabilities: boolean;
    selectedOption: WeightedOption | null;
    isSpinning: boolean;
    showResult: boolean;
};

export type WeightedRandomResult = {
    options?: Array<{ text?: string; weight?: number }>;
};
