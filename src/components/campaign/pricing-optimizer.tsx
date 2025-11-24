import { useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Target, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface PricingOptimizerProps {
  pricingStrategy: {
    avgCPM: number;
    avgCPC: number;
    avgCPA: number;
    bidMultipliers: {
      time: Array<{ hour: number; multiplier: number }>;
      device: Array<{ device: string; multiplier: number }>;
      geography: Array<{ location: string; multiplier: number }>;
    };
    recommendedBudgetPacing: string;
  };
  platformPricing: Array<{
    platform: string;
    cpm: number;
    cpc: number;
    cpa: number;
    competitiveness: string;
  }>;
}

export const PricingOptimizer = memo(function PricingOptimizer({
  pricingStrategy,
  platformPricing
}: PricingOptimizerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const timeChartConfig = useMemo(() => ({
    multiplier: {
      label: "Bid Multiplier",
      color: "hsl(var(--chart-1))",
    },
  }), []);

  const getCompetitivenessColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="size-5 text-orange-600 dark:text-orange-400" />
              <h2 className="text-2xl font-bold">Pricing Strategy</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              Optimized bidding and pricing recommendations
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {pricingStrategy.recommendedBudgetPacing}
          </Badge>
        </div>
        
        {/* Average Metrics */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Avg CPM</div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(pricingStrategy.avgCPM)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Avg CPC</div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(pricingStrategy.avgCPC)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Avg CPA</div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(pricingStrategy.avgCPA)}
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {/* Time-based Bid Multipliers */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="size-4 text-blue-600" />
            <span className="text-sm font-medium">Hourly Bid Adjustments</span>
          </div>

          <div className="h-[280px]">
            <ChartContainer config={timeChartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={pricingStrategy.bidMultipliers.time}
                  margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="hour" 
                  className="text-xs"
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis 
                  className="text-xs"
                  tickFormatter={(value) => `${value}x`}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => `${value}x multiplier`}
                  labelFormatter={(value) => `${value}:00`}
                />
                <Line
                  type="monotone"
                  dataKey="multiplier"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          </div>
        </Card>

        {/* Device & Geography Multipliers */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="size-4 text-purple-600" />
            <span className="text-sm font-medium">Targeting Adjustments</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device Multipliers */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Device</div>
              <div className="space-y-1">
                {pricingStrategy.bidMultipliers.device.map((item) => (
                  <div key={item.device} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                    <span className="text-sm">{item.device}</span>
                    <Badge variant="secondary">{item.multiplier}x</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Geography Multipliers */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Geography</div>
              <div className="space-y-1">
                {pricingStrategy.bidMultipliers.geography.map((item) => (
                  <div key={item.location} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                    <span className="text-sm">{item.location}</span>
                    <Badge variant="secondary">{item.multiplier}x</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Platform Pricing Comparison */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-4 text-green-600" />
          <span className="text-sm font-medium">Platform Pricing Comparison</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-xs font-medium text-muted-foreground p-2">Platform</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-2">CPM</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-2">CPC</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-2">CPA</th>
                <th className="text-center text-xs font-medium text-muted-foreground p-2">Competition</th>
              </tr>
            </thead>
            <tbody>
              {platformPricing.map((platform) => (
                <tr key={platform.platform} className="border-b">
                  <td className="p-2 font-medium">{platform.platform}</td>
                  <td className="text-right p-2 text-sm">{formatCurrency(platform.cpm)}</td>
                  <td className="text-right p-2 text-sm">{formatCurrency(platform.cpc)}</td>
                  <td className="text-right p-2 text-sm">{formatCurrency(platform.cpa)}</td>
                  <td className="text-center p-2">
                    <span className={`text-sm font-medium ${getCompetitivenessColor(platform.competitiveness)}`}>
                      {platform.competitiveness}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
});