

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Target, Zap, Layout, TrendingUp } from 'lucide-react';

interface PlatformConfigurationProps {
  configurations: Array<{
    platform: string;
    targetingOptions: {
      demographics: string[];
      interests: string[];
      behaviors: string[];
    };
    adFormats: string[];
    placementTypes: string[];
    bidStrategy: string;
    optimizationGoal: string;
  }>;
}

export function PlatformConfiguration({ configurations }: PlatformConfigurationProps) {
  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Meta: 'bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800',
      Google: 'bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-800',
      TikTok: 'bg-gray-100 dark:bg-gray-950/30 border-gray-300 dark:border-gray-800',
      LinkedIn: 'bg-indigo-100 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800',
      Instagram: 'bg-purple-100 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800',
      YouTube: 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800',
      Twitter: 'bg-sky-100 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800',
    };
    return colors[platform] || 'bg-gray-100 dark:bg-gray-950/30 border-gray-300 dark:border-gray-800';
  };

  const getPlatformIcon = (platform: string) => {
    // In production, you'd use actual platform icons
    return platform.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="size-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-bold">Platform Configuration</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              Optimized settings for {configurations.length} platforms
            </div>
          </div>
          <div className="flex gap-2">
            {configurations.map((config) => (
              <Badge key={config.platform} variant="secondary">
                {config.platform}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {configurations.map((config) => (
          <Card key={config.platform} className={`p-4 border-2 ${getPlatformColor(config.platform)}`}>
            {/* Platform Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center font-bold text-sm">
                  {getPlatformIcon(config.platform)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{config.platform}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {config.bidStrategy}
                    </Badge>
                    <span>•</span>
                    <span>{config.optimizationGoal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Targeting Options */}
            <div className="space-y-3">
              {/* Demographics */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                  <Users className="size-3" />
                  Demographics
                </div>
                <div className="flex flex-wrap gap-1">
                  {config.targetingOptions.demographics.map((demo) => (
                    <Badge key={demo} variant="secondary" className="text-xs">
                      {demo}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                  <Target className="size-3" />
                  Interests
                </div>
                <div className="flex flex-wrap gap-1">
                  {config.targetingOptions.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Behaviors */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                  <Zap className="size-3" />
                  Behaviors
                </div>
                <div className="flex flex-wrap gap-1">
                  {config.targetingOptions.behaviors.map((behavior) => (
                    <Badge key={behavior} variant="secondary" className="text-xs">
                      {behavior}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Ad Formats & Placements */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                    <Layout className="size-3" />
                    Ad Formats
                  </div>
                  <div className="space-y-1">
                    {config.adFormats.map((format) => (
                      <div key={format} className="text-xs text-muted-foreground">
                        • {format}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                    <TrendingUp className="size-3" />
                    Placements
                  </div>
                  <div className="space-y-1">
                    {config.placementTypes.map((placement) => (
                      <div key={placement} className="text-xs text-muted-foreground">
                        • {placement}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}