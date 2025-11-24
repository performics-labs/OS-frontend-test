

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Image as ImageIcon, Video, FileText, Sparkles, Layers } from 'lucide-react';

interface CreativeDesignerProps {
  creativeAssets: Array<{
    format: string;
    dimensions: string;
    platform: string;
    theme: string;
    keyElements: string[];
    copyVariants: string[];
    estimatedCTR: number;
  }>;
  brandGuidelines: {
    primaryColors: string[];
    fonts: string[];
    tone: string;
    visualStyle: string;
  };
}

export function CreativeDesigner({ 
  creativeAssets,
  brandGuidelines
}: CreativeDesignerProps) {
  const getFormatIcon = (format: string) => {
    if (!format) return <FileText className="size-4" />;
    const lowerFormat = format.toLowerCase();
    if (lowerFormat.includes('video')) return <Video className="size-4" />;
    if (lowerFormat.includes('image')) return <ImageIcon className="size-4" />;
    if (lowerFormat.includes('carousel')) return <Layers className="size-4" />;
    return <FileText className="size-4" />;
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Meta: 'border-blue-300 dark:border-blue-700',
      Google: 'border-green-300 dark:border-green-700',
      TikTok: 'border-gray-300 dark:border-gray-700',
      LinkedIn: 'border-indigo-300 dark:border-indigo-700',
      Instagram: 'border-purple-300 dark:border-purple-700',
      YouTube: 'border-red-300 dark:border-red-700',
    };
    return colors[platform] || 'border-gray-300 dark:border-gray-700';
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="size-5 text-pink-600 dark:text-pink-400" />
              <h2 className="text-2xl font-bold">Creative Strategy</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              Optimized creative assets for {creativeAssets.length} ad formats
            </div>
          </div>
        </div>
      </Card>

      {/* Brand Guidelines */}
      <Card className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="size-4 text-indigo-600" />
          <span className="text-sm font-medium">Brand Guidelines</span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Colors */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Primary Colors</div>
            <div className="flex gap-1">
              {brandGuidelines.primaryColors.map((color) => (
                <div 
                  key={color} 
                  className="size-8 rounded border-2 border-white dark:border-gray-800"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Fonts</div>
            <div className="text-sm">
              {brandGuidelines.fonts.join(', ')}
            </div>
          </div>

          {/* Tone */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Tone</div>
            <Badge variant="secondary">{brandGuidelines.tone}</Badge>
          </div>

          {/* Visual Style */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Visual Style</div>
            <Badge variant="secondary">{brandGuidelines.visualStyle}</Badge>
          </div>
        </div>
      </Card>

      {/* Creative Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creativeAssets.map((asset) => (
          <Card key={`${asset.platform}-${asset.format}`} className={`p-4 border-2 ${getPlatformColor(asset.platform)}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getFormatIcon(asset.format)}
                <div>
                  <div className="font-medium text-sm">{asset.format}</div>
                  <div className="text-xs text-muted-foreground">{asset.dimensions}</div>
                </div>
              </div>
              <Badge variant="outline">{asset.platform}</Badge>
            </div>

            {/* Theme */}
            <div className="mb-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">Theme</div>
              <div className="text-sm">{asset.theme}</div>
            </div>

            {/* Key Elements */}
            <div className="mb-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">Key Elements</div>
              <div className="flex flex-wrap gap-1">
                {asset.keyElements.map((element) => (
                  <Badge key={element} variant="secondary" className="text-xs">
                    {element}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Copy Variants */}
            <div className="mb-3">
              <div className="text-xs font-medium text-muted-foreground mb-1">Copy Variants</div>
              <div className="space-y-1">
                {asset.copyVariants.slice(0, 2).map((copy) => (
                  <div key={copy} className="text-xs text-muted-foreground italic">
                    &ldquo;{copy}&rdquo;
                  </div>
                ))}
                {asset.copyVariants.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{asset.copyVariants.length - 2} more variants
                  </div>
                )}
              </div>
            </div>

            {/* Estimated CTR */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Estimated CTR</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {asset.estimatedCTR.toFixed(2)}%
                  </span>
                  <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                      style={{ width: `${Math.min(asset.estimatedCTR * 10, 100)}%` }}
                    />
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