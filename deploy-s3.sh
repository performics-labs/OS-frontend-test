#!/bin/bash
# Frontend Deployment Script - S3 + CloudFront
# Deploy React frontend to S3 and invalidate CloudFront cache

set -e  # Exit on error

REGION="us-east-1"
S3_BUCKET="onesuite-frontend-prod"
CLOUDFRONT_DIST_ID="EIPP0AX5NF6QX"
API_URL="https://app.performics-labs.com"

echo -e "\n\033[0;34m========================================\033[0m"
echo -e "\033[0;34mFrontend Deployment - S3 + CloudFront\033[0m"
echo -e "\033[0;34m========================================\033[0m\n"

echo -e "Frontend: \033[1;33mhttps://agents.performics-labs.com\033[0m"
echo -e "Backend:  \033[1;33m${API_URL}\033[0m"
echo -e "S3 Bucket: ${S3_BUCKET}"
echo -e "CloudFront: ${CLOUDFRONT_DIST_ID}\n"

# Step 1: Build frontend with production API URL
echo -e "\033[1;33m[1/4] Building frontend with production config...\033[0m"
export VITE_API_BASE_URL="${API_URL}"
export VITE_USE_MOCKS="false"

npm run build

if [ ! -d "dist" ]; then
  echo -e "\033[0;31m✗ Build failed - dist/ directory not found\033[0m"
  exit 1
fi

echo -e "\033[0;32m✓ Build completed\033[0m"
echo -e "  Build output: $(du -sh dist | cut -f1)\n"

# Step 2: Upload to S3
echo -e "\033[1;33m[2/4] Uploading to S3...\033[0m"

# Sync all files to S3
aws s3 sync dist/ s3://${S3_BUCKET}/ \
  --region ${REGION} \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML and JSON files with no-cache
aws s3 sync dist/ s3://${S3_BUCKET}/ \
  --region ${REGION} \
  --cache-control "no-cache, no-store, must-revalidate" \
  --exclude "*" \
  --include "*.html" \
  --include "*.json"

echo -e "\033[0;32m✓ Files uploaded to S3\033[0m\n"

# Step 3: Invalidate CloudFront cache
echo -e "\033[1;33m[3/4] Invalidating CloudFront cache...\033[0m"

INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id ${CLOUDFRONT_DIST_ID} \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo -e "\033[0;32m✓ Invalidation created\033[0m"
echo -e "  Invalidation ID: ${INVALIDATION_ID}\n"

# Step 4: Wait for invalidation to complete (optional)
echo -e "\033[1;33m[4/4] Waiting for CloudFront invalidation...\033[0m"
echo -e "This may take 1-3 minutes...\n"

aws cloudfront wait invalidation-completed \
  --distribution-id ${CLOUDFRONT_DIST_ID} \
  --id ${INVALIDATION_ID}

echo -e "\033[0;32m✓ CloudFront cache invalidated\033[0m\n"

echo -e "\033[0;32m========================================\033[0m"
echo -e "\033[0;32mDeployment Complete!\033[0m"
echo -e "\033[0;32m========================================\033[0m\n"

echo -e "Frontend URL: \033[1;36mhttps://agents.performics-labs.com\033[0m"
echo -e "CloudFront:   \033[1;36mhttps://d2z7xacf43k2bm.cloudfront.net\033[0m\n"

echo -e "Note: DNS propagation may take a few minutes."
echo -e "Test the deployment:"
echo -e "  \033[1mcurl -I https://agents.performics-labs.com\033[0m\n"
