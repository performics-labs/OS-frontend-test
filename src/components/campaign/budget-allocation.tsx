import { useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, Users, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface BudgetAllocationProps {
  platformAllocations: Array<{
    name: string;      // For pie chart
    platform: string;
    value: number;     // Renamed from 'percentage' for chart compatibility
    budget: number;
    dailyBudget: number;
    fill: string;      // Chart color from backend
  }>;
  phaseAllocations: Array<{
    phase: string;
    budget: number;
    days: number;
  }>;
  reserveBudget: number;
}

export const BudgetAllocation = memo(function BudgetAllocation({
  platformAllocations,
  phaseAllocations,
  reserveBudget
}: BudgetAllocationProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Simple calculation for display (acceptable frontend logic)
  const totalBudget = platformAllocations.reduce((sum, p) => sum + p.budget, 0) + reserveBudget;

  // Backend sends chart-ready data with colors, no transformation needed

  // Static chart configs (UI presentation logic)
  const pieChartConfig: ChartConfig = useMemo(() => ({
    value: { label: "Percentage" }
  }), []);

  const phaseChartConfig: ChartConfig = useMemo(() => ({
    budget: {
      label: "Budget",
      color: "hsl(var(--chart-1))",
    },
  }), []);


  return (
    <div className="w-full space-y-3">
      {/* Compact Header */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold">Budget Allocation</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-medium">{formatCurrency(totalBudget)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reserve: </span>
              <span className="font-medium text-amber-600">{formatCurrency(reserveBudget)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Single Column Layout for Better Mobile Experience */}
      <div className="space-y-4">
        {/* Platform Distribution */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="size-4 text-blue-600" />
            <h4 className="font-medium">Platform Distribution</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart */}
            <div className="h-[180px]">
              <ChartContainer config={pieChartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformAllocations}
                      cx="50%"
                      cy="50%"
                      innerRadius="35%"
                      outerRadius="70%"
                      dataKey="value"
                      nameKey="name"
                      isAnimationActive={false}
                    >
                      {platformAllocations.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number, _name: string, props: any) => [
                        `${value}%`,
                        formatFullCurrency(props.payload.budget)
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Platform List */}
            <div className="space-y-2">
              {platformAllocations.map((platform) => (
                <div key={platform.platform} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: platform.fill }}
                    />
                    <span className="text-sm font-medium">{platform.platform}</span>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-medium">{platform.value}%</div>
                    <div className="text-muted-foreground">{formatCurrency(platform.budget)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Phase Allocation */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="size-4 text-purple-600" />
            <h4 className="font-medium">Campaign Phases</h4>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Chart - Takes up more space */}
            <div className="flex-1 lg:flex-[2] h-[240px] min-w-0">
              <ChartContainer config={phaseChartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={phaseAllocations}
                    margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="phase" 
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={35}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={formatCurrency}
                      width={35}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => formatFullCurrency(value)}
                    />
                    <Bar
                      dataKey="budget"
                      fill="var(--color-budget)"
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Phase Details */}
            <div className="flex-1 min-w-0 space-y-2">
              {phaseAllocations.map((phase) => (
                <div key={phase.phase} className="p-2 rounded bg-muted/50">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium">{phase.phase}</span>
                    <span className="text-xs font-medium">{formatCurrency(phase.budget)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {phase.days} days • {formatCurrency(phase.budget / phase.days)}/day
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-chart-1 h-1 rounded-full"
                      style={{ width: `${(phase.budget / totalBudget) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              
              {/* Reserve Budget */}
              <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Reserve</span>
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    {formatCurrency(reserveBudget)}
                  </span>
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-500">
                  Optimization buffer
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});