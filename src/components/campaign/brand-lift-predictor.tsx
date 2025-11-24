import { useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Eye, Heart, MessageCircle, Star } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface BrandLiftPredictorProps {
  brandLiftMetrics: Array<{
    metric: string;
    value: number;
  }>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    topics: Array<{ topic: string; score: number }>;
  };
  projectedTimeline: Array<{
    week: number;
    awareness: number;
    consideration: number;
    intent: number;
  }>;
}

// Memoize component to prevent unnecessary re-renders
export const BrandLiftPredictor = memo(function BrandLiftPredictor({
  brandLiftMetrics,
  sentimentAnalysis,
  projectedTimeline
}: BrandLiftPredictorProps) {
  // Backend sends chart-ready radar data as array, no transformation needed

  // Memoize chart config to prevent unnecessary re-renders
  const timelineChartConfig = useMemo(() => ({
    awareness: {
      label: "Awareness",
      color: "hsl(var(--chart-1))",
    },
    consideration: {
      label: "Consideration",
      color: "hsl(var(--chart-2))",
    },
    intent: {
      label: "Intent",
      color: "hsl(var(--chart-3))",
    },
  }), []); // Static config, no dependencies

  const getSentimentColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-500';
      case 'neutral': return 'bg-gray-400';
      case 'negative': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric.toLowerCase()) {
      case 'awareness': return <Eye className="size-4" />;
      case 'consideration': return <Users className="size-4" />;
      case 'preference': return <Heart className="size-4" />;
      case 'purchase intent': return <TrendingUp className="size-4" />;
      case 'brand recall': return <Star className="size-4" />;
      case 'ad recall': return <MessageCircle className="size-4" />;
      default: return <TrendingUp className="size-4" />;
    }
  };


  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200 dark:border-cyan-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-2xl font-bold">Brand Lift Prediction</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              Expected impact on brand metrics and sentiment
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Overall Lift</div>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              +{Math.round(brandLiftMetrics.reduce((sum, m) => sum + m.value, 0) / brandLiftMetrics.length)}%
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Brand Lift Radar Chart */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="size-4 text-blue-600" />
            <span className="text-sm font-medium">Brand Lift Metrics</span>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={brandLiftMetrics} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid strokeDasharray="3 3" className="stroke-muted" />
              <PolarAngleAxis dataKey="metric" className="text-xs" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 25]}
                tick={{ fontSize: 9 }}
                tickCount={5}
              />
              <Radar
                name="Lift %"
                dataKey="value"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.3}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Tooltip formatter={(value: any) => [`${value}%`, 'Lift']} />
            </RadarChart>
          </ResponsiveContainer>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {brandLiftMetrics.map((item) => (
              <div key={item.metric} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                {getMetricIcon(item.metric)}
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">{item.metric}</div>
                  <div className="text-sm font-bold">+{item.value}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sentiment Analysis */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="size-4 text-pink-600" />
            <span className="text-sm font-medium">Sentiment Analysis</span>
          </div>
          
          {/* Sentiment Bar */}
          <div className="mb-4">
            <div className="flex h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
              <div 
                className={`${getSentimentColor('positive')} transition-all`}
                style={{ width: `${sentimentAnalysis.positive}%` }}
              />
              <div 
                className={`${getSentimentColor('neutral')} transition-all`}
                style={{ width: `${sentimentAnalysis.neutral}%` }}
              />
              <div 
                className={`${getSentimentColor('negative')} transition-all`}
                style={{ width: `${sentimentAnalysis.negative}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-green-600 dark:text-green-400">
                Positive {sentimentAnalysis.positive}%
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Neutral {sentimentAnalysis.neutral}%
              </span>
              <span className="text-red-600 dark:text-red-400">
                Negative {sentimentAnalysis.negative}%
              </span>
            </div>
          </div>

          {/* Topic Scores */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Key Topics</div>
            <div className="space-y-2">
              {sentimentAnalysis.topics.map((topic) => (
                <div key={topic.topic}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{topic.topic}</span>
                    <span className="text-sm font-medium">{topic.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all"
                      style={{ width: `${topic.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline Projection */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-4 text-green-600" />
          <span className="text-sm font-medium">Projected Brand Lift Timeline</span>
        </div>

        <div className="h-[250px]">
          <ChartContainer config={timelineChartConfig} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectedTimeline}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="week" 
                className="text-xs"
                tickFormatter={(value) => `Week ${value}`}
              />
              <YAxis 
                className="text-xs"
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: any) => `${value}%`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="awareness"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="consideration"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="intent"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        </div>
      </Card>
    </div>
  );
});