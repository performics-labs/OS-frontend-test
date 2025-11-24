

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, CheckCircle, AlertCircle, BarChart, FileSpreadsheet, FileJson, Share2 } from 'lucide-react';

interface ExportGeneratorProps {
  campaignSummary: {
    campaignName: string;
    totalBudget: number;
    duration: number;
    platforms: string[];
    expectedROAS: number;
    expectedReach: number;
  };
  formats: Array<{
    type: string;
    name: string;
    size: string;
    ready: boolean;
  }>;
  shareableLinks: {
    presentationUrl?: string;
    dataStudioUrl?: string;
    collaborationUrl?: string;
  };
  completionStatus: {
    dataCompiled: boolean;
    visualsGenerated: boolean;
    documentsReady: boolean;
    sharingEnabled: boolean;
  };
}

export function ExportGenerator({ campaignSummary, formats, shareableLinks, completionStatus }: ExportGeneratorProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getFormatIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="size-4" />;
      case 'excel': return <FileSpreadsheet className="size-4" />;
      case 'csv': return <FileSpreadsheet className="size-4" />;
      case 'json': return <FileJson className="size-4" />;
      case 'powerpoint': return <BarChart className="size-4" />;
      default: return <FileText className="size-4" />;
    }
  };

  const completionItems = [
    { key: 'dataCompiled', label: 'Data Compilation', status: completionStatus.dataCompiled },
    { key: 'visualsGenerated', label: 'Visual Generation', status: completionStatus.visualsGenerated },
    { key: 'documentsReady', label: 'Document Preparation', status: completionStatus.documentsReady },
    { key: 'sharingEnabled', label: 'Sharing Setup', status: completionStatus.sharingEnabled },
  ];

  const completedCount = completionItems.filter(item => item.status).length;
  const completionPercentage = (completedCount / completionItems.length) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border-slate-200 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="size-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-2xl font-bold">Campaign Export</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              Campaign strategy ready for export and sharing
            </div>
          </div>
          <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
            {completionPercentage}% Complete
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {completionItems.map((item) => (
              <div key={item.key} className="flex items-center gap-1">
                {item.status ? (
                  <CheckCircle className="size-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="size-4 text-gray-400" />
                )}
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Campaign Summary */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="size-4 text-blue-600" />
          <span className="text-sm font-medium">Campaign Summary</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Campaign</div>
            <div className="text-sm font-medium">{campaignSummary.campaignName}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Budget</div>
            <div className="text-sm font-bold text-green-600 dark:text-green-400">
              {formatCurrency(campaignSummary.totalBudget)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Duration</div>
            <div className="text-sm font-medium">{campaignSummary.duration} days</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Platforms</div>
            <div className="text-sm font-medium">{campaignSummary.platforms.length} active</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Expected ROAS</div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {campaignSummary.expectedROAS}x
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Reach</div>
            <div className="text-sm font-medium">{formatNumber(campaignSummary.expectedReach)}</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Export Formats */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Download className="size-4 text-purple-600" />
              <span className="text-sm font-medium">Export Formats</span>
            </div>
            <Button size="sm" variant="outline">
              Download All
            </Button>
          </div>
          
          <div className="space-y-2">
            {formats.map((format) => (
              <div key={format.type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFormatIcon(format.type)}
                  <div>
                    <div className="text-sm font-medium">{format.name}</div>
                    <div className="text-xs text-muted-foreground">{format.size}</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={format.ready ? "default" : "secondary"}
                  disabled={!format.ready}
                >
                  {format.ready ? (
                    <>
                      <Download className="size-3 mr-1" />
                      Download
                    </>
                  ) : (
                    'Preparing...'
                  )}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Shareable Links */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="size-4 text-indigo-600" />
            <span className="text-sm font-medium">Sharing Options</span>
          </div>
          
          <div className="space-y-3">
            {shareableLinks.presentationUrl && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Presentation View</span>
                  <Badge variant="outline" className="text-xs">Live</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Interactive presentation for stakeholders
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Share2 className="size-3 mr-1" />
                  Copy Link
                </Button>
              </div>
            )}

            {shareableLinks.dataStudioUrl && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Analytics Dashboard</span>
                  <Badge variant="outline" className="text-xs">Interactive</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Real-time campaign performance tracking
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <BarChart className="size-3 mr-1" />
                  Open Dashboard
                </Button>
              </div>
            )}

            {shareableLinks.collaborationUrl && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Team Collaboration</span>
                  <Badge variant="outline" className="text-xs">Workspace</Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Invite team members to review and edit
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Share2 className="size-3 mr-1" />
                  Invite Team
                </Button>
              </div>
            )}
          </div>

          {/* Platform List */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground mb-2">Campaign Platforms</div>
            <div className="flex flex-wrap gap-1">
              {campaignSummary.platforms.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}