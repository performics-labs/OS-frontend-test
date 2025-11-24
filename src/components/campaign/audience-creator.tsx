import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Globe, Filter, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, } from 'recharts';

interface AudienceCreatorProps {
  segments: Array<{
    name: string;
    value: number;  // Renamed from 'size' for chart compatibility
    reach: number;  // Renamed from 'estimatedReach' for chart compatibility
    characteristics: {
      ageRange: string;
      gender: string;
      interests: string[];
      income: string;
      location: string[];
    };
    platforms: string[];
    engagementScore: number;
  }>;
  totalReach: number;
  overlapAnalysis: {
    hasOverlap: boolean;
    overlapPercentage: number;
    recommendation: string;
  };
}

export const AudienceCreator = memo(function AudienceCreator({
  segments = [],
  totalReach = 0,
  overlapAnalysis = {
    hasOverlap: false,
    overlapPercentage: 0,
    recommendation: ''
  }
}: AudienceCreatorProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Backend sends chart-ready data, no transformation needed

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="size-5 text-violet-600 dark:text-violet-400" />
              <h2 className="text-2xl font-bold">Audience Segments</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              {segments.length} targeted segments created
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Reach</div>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {formatNumber(totalReach)}
            </div>
          </div>
        </div>

        {/* Overlap Analysis Alert */}
        {overlapAnalysis.hasOverlap && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Activity className="size-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {overlapAnalysis.overlapPercentage}% Audience Overlap Detected
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  {overlapAnalysis.recommendation}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Segment Distribution */}
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="size-4 text-blue-600" />
            <span className="text-sm font-medium">Segment Distribution</span>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={segments}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {segments.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatNumber(value as number)} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 mt-4">
            {segments.map((segment, index) => (
              <div key={segment.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{segment.name}</span>
                </div>
                <span className="font-medium">{formatNumber(segment.reach)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Segment Details */}
        <div className="lg:col-span-2 space-y-4">
          {segments.map((segment) => (
            <Card key={segment.name} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="size-4" />
                    {segment.name}
                  </h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    Size: {formatNumber(segment.value)} • Reach: {formatNumber(segment.reach)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Engagement</div>
                  <div className={`text-lg font-bold ${getEngagementColor(segment.engagementScore)}`}>
                    {segment.engagementScore}%
                  </div>
                </div>
              </div>

              {/* Characteristics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Age</div>
                  <Badge variant="secondary" className="text-xs">{segment.characteristics.ageRange}</Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Gender</div>
                  <Badge variant="secondary" className="text-xs">{segment.characteristics.gender}</Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Income</div>
                  <Badge variant="secondary" className="text-xs">{segment.characteristics.income}</Badge>
                </div>
              </div>

              {/* Interests */}
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-1">Interests</div>
                <div className="flex flex-wrap gap-1">
                  {segment.characteristics.interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location & Platforms */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Globe className="size-3" />
                    Locations
                  </div>
                  <div className="text-xs space-y-0.5">
                    {segment.characteristics.location.map((loc) => (
                      <div key={loc}>{loc}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Filter className="size-3" />
                    Active Platforms
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {segment.platforms.map((platform) => (
                      <Badge key={platform} variant="default" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
});