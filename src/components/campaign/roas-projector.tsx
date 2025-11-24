

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface RoasProjectorProps {
  projections: Array<{
    platform: string;
    expectedROAS: number;
    minROAS: number;
    maxROAS: number;
    expectedRevenue: number;
    expectedConversions: number;
    conversionRate: number;
    avgOrderValue: number;
  }>;
  weeklyProjections: Array<{
    week: number;
    spend: number;
    revenue: number;
    roas: number;
  }>;
  confidenceScore: number;
}

export function RoasProjector({ 
  projections,
  weeklyProjections,
  confidenceScore
}: RoasProjectorProps) {
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

  const totalRevenue = projections.reduce((sum, p) => sum + p.expectedRevenue, 0);
  const totalSpend = weeklyProjections.reduce((sum, w) => sum + w.spend, 0);
  const overallROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0';

  const weeklyChartConfig = {
    spend: {
      label: "Spend",
      color: "hsl(var(--destructive))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    roas: {
      label: "ROAS",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-2xl font-bold">ROAS Projections</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              Expected return on ad spend across platforms
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Overall ROAS</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {overallROAS}x
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {confidenceScore.toFixed(0)}% confidence
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Trend */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-4 text-blue-600" />
          <span className="text-sm font-medium">Weekly Performance Trend</span>
        </div>

        <div className="h-[300px]">
          <ChartContainer config={weeklyChartConfig} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyProjections}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="week" 
                className="text-xs"
                tickFormatter={(value) => `Week ${value}`}
              />
              <YAxis 
                yAxisId="left" 
                className="text-xs"
                tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                className="text-xs"
                tickFormatter={(value) => `${value}x`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: any, name: string) => {
                  if (name === 'roas') return `${value.toFixed(2)}x`;
                  return formatCurrency(value as number);
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="spend"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="roas"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="5 5"
                isAnimationActive={false}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        </div>
      </Card>

      {/* Platform Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {projections.map((projection) => (
          <Card key={projection.platform} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{projection.platform}</h3>
              <Badge variant="default" className="text-xs">
                {projection.expectedROAS.toFixed(2)}x ROAS
              </Badge>
            </div>

            {/* ROAS Range Indicator */}
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: {projection.minROAS.toFixed(2)}x</span>
                <span>Expected</span>
                <span>Max: {projection.maxROAS.toFixed(2)}x</span>
              </div>
              <div className="relative h-2 bg-gray-200 dark:bg-gray-800 rounded-full">
                <div 
                  className="absolute h-2 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full"
                  style={{
                    left: `${(projection.minROAS / projection.maxROAS) * 100}%`,
                    width: `${((projection.maxROAS - projection.minROAS) / projection.maxROAS) * 100}%`
                  }}
                />
                <div 
                  className="absolute size-3 bg-blue-600 rounded-full -top-0.5"
                  style={{
                    left: `${(projection.expectedROAS / projection.maxROAS) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="size-3" />
                  Revenue
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(projection.expectedRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Target className="size-3" />
                  Conversions
                </span>
                <span className="text-sm font-medium">
                  {formatNumber(projection.expectedConversions)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">
                  Conversion Rate
                </span>
                <span className="text-sm font-medium">
                  {projection.conversionRate.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">
                  Avg Order Value
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(projection.avgOrderValue)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Confidence Indicator */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium mb-1">Projection Confidence</div>
            <p className="text-xs text-muted-foreground">
              Based on historical data and market trends
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">{confidenceScore.toFixed(0)}%</div>
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}