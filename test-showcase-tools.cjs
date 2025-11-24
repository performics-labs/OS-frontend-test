#!/usr/bin/env node

/**
 * Test script to verify all campaign tools in the showcase page render without errors
 *
 * This script tests each tool by checking:
 * 1. The tool exists in TOOL_EXAMPLES
 * 2. Has valid success state data
 * 3. Data structure matches what the component expects
 */

const campaignTools = [
  'client_profiler',
  'budget_allocator',
  'roas_projector',
  'pricing_optimizer',
  'brand_lift_predictor',
  'audience_creator',
  'creative_designer',
  'platform_configurator',
  'export_generator'
];

console.log('🧪 Testing Campaign Tools in Showcase Page\n');
console.log('═'.repeat(60));

// Since we can't actually import the file (it's TypeScript/React),
// we'll verify the structure by reading the file and checking key patterns

const fs = require('fs');
const path = require('path');

const showcaseFile = path.join(__dirname, 'src/pages/ToolsShowcasePage.tsx');
const content = fs.readFileSync(showcaseFile, 'utf-8');

let allPassed = true;

campaignTools.forEach(tool => {
  console.log(`\n📋 Testing: ${tool}`);
  console.log('─'.repeat(60));

  // Check if tool exists in TOOL_EXAMPLES
  const toolPattern = new RegExp(`${tool}:\\s*{`, 'g');
  const toolExists = toolPattern.test(content);

  if (!toolExists) {
    console.log(`❌ FAIL: Tool '${tool}' not found in TOOL_EXAMPLES`);
    allPassed = false;
    return;
  }
  console.log(`✅ Tool '${tool}' exists in TOOL_EXAMPLES`);

  // Check for success state
  const toolSection = content.split(`${tool}: {`)[1]?.split(/\n\s{4}\},\n\s{4}\w+:/)[0];
  if (!toolSection) {
    console.log(`❌ FAIL: Could not extract tool section for '${tool}'`);
    allPassed = false;
    return;
  }

  const hasSuccess = /success:\s*{/.test(toolSection);
  const hasOutput = /output:\s*{/.test(toolSection);
  const hasLoading = /loading:\s*{/.test(toolSection);
  const hasError = /error:\s*{/.test(toolSection);

  console.log(`  States present:`);
  console.log(`    - loading: ${hasLoading ? '✅' : '❌'}`);
  console.log(`    - success: ${hasSuccess ? '✅' : '❌'}`);
  console.log(`    - error: ${hasError ? '✅' : '❌'}`);

  if (!hasSuccess || !hasOutput) {
    console.log(`❌ FAIL: Missing success state or output for '${tool}'`);
    allPassed = false;
    return;
  }

  // Extract the output object
  const outputMatch = toolSection.match(/output:\s*({[\s\S]*?}),\s*error:/);
  if (!outputMatch) {
    console.log(`❌ FAIL: Could not extract output structure for '${tool}'`);
    allPassed = false;
    return;
  }

  const outputStr = outputMatch[1];

  // Tool-specific validations
  const validations = {
    client_profiler: [
      { field: 'clientProfile', required: true },
      { field: 'industryBenchmarks', required: true },
      { field: 'competitiveInsights', required: true },
      { field: 'recommendations', required: true },
      { field: 'bestObjectives', required: true, parent: 'historicalPerformance' },
      { field: 'topPlatforms', required: true, parent: 'industryBenchmarks', isArray: true },
      { field: 'competitorSpend', required: true, parent: 'competitiveInsights' }
    ],
    budget_allocator: [
      { field: 'platformAllocations', required: true },
      { field: 'phaseAllocations', required: true },
      { field: 'days', required: true, pattern: /days:/ }
    ],
    roas_projector: [
      { field: 'projections', required: true },
      { field: 'weeklyProjections', required: true },
      { field: 'confidenceScore', required: true }
    ],
    pricing_optimizer: [
      { field: 'pricingStrategy', required: true },
      { field: 'bidMultipliers', required: true },
      { field: 'platformPricing', required: true }
    ],
    brand_lift_predictor: [
      { field: 'brandLiftMetrics', required: true },
      { field: 'sentimentAnalysis', required: true },
      { field: 'projectedTimeline', required: true },
      { field: 'preferenceShift', required: true, parent: 'brandLiftMetrics' }
    ],
    audience_creator: [
      { field: 'segments', required: true },
      { field: 'overlapAnalysis', required: true },
      { field: 'hasOverlap', required: true, parent: 'overlapAnalysis' }
    ],
    creative_designer: [
      { field: 'creativeAssets', required: true },
      { field: 'brandGuidelines', required: true },
      { field: 'format', required: true, pattern: /format:/ },
      { field: 'estimatedCTR', required: true }
    ],
    platform_configurator: [
      { field: 'configurations', required: true }
    ],
    export_generator: [
      { field: 'campaignSummary', required: true },
      { field: 'formats', required: true },
      { field: 'completionStatus', required: true }
    ]
  };

  const toolValidations = validations[tool] || [];
  let validationsPassed = true;

  console.log(`  Field validations:`);
  toolValidations.forEach(validation => {
    const { field, pattern } = validation;
    const regex = pattern || new RegExp(`${field}:\\s*[\\[{]`);
    const exists = regex.test(outputStr);

    if (validation.required && !exists) {
      console.log(`    ❌ Missing required field: ${field}`);
      validationsPassed = false;
      allPassed = false;
    } else {
      console.log(`    ✅ ${field}`);
    }
  });

  if (validationsPassed) {
    console.log(`\n✅ PASS: ${tool} has valid structure`);
  } else {
    console.log(`\n❌ FAIL: ${tool} has structural issues`);
  }
});

console.log('\n' + '═'.repeat(60));
if (allPassed) {
  console.log('✅ ALL TESTS PASSED - All campaign tools are properly configured\n');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED - Please review the errors above\n');
  process.exit(1);
}
