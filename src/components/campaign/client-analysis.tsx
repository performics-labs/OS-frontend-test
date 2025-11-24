import { useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Building2, Target, Award, AlertCircle } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ClientAnalysisProps {
  clientProfile: {
    id: string;
    name: string;
    industry: string;
    historicalPerformance: {
      totalCampaigns: number;
      avgBudget: number;
      avgROAS: number;
      topPerformingPlatforms: string[];
      bestObjectives: string[];
    };
  };
  industryBenchmarks: {
    avgBudget: number;
    avgCampaignDuration: number;
    topPlatforms: Array<{
      platform: string;
      marketShare: number;
    }>;
    seasonalTrends: Array<{
      month: string;
      performanceIndex: number;
    }>;
  };
  competitiveInsights: {
    competitorSpend: number;
    competitorPlatforms: string[];
    marketGaps: string[];
    opportunities: string[];
  };
  recommendations: {
    suggestedBudgetRange: {
      min: number;
      optimal: number;
      max: number;
    };
    suggestedDuration: number;
    suggestedPlatforms: string[];
  };
  objective?: string;
}

export const ClientAnalysis = memo(function ClientAnalysis({
  clientProfile,
  industryBenchmarks,
  competitiveInsights,
  objective
}: ClientAnalysisProps) {
  // Memoize chart config to prevent recharts re-render loops (Vercel best practice)
  const chartConfig = useMemo(() => ({
    performanceIndex: {
      label: "Performance Index",
      color: "hsl(var(--chart-1))",
    },
  }), []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="size-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold">{clientProfile.name}</h2>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{clientProfile.industry}</Badge>
              {objective && <Badge variant="outline">{objective} Campaign</Badge>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Average ROAS</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {clientProfile.historicalPerformance.avgROAS}x
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics - Single Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 min-h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <Target className="size-4 text-blue-600" />
            <span className="text-sm font-medium">Historical Campaigns</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(clientProfile.historicalPerformance.totalCampaigns)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg Budget: {formatCurrency(clientProfile.historicalPerformance.avgBudget)}
          </div>
        </Card>

        <Card className="p-4 flex flex-col min-h-[100px]">
          <div className="flex items-center gap-2 mb-2">
            <Award className="size-4 text-purple-600" />
            <span className="text-sm font-medium">Top Platforms</span>
          </div>
          <div className="flex-1 flex items-center">
            <div className="flex gap-1 flex-wrap">
              {clientProfile.historicalPerformance.topPerformingPlatforms.map((platform) => (
                <Badge key={platform} variant="default" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Historical Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col min-h-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-blue-600" />
            <span className="text-sm font-medium">Historical Analysis</span>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Past Campaign Performance</div>
              <div className="text-xl font-bold">{clientProfile.historicalPerformance.totalCampaigns} Campaigns</div>
              <div className="text-xs text-muted-foreground">Avg ROAS: {clientProfile.historicalPerformance.avgROAS.toFixed(1)}x</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Top Performing Platforms</div>
              <div className="flex gap-1 flex-wrap">
                {clientProfile.historicalPerformance.topPerformingPlatforms.map((platform) => (
                  <Badge key={platform} variant="outline" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-green-600" />
            <span className="text-sm font-medium">Monthly Performance</span>
          </div>
          <div className="h-[160px]">
            <ChartContainer
              config={chartConfig}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={industryBenchmarks.seasonalTrends}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <defs>
                    <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                    domain={[0, 100]}
                    width={30}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: any) => `${value}%`}
                  />
                  <Area
                    type="monotone"
                    dataKey="performanceIndex"
                    stroke="hsl(var(--chart-1))"
                    fill="url(#performanceGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>
      </div>

      {/* Opportunities & Gaps */}
      {(competitiveInsights.opportunities.length > 0 || competitiveInsights.marketGaps.length > 0) && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="size-4 text-orange-600" />
            <span className="text-sm font-medium">Strategic Insights</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitiveInsights.opportunities.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2 text-green-600 dark:text-green-400">Opportunities</div>
                <ul className="space-y-1">
                  {competitiveInsights.opportunities.slice(0, 3).map((opp) => (
                    <li key={opp} className="text-sm text-muted-foreground">• {opp}</li>
                  ))}
                </ul>
              </div>
            )}
            {competitiveInsights.marketGaps.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2 text-orange-600 dark:text-orange-400">Market Gaps</div>
                <ul className="space-y-1">
                  {competitiveInsights.marketGaps.slice(0, 3).map((gap) => (
                    <li key={gap} className="text-sm text-muted-foreground">• {gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

    </div>
  );
});