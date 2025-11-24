export type ArtifactKind = 'code' | 'text' | 'image' | 'spreadsheet';

export type ArtifactResponse = {
    kind: ArtifactKind;
    title: string;
    content: string;
    language?: string;
    description?: string;
};

export const MOCK_ARTIFACT_RESPONSES: Record<string, ArtifactResponse> = {
    'button-component': {
        kind: 'code',
        language: 'tsx',
        title: 'Button Component',
        description: 'A reusable button component with variant support',
        content: `import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = {
    primary: 'bg-disrupt-500 hover:bg-disrupt-600 text-white focus:ring-disrupt-500',
    secondary: 'bg-light-grey-500 hover:bg-light-grey-600 text-warm-black-500 focus:ring-light-grey-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
  };
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={\`\${baseStyles} \${variantStyles[variant]} \${sizeStyles[size]} \${className}\`}
      {...props}
    />
  );
}`,
    },

    'data-table': {
        kind: 'code',
        language: 'tsx',
        title: 'DataTable Component',
        description: 'Generic data table with sorting and filtering',
        content: `import { useState } from 'react';

type Column<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const direction = sortDirection === 'asc' ? 1 : -1;
    return aVal > bVal ? direction : -direction;
  });

  return (
    <table className="min-w-full divide-y divide-light-grey-500">
      <thead className="bg-light-grey-100">
        <tr>
          {columns.map((col) => (
            <th
              key={String(col.key)}
              onClick={() => col.sortable && setSortKey(col.key)}
              className="px-6 py-3 text-left text-xs font-medium text-warm-black-500 uppercase cursor-pointer hover:bg-light-grey-200"
              role={col.sortable ? 'button' : undefined}
              tabIndex={col.sortable ? 0 : undefined}
              aria-label={col.sortable ? \`Sort by \${col.header}\` : undefined}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-light-grey-300">
        {sortedData.map((row, idx) => (
          <tr key={idx} className="hover:bg-light-grey-50">
            {columns.map((col) => (
              <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-warm-black-500">
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}`,
    },

    'markdown-doc': {
        kind: 'text',
        title: 'Component Documentation',
        description: 'Markdown documentation for React components',
        content: `# React Component Guide

## Overview

This guide covers best practices for building React components in our application.

## Component Structure

\`\`\`tsx
// ComponentName.tsx
import { ComponentProps } from './types';

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return <div>Component JSX</div>;
}
\`\`\`

## Best Practices

### 1. Type Safety
- Always define TypeScript interfaces for props
- Use \`React.FC\` or explicit return types
- Avoid \`any\` types

### 2. File Organization
\`\`\`
components/
├── ComponentName/
│   ├── ComponentName.tsx
│   ├── ComponentName.test.tsx
│   ├── types.ts
│   └── index.ts
\`\`\`

### 3. Performance
- Use \`memo\` for expensive renders
- Implement proper key props for lists
- Lazy load heavy components

### 4. Accessibility
- Include ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## Example Component

\`\`\`tsx
import { memo } from 'react';

interface CardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export const Card = memo(function Card({
  title,
  description,
  onClick
}: CardProps) {
  return (
    <div
      className="card"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
});
\`\`\`

## Testing

Always include unit tests:

\`\`\`tsx
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders title and description', () => {
    render(<Card title="Test" description="Description" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
\`\`\`
`,
    },

    'api-hook': {
        kind: 'code',
        language: 'tsx',
        title: 'useAPI Hook',
        description: 'Custom React hook for API calls with loading and error states',
        content: `import { useState, useEffect } from 'react';

interface UseApiOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  enabled?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useApi<T>({
  url,
  method = 'GET',
  body,
  enabled = true
}: UseApiOptions<T>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [shouldFetch, setShouldFetch] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, method, body, enabled, shouldFetch]);

  const refetch = () => setShouldFetch(prev => prev + 1);

  return { data, loading, error, refetch };
}

// Usage example:
// const { data, loading, error } = useApi<User>({ url: '/api/user' });
`,
    },

    'python-analysis': {
        kind: 'code',
        language: 'python',
        title: 'Data Analysis Script',
        description: 'Python script for analyzing and visualizing data',
        content: `import pandas as pd
import matplotlib.pyplot as plt

def analyze_sales_data(file_path):
    """
    Analyze sales data and generate visualizations

    Args:
        file_path: Path to CSV file containing sales data
    """
    df = pd.read_csv(file_path)

    # Calculate summary statistics
    total_sales = df['revenue'].sum()
    avg_sales = df['revenue'].mean()
    top_products = df.groupby('product')['revenue'].sum().sort_values(ascending=False).head(5)

    print(f"Total Sales: $\{total_sales:,.2f}")
    print(f"Average Sales: $\{avg_sales:,.2f}")
    print("\\nTop 5 Products:")
    print(top_products)

    # Create visualization
    plt.figure(figsize=(10, 6))
    top_products.plot(kind='bar', color='#00D68F')
    plt.title('Top 5 Products by Revenue')
    plt.xlabel('Product')
    plt.ylabel('Revenue ($)')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

    return df

# Example usage
if __name__ == "__main__":
    data = analyze_sales_data('sales_data.csv')
`,
    },

    'simple-chart-svg': {
        kind: 'image',
        title: 'Bar Chart Visualization',
        description: 'SVG bar chart showing sample data',
        content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect fill="#f5f5f5" width="400" height="300"/>
  <text x="200" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">Monthly Sales</text>

  <!-- Bars -->
  <rect x="50" y="220" width="40" height="30" fill="#00D68F"/>
  <rect x="120" y="180" width="40" height="70" fill="#00D68F"/>
  <rect x="190" y="140" width="40" height="110" fill="#00D68F"/>
  <rect x="260" y="160" width="40" height="90" fill="#00D68F"/>
  <rect x="330" y="120" width="40" height="130" fill="#00D68F"/>

  <!-- Labels -->
  <text x="70" y="270" text-anchor="middle" font-size="12" fill="#666">Jan</text>
  <text x="140" y="270" text-anchor="middle" font-size="12" fill="#666">Feb</text>
  <text x="210" y="270" text-anchor="middle" font-size="12" fill="#666">Mar</text>
  <text x="280" y="270" text-anchor="middle" font-size="12" fill="#666">Apr</text>
  <text x="350" y="270" text-anchor="middle" font-size="12" fill="#666">May</text>
</svg>`,
    },

    'sample-image-base64': {
        kind: 'image',
        title: 'Generated Landscape',
        description: 'AI-generated image',
        content: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <!-- Sky -->
  <rect fill="#87CEEB" width="600" height="300"/>
  <!-- Ground -->
  <rect fill="#90EE90" y="300" width="600" height="100"/>
  <!-- Sun -->
  <circle cx="500" cy="80" r="40" fill="#FFD700"/>
  <!-- Mountain -->
  <polygon points="200,300 350,100 500,300" fill="#8B7355"/>
  <!-- Tree -->
  <rect x="100" y="240" width="20" height="60" fill="#8B4513"/>
  <circle cx="110" cy="230" r="30" fill="#228B22"/>
  <!-- House -->
  <rect x="400" y="260" width="80" height="40" fill="#CD853F"/>
  <polygon points="400,260 440,230 480,260" fill="#8B4513"/>
  <!-- Text -->
  <text x="300" y="380" text-anchor="middle" font-size="20" fill="#333" font-family="Arial">AI Generated Landscape</text>
</svg>`,
    },

    'sales-data-spreadsheet': {
        kind: 'spreadsheet',
        title: 'Q1 Sales Report',
        description: 'Quarterly sales data by region and product',
        content: `Product,Region,Q1 Sales,Units Sold,Growth %
Laptop Pro,North America,125000,450,12.5
Laptop Pro,Europe,98000,380,8.2
Laptop Pro,Asia Pacific,145000,520,15.3
Desktop Elite,North America,87000,210,5.8
Desktop Elite,Europe,72000,190,4.2
Desktop Elite,Asia Pacific,95000,240,9.1
Monitor 4K,North America,45000,850,18.5
Monitor 4K,Europe,38000,720,14.2
Monitor 4K,Asia Pacific,52000,980,22.1
Keyboard Mech,North America,23000,1200,25.3
Keyboard Mech,Europe,19000,980,20.5
Keyboard Mech,Asia Pacific,28000,1450,28.7
Mouse Wireless,North America,15000,2100,30.2
Mouse Wireless,Europe,12000,1750,26.8
Mouse Wireless,Asia Pacific,18000,2500,32.5`,
    },

    'customer-data-spreadsheet': {
        kind: 'spreadsheet',
        title: 'Customer Database',
        description: 'Customer information with contact details',
        content: `Customer ID,Name,Email,Phone,Status,Last Purchase
CUST001,John Smith,john.smith@email.com,555-0101,Active,2024-01-15
CUST002,Jane Doe,jane.doe@email.com,555-0102,Active,2024-01-18
CUST003,Bob Johnson,bob.j@email.com,555-0103,Inactive,2023-11-20
CUST004,Alice Williams,alice.w@email.com,555-0104,Active,2024-01-22
CUST005,Charlie Brown,charlie.b@email.com,555-0105,Active,2024-01-10
CUST006,Diana Prince,diana.p@email.com,555-0106,Active,2024-01-25
CUST007,Ethan Hunt,ethan.h@email.com,555-0107,Inactive,2023-12-05
CUST008,Fiona Apple,fiona.a@email.com,555-0108,Active,2024-01-20
CUST009,George Miller,george.m@email.com,555-0109,Active,2024-01-12
CUST010,Hannah Montana,hannah.m@email.com,555-0110,Active,2024-01-28`,
    },
};

export function getArtifactByTrigger(prompt: string): ArtifactResponse | null {
    const lowerPrompt = prompt.toLowerCase();

    // Button: broader creation verbs, simpler nouns
    if (
        /(?:create|build|make|generate|write).*button|button.*(?:component|code)/i.test(lowerPrompt)
    ) {
        return MOCK_ARTIFACT_RESPONSES['button-component'];
    }

    // Table: avoid "table" alone to prevent conflicts with response type requests
    if (
        /(?:create|build|make|generate).*(?:table|grid|datatable)|(?:table|grid).*component/i.test(
            lowerPrompt
        )
    ) {
        return MOCK_ARTIFACT_RESPONSES['data-table'];
    }

    // Documentation: use "docs/guide/documentation" but NOT "document" (RAG uses "document" for retrieval)
    if (
        /(?:write|create|generate).*(?:guide|docs?|documentation)|(?:component|react).*(?:guide|docs?)/i.test(
            lowerPrompt
        )
    ) {
        return MOCK_ARTIFACT_RESPONSES['markdown-doc'];
    }

    // Hook: catch creation patterns and hook-specific naming
    if (/(?:write|create|build|make).*hook|(?:api|custom).*hook|use[A-Z]/i.test(lowerPrompt)) {
        return MOCK_ARTIFACT_RESPONSES['api-hook'];
    }

    // Python: data analysis, visualization, or python scripts
    if (
        /(?:write|create|generate).*(?:python|data analysis|visualization)|python.*(?:script|code)/i.test(
            lowerPrompt
        )
    ) {
        return MOCK_ARTIFACT_RESPONSES['python-analysis'];
    }

    // Image: SVG chart/visualization
    if (
        /(?:create|generate|make|draw).*(?:chart|graph|svg|visualization)|(?:bar|line|pie).*(?:chart|graph)/i.test(
            lowerPrompt
        )
    ) {
        return MOCK_ARTIFACT_RESPONSES['simple-chart-svg'];
    }

    // Image: Base64 image generation
    if (/(?:create|generate|make|draw).*(?:image|picture|png|photo)/i.test(lowerPrompt)) {
        return MOCK_ARTIFACT_RESPONSES['sample-image-base64'];
    }

    // Spreadsheet: Sales/revenue/quarterly data
    if (
        /(?:create|generate|make|show).*(?:sales|revenue|quarterly|q1|q2|q3|q4).*(?:data|report|spreadsheet)|(?:sales|revenue).*(?:spreadsheet|table|csv)/i.test(
            lowerPrompt
        )
    ) {
        return MOCK_ARTIFACT_RESPONSES['sales-data-spreadsheet'];
    }

    // Spreadsheet: Customer/contact data
    if (
        /(?:create|generate|make|show).*(?:customer|client|contact|user).*(?:data|list|spreadsheet)|(?:customer|contact).*(?:spreadsheet|database|table)/i.test(
            lowerPrompt
        )
    ) {
        return MOCK_ARTIFACT_RESPONSES['customer-data-spreadsheet'];
    }

    // Spreadsheet: Generic spreadsheet/CSV request
    if (
        /(?:create|generate|make).*(?:spreadsheet|csv|excel|table data)|(?:spreadsheet|csv).*(?:file|data)/i.test(
            lowerPrompt
        )
    ) {
        return MOCK_ARTIFACT_RESPONSES['sales-data-spreadsheet'];
    }

    return null;
}
