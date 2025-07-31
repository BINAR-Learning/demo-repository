import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AnalysisData {
  type: 'team_members' | 'projects' | 'teams';
  period: string;
  data: any[];
  metrics: string[];
  totalRecords: number;
}

interface TimesheetAnalysisData {
  period: string;
  project?: string;
  teamId?: number;
  totalHours: number;
  activities: any[];
  categoryBreakdown: any[];
  periodDays: number;
  teamMembers?: any[];
  projectBreakdown?: any[];
  analysisType: string;
  comparisonMode: string;
  selectedComparisonItems: any[];
}

interface AiInsight {
  summary: string;
  recommendations: string[];
  trends: string[];
  alerts: string[];
  performance: {
    best: string;
    needsImprovement: string;
    opportunities: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();

    // Detect the type of analysis data being sent
    let insights: AiInsight;
    let source = 'local';
    let model = 'manual-logic';

    if (isComparisonAnalysisData(requestData)) {
      // Handle comparison analysis (existing format)
      try {
        insights = await generateGeminiInsights(requestData);
        source = 'gemini';
        model = 'gemini-1.5-flash';
      } catch (error) {
        console.warn('Gemini API failed, falling back to pattern-based generation:', error);
        insights = generateAiInsights(requestData);
      }
    } else if (isTimesheetAnalysisData(requestData)) {
      // Handle timesheet analysis (new format)
      try {
        insights = await generateGeminiTimesheetInsights(requestData);
        source = 'gemini';
        model = 'gemini-1.5-flash';
      } catch (error) {
        console.warn('Gemini API failed, falling back to pattern-based generation:', error);
        insights = generateTimesheetInsights(requestData);
      }
    } else {
      throw new Error('Invalid analysis data format');
    }

    return NextResponse.json({ 
      insights,
      source,
      model
    });
  } catch (error) {
    console.error('Error analyzing data with AI:', error);
    return NextResponse.json(
      { error: 'Failed to analyze data with AI' },
      { status: 500 }
    );
  }
}

function isComparisonAnalysisData(data: any): data is AnalysisData {
  return data.type && ['team_members', 'projects', 'teams'].includes(data.type) && 
         data.metrics && Array.isArray(data.metrics) && 
         data.data && Array.isArray(data.data);
}

function isTimesheetAnalysisData(data: any): data is TimesheetAnalysisData {
  return data.period && data.totalHours !== undefined && 
         data.activities && Array.isArray(data.activities) &&
         data.categoryBreakdown && Array.isArray(data.categoryBreakdown);
}

async function generateGeminiInsights(data: AnalysisData): Promise<AiInsight> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = createAnalysisPrompt(data);
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log('Gemini raw response:', text);

  try {
    // Try to extract JSON from the response (in case it's wrapped in markdown or has extra text)
    let jsonText = text;
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // Try to find JSON object in the text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    // Parse the JSON response from Gemini
    const parsedResponse = JSON.parse(jsonText);
    
    // Validate the response structure
    if (!parsedResponse.summary || !parsedResponse.recommendations || !parsedResponse.performance) {
      throw new Error('Invalid response structure from Gemini API');
    }
    
    return parsedResponse as AiInsight;
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', parseError);
    console.error('Raw response was:', text);
    throw new Error('Invalid response format from Gemini API');
  }
}

async function generateGeminiTimesheetInsights(data: TimesheetAnalysisData): Promise<AiInsight> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = createTimesheetAnalysisPrompt(data);
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log('Gemini timesheet raw response:', text);

  try {
    // Try to extract JSON from the response
    let jsonText = text;
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    const parsedResponse = JSON.parse(jsonText);
    
    if (!parsedResponse.summary || !parsedResponse.recommendations || !parsedResponse.performance) {
      throw new Error('Invalid response structure from Gemini API');
    }
    
    return parsedResponse as AiInsight;
  } catch (parseError) {
    console.error('Failed to parse Gemini timesheet response:', parseError);
    console.error('Raw response was:', text);
    throw new Error('Invalid response format from Gemini API');
  }
}

function createAnalysisPrompt(data: AnalysisData): string {
  const { type, period, data: comparisonData, metrics, totalRecords } = data;

  return `You are an AI business analyst specializing in timesheet and productivity analysis. Analyze the following data and provide insights in JSON format.

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, explanations, or additional text outside the JSON object.

Data Type: ${type}
Analysis Period: ${period}
Total Records: ${totalRecords}
Metrics: ${metrics.join(', ')}

Data:
${JSON.stringify(comparisonData, null, 2)}

Provide your analysis in this EXACT JSON format (no additional text, no markdown):
{
  "summary": "A concise summary of the key findings",
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"],
  "trends": ["Key trend 1", "Key trend 2", "Key trend 3"],
  "alerts": ["Important alert 1", "Important alert 2"],
  "performance": {
    "best": "Description of best performer/performance",
    "needsImprovement": "Description of what needs improvement",
    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
  }
}

Focus on:
- Data-driven insights specific to ${type} analysis
- Actionable recommendations for improvement
- Identifying patterns and trends
- Highlighting potential issues or opportunities
- Providing specific, measurable insights

CRITICAL: Return ONLY the JSON object, no other text or formatting.`;
}

function createTimesheetAnalysisPrompt(data: TimesheetAnalysisData): string {
  const { period, totalHours, activities, categoryBreakdown, periodDays, analysisType } = data;

  return `You are an AI business analyst specializing in timesheet and productivity analysis. Analyze the following timesheet data and provide insights in JSON format.

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, explanations, or additional text outside the JSON object.

Analysis Period: ${period}
Total Hours: ${totalHours}
Period Days: ${periodDays}
Analysis Type: ${analysisType}
Average Hours Per Day: ${(totalHours / periodDays).toFixed(2)}

Activities Data:
${JSON.stringify(activities.slice(0, 10), null, 2)}${activities.length > 10 ? `\n... and ${activities.length - 10} more activities` : ''}

Category Breakdown:
${JSON.stringify(categoryBreakdown, null, 2)}

Provide your analysis in this EXACT JSON format (no additional text, no markdown):
{
  "summary": "A concise summary of the timesheet analysis findings",
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"],
  "trends": ["Key trend 1", "Key trend 2", "Key trend 3"],
  "alerts": ["Important alert 1", "Important alert 2"],
  "performance": {
    "best": "Description of best performing aspect",
    "needsImprovement": "Description of what needs improvement",
    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
  }
}

Focus on:
- Time management and productivity patterns
- Category distribution and work balance
- Daily/weekly/monthly productivity trends
- Potential improvements in time allocation
- Work-life balance considerations

CRITICAL: Return ONLY the JSON object, no other text or formatting.`;
}

function generateAiInsights(data: AnalysisData): AiInsight {
  const { type, period, data: comparisonData, metrics } = data;

  // Calculate basic statistics
  const totalHours = comparisonData.reduce((sum: number, item: any) => sum + (item.totalHours || 0), 0);
  const avgHours = totalHours / comparisonData.length;
  const maxHours = Math.max(...comparisonData.map((item: any) => item.totalHours || 0));
  const minHours = Math.min(...comparisonData.map((item: any) => item.totalHours || 0));

  // Find top and bottom performers
  const sortedByHours = [...comparisonData].sort((a: any, b: any) => (b.totalHours || 0) - (a.totalHours || 0));
  const topPerformer = sortedByHours[0];
  const bottomPerformer = sortedByHours[sortedByHours.length - 1];

  // Generate insights based on data type
  let summary = '';
  let recommendations: string[] = [];
  let trends: string[] = [];
  let alerts: string[] = [];
  let best = '';
  let needsImprovement = '';
  let opportunities: string[] = [];

  switch (type) {
    case 'team_members':
      summary = `Team member analysis for the ${period} period shows ${comparisonData.length} members with an average of ${avgHours.toFixed(1)} hours worked. The team shows ${avgHours > 40 ? 'high' : avgHours > 30 ? 'moderate' : 'low'} productivity levels.`;
      
      recommendations = [
        'Implement regular 1-on-1 meetings to address individual performance gaps',
        'Consider workload balancing if there are significant disparities in hours worked',
        'Provide training opportunities for team members with lower productivity scores'
      ];

      trends = [
        `Productivity varies by ${((maxHours - minHours) / avgHours * 100).toFixed(1)}% across team members`,
        'High performers tend to focus on specific categories consistently',
        'Team collaboration shows positive correlation with productivity scores'
      ];

      if (maxHours - minHours > avgHours * 0.5) {
        alerts.push('Significant workload imbalance detected among team members');
      }

      if (avgHours < 30) {
        alerts.push('Overall team productivity is below expected levels');
      }

      best = `${topPerformer.name} shows exceptional performance with ${topPerformer.totalHours} hours and ${topPerformer.productivityScore || 0}% productivity score`;
      needsImprovement = `${bottomPerformer.name} may need support with current ${bottomPerformer.totalHours} hours worked`;

      opportunities = [
        'Cross-training opportunities between high and low performers',
        'Implement mentorship programs',
        'Optimize task distribution based on individual strengths'
      ];
      break;

    case 'projects':
      summary = `Project analysis for the ${period} period covers ${comparisonData.length} projects with a total of ${totalHours.toFixed(1)} hours invested. Project completion rates average ${(comparisonData.reduce((sum: number, item: any) => sum + (item.completionRate || 0), 0) / comparisonData.length).toFixed(1)}%.`;
      
      recommendations = [
        'Prioritize projects with high completion rates and good resource utilization',
        'Review project timelines for projects with low completion rates',
        'Consider resource reallocation based on project performance'
      ];

      trends = [
        'Projects with more team members tend to have higher completion rates',
        'Resource allocation shows correlation with project success',
        'Project complexity affects average hours per day'
      ];

      const lowCompletionProjects = comparisonData.filter((item: any) => (item.completionRate || 0) < 50);
      if (lowCompletionProjects.length > 0) {
        alerts.push(`${lowCompletionProjects.length} projects have completion rates below 50%`);
      }

      best = `Top performing project: ${topPerformer.name} with ${topPerformer.completionRate}% completion rate`;
      needsImprovement = `Project ${bottomPerformer.name} needs attention with ${bottomPerformer.completionRate}% completion rate`;

      opportunities = [
        'Streamline project management processes',
        'Implement better project tracking and reporting',
        'Optimize team allocation across projects'
      ];
      break;

    case 'teams':
      summary = `Cross-team analysis for the ${period} period shows ${comparisonData.length} teams with varying productivity levels. Average team productivity is ${(comparisonData.reduce((sum: number, item: any) => sum + (item.avgProductivity || 0), 0) / comparisonData.length).toFixed(1)}%.`;
      
      recommendations = [
        'Share best practices from high-performing teams',
        'Implement cross-team collaboration initiatives',
        'Standardize productivity measurement across teams'
      ];

      trends = [
        'Team size correlates with total hours but not necessarily productivity',
        'Teams with diverse skill sets show higher productivity',
        'Project focus varies significantly across teams'
      ];

      const lowProductivityTeams = comparisonData.filter((item: any) => (item.avgProductivity || 0) < 60);
      if (lowProductivityTeams.length > 0) {
        alerts.push(`${lowProductivityTeams.length} teams have productivity below 60%`);
      }

      best = `Most productive team: ${topPerformer.name} with ${topPerformer.avgProductivity}% productivity`;
      needsImprovement = `Team ${bottomPerformer.name} requires improvement with ${bottomPerformer.avgProductivity}% productivity`;

      opportunities = [
        'Implement team performance benchmarking',
        'Create knowledge sharing platforms between teams',
        'Develop team-specific improvement plans'
      ];
      break;
  }

  return {
    summary,
    recommendations,
    trends,
    alerts,
    performance: {
      best,
      needsImprovement,
      opportunities
    }
  };
}

function generateTimesheetInsights(data: TimesheetAnalysisData): AiInsight {
  const { period, totalHours, activities, categoryBreakdown, periodDays, analysisType } = data;

  const avgHoursPerDay = totalHours / periodDays;
  const topCategory = categoryBreakdown[0];
  const uniqueCategories = categoryBreakdown.length;
  const totalActivities = activities.length;

  // Calculate productivity metrics
  const productiveHours = categoryBreakdown
    .filter(cat => !['break', 'meeting', 'admin'].includes(cat.category.toLowerCase()))
    .reduce((sum, cat) => sum + cat.hours, 0);
  
  const productivityRatio = (productiveHours / totalHours) * 100;

  const summary = `${analysisType === 'personal' ? 'Personal' : 'Team'} timesheet analysis for the ${period} period shows ${totalHours.toFixed(1)} total hours worked over ${periodDays} days, averaging ${avgHoursPerDay.toFixed(1)} hours per day. The top category is ${topCategory?.category || 'Unknown'} with ${topCategory?.hours?.toFixed(1) || 0} hours.`;

  const recommendations = [
    avgHoursPerDay > 8 ? 'Consider reducing daily work hours to maintain work-life balance' : 'You have good work-life balance with reasonable daily hours',
    productivityRatio < 70 ? 'Focus on increasing productive work time and reducing administrative tasks' : 'Good balance between productive and administrative work',
    uniqueCategories > 5 ? 'Consider consolidating work categories to improve focus and efficiency' : 'Good category organization with focused work areas'
  ];

  const trends = [
    `Average ${avgHoursPerDay.toFixed(1)} hours per day with ${productivityRatio.toFixed(1)}% productive time`,
    `Work distributed across ${uniqueCategories} different categories`,
    `Completed ${totalActivities} activities during this period`
  ];

  const alerts = [];
  if (avgHoursPerDay > 10) {
    alerts.push('Daily work hours exceed recommended limits - consider workload management');
  }
  if (productivityRatio < 60) {
    alerts.push('Low productivity ratio detected - review time allocation and task prioritization');
  }
  if (uniqueCategories > 8) {
    alerts.push('High category fragmentation may indicate scattered focus - consider consolidation');
  }

  const best = `Strong performance in ${topCategory?.category || 'primary work'} category with ${topCategory?.hours?.toFixed(1) || 0} hours and ${((topCategory?.hours || 0) / totalHours * 100).toFixed(1)}% of total time`;
  
  const needsImprovement = productivityRatio < 70 
    ? `Focus on increasing productive work time from current ${productivityRatio.toFixed(1)}% to target 70%+`
    : 'Maintain current productivity levels while optimizing time allocation';

  const opportunities = [
    'Implement time blocking techniques to improve focus and productivity',
    'Review and optimize category organization for better work tracking',
    'Set specific productivity goals for the next period'
  ];

  return {
    summary,
    recommendations,
    trends,
    alerts,
    performance: {
      best,
      needsImprovement,
      opportunities
    }
  };
} 