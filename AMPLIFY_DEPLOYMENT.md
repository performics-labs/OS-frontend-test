# AWS Amplify Deployment Guide

This guide covers deploying the OneSuite frontend to AWS Amplify Hosting.

## Why AWS Amplify?

- **Fastest setup**: 1-2 days vs weeks for manual S3+CloudFront
- **Managed CI/CD**: Auto-deploy on git push, no workflow files needed
- **Cost-effective**: $8-15/month (after free tier) vs $40-56/month for ECS
- **Global CDN**: Built on CloudFront for <50ms latency worldwide
- **Preview deployments**: Automatic PR previews for testing
- **Future-proof**: Easy migration to Next.js SSR later

## Prerequisites

- AWS account with Amplify access
- GitHub repository (this repo)
- Backend deployed at: `http://os-proxy-dev-alb-1349485419.us-east-1.elb.amazonaws.com`

## Deployment Steps

### 1. Connect GitHub Repository

1. **Sign in to AWS Console**
   - Navigate to: AWS Amplify → "Get Started"
   - Choose: "Host web app"

2. **Select GitHub**
   - Click "GitHub" as the git provider
   - Authorize AWS Amplify to access your GitHub account
   - Select repository: `OneSuite` (or your repo name)
   - Select branch: `main`

### 2. Configure Build Settings

Amplify will auto-detect the `amplify.yml` file. Review the configuration:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
```

**No changes needed** - this is already configured in your `amplify.yml`.

### 3. Set Environment Variables

In the Amplify Console, go to **App settings → Environment variables**:

Add this variable:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_USE_MOCKS` | `false` | Disable mocks in production |

**Important about `VITE_API_BASE_URL`:**
- **Do NOT add this variable** in Amplify
- When undefined, the code defaults to empty string (relative paths)
- Amplify rewrites in `amplify.yml` handle API routing automatically
- This enables same-domain requests (no CORS issues)

### 4. Configure Advanced Settings (Optional)

**Build image:**
- Default: Amazon Linux:2023 (recommended)
- Node version: Auto-detected from package.json (Node 20)

**Live package updates:**
- Enable for automatic security patches

### 5. Deploy

1. Click **"Save and deploy"**
2. Amplify will:
   - Clone your repository
   - Run `npm ci` and `npm run build`
   - Deploy to CloudFront CDN
   - Provision SSL certificate
3. Wait 5-10 minutes for first deployment

### 6. Verify Deployment

Once deployed, Amplify provides a URL like:
```
https://main.d1234abcd.amplifyapp.com
```

**Test these:**

1. **Frontend loads**: Visit the URL
2. **SPA routing**: Navigate to `/chat/new` (should work, not 404)
3. **API calls**: Test login/signup (check Network tab for `/api/*` calls)
4. **Assets cached**: Check response headers for `/assets/*` (should have long cache)

**Verify API routing:**
```bash
# From browser console or terminal
curl https://main.d1234abcd.amplifyapp.com/api/health

# Should return backend response (not 404)
```

## How It Works

### API Routing with Amplify Rewrites

Your `amplify.yml` includes:

```yaml
customRewrites:
  - source: '/api/<*>'
    target: 'http://os-proxy-dev-alb-1349485419.us-east-1.elb.amazonaws.com/api/<*>'
    status: '200'

  - source: '/auth/<*>'
    target: 'http://os-proxy-dev-alb-1349485419.us-east-1.elb.amazonaws.com/auth/<*>'
    status: '200'
```

**How it works:**
1. User requests `https://yourdomain.com/api/chat`
2. Amplify rewrites to `http://backend-alb/api/chat`
3. Returns response to browser
4. **No CORS issues** - browser sees same domain

### Security Headers

Your `amplify.yml` includes:

```yaml
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Content-Security-Policy'
        value: "default-src 'self'; ..."
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      # ... more headers
```

**Configured headers:**
- ✅ Content Security Policy (CSP)
- ✅ Strict Transport Security (HSTS)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Referrer Policy
- ✅ Permissions Policy

### Asset Caching

```yaml
customHeaders:
  - pattern: '/assets/**/*'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
```

**Vite generates content-hashed filenames** (`index-abc123.js`), so assets can be cached for 1 year safely.

## Custom Domain Setup

### Option 1: Route 53 Domain

1. **Go to Amplify Console** → Your app → "Domain management"
2. Click **"Add domain"**
3. Select your domain from Route 53 (e.g., `onesuite.com`)
4. Configure subdomains:
   - `www.onesuite.com` → main branch
   - `onesuite.com` → redirect to `www`
5. Click **"Save"**

Amplify will:
- Create ACM certificate (SSL/TLS)
- Update Route 53 records
- Wait 15-30 minutes for DNS propagation

### Option 2: External Domain (GoDaddy, Namecheap, etc.)

1. **In Amplify Console** → "Add domain"
2. Enter your domain (e.g., `onesuite.com`)
3. Amplify provides CNAME records:
   ```
   Name: _abc123.onesuite.com
   Value: _xyz456.acm-validations.aws
   ```
4. **Add these records** to your DNS provider
5. Wait for validation (15-30 minutes)

## Branch Deployments

### Automatic Deployments

Amplify auto-deploys on git push:

- **`main` branch** → Production (`main.amplifyapp.com`)
- **`dev` branch** → Staging (`dev.amplifyapp.com`)
- **Pull requests** → Preview (`pr-123.amplifyapp.com`)

### Configure Branch Settings

1. **Go to Amplify Console** → "App settings" → "Branch settings"
2. Enable **"Preview" for pull requests**
3. Set branch patterns:
   - `main` → Production environment
   - `dev` → Development environment
   - `feature/*` → Preview only

### Environment Variables per Branch

You can override environment variables per branch:

1. Go to **"Environment variables"**
2. Click **"Manage variables"**
3. Set branch-specific overrides:
   - `main`: `VITE_API_BASE_URL=` (empty, production backend)
   - `dev`: `VITE_API_BASE_URL=http://dev-backend-alb` (dev backend)

## CI/CD Workflow

### On Every Git Push

1. **Trigger**: Git push to `main` branch
2. **Provision**: Amplify spins up build environment
3. **Build**:
   ```bash
   npm ci              # Install dependencies
   npm run build       # Build production bundle
   ```
4. **Deploy**: Upload `dist/` to S3 + CloudFront
5. **Notify**: Slack/email notification (optional)

**Build time**: ~2-5 minutes

### Manual Redeploy

1. Go to Amplify Console → Your app
2. Click **"Redeploy this version"**
3. Or trigger rebuild without code changes

### View Build Logs

1. Amplify Console → Your app → Build history
2. Click on specific build
3. View logs for each phase:
   - Provisioning
   - Pre-build
   - Build
   - Deploy

## Monitoring

### Built-in Metrics

Amplify Console → "Monitoring":

- **Requests**: Total requests per day
- **Data transfer**: Bandwidth usage
- **Build minutes**: CI/CD usage
- **Errors**: 4xx/5xx error rates

### CloudWatch Integration

Amplify uses CloudWatch for detailed logs:

```bash
# View logs
aws logs tail /aws/amplify/appId/branchName --follow
```

### Custom Monitoring

Add **AWS CloudWatch RUM** (Real User Monitoring):

1. Go to CloudWatch Console → "RUM"
2. Create app monitor
3. Add snippet to `index.html`
4. Track:
   - Page load times
   - JavaScript errors
   - User sessions

## Cost Breakdown

### Free Tier (12 months)

- **Build minutes**: 1,000 minutes/month
- **Storage**: 5 GB
- **Data transfer**: 15 GB/month
- **Requests**: Unlimited

### After Free Tier

| Resource | Cost | Notes |
|----------|------|-------|
| Build minutes | $0.01/minute | ~$0.10 per build (10 min avg) |
| Storage | $0.023/GB/month | ~$0.12 for 5GB |
| Data transfer | $0.15/GB | First 100GB, then cheaper |
| Requests | Included | No charge |

**Estimated monthly cost**: $8-15 for moderate traffic

### Cost Optimization

1. **Reduce build time**:
   - Use `npm ci` instead of `npm install`
   - Enable build caching (already in `amplify.yml`)
   - Reduce npm package size

2. **Minimize rebuilds**:
   - Use branch deployments wisely
   - Don't trigger builds for documentation changes
   - Configure build filters in Amplify settings

3. **Optimize assets**:
   - Vite already tree-shakes and minifies
   - Use appropriate image formats (WebP)
   - Lazy load routes (React.lazy)

## Troubleshooting

### Build Fails

**Check build logs:**
1. Amplify Console → Build history → Failed build
2. Look for errors in "Build" phase

**Common issues:**
- **TypeScript errors**: Run `npm run typecheck` locally
- **Memory issues**: Increase build instance size (Settings → Build settings)
- **Dependency conflicts**: Clear cache and rebuild

### API Calls Return 404

**Verify rewrites configuration:**

1. Check `amplify.yml` has correct backend URL
2. Test rewrite manually:
   ```bash
   curl https://yourdomain.com/api/health
   ```
3. Check Amplify Console → "Rewrites and redirects"

**If still failing:**
- Verify backend ALB is accessible from internet
- Check backend CORS settings (may need to allow Amplify domain)
- Review CloudWatch logs for rejected requests

### SPA Routes Return 404

**Check fallback rewrite:**

In `amplify.yml`:
```yaml
customRewrites:
  - source: '/<*>'
    target: '/index.html'
    status: '404-200'
```

**Test:**
```bash
curl https://yourdomain.com/chat/new
# Should return index.html (not 404)
```

### Slow Build Times

**Optimize:**
1. Enable build caching (already configured)
2. Use `npm ci` instead of `npm install`
3. Reduce dependencies (audit with `npm audit`)
4. Split large files into code-split chunks

**Increase build resources:**
- Amplify Console → Build settings → Build instance size
- Upgrade to "Large" (2x performance, 2x cost)

### Assets Not Cached

**Verify headers:**
```bash
curl -I https://yourdomain.com/assets/index-abc123.js
# Should see: Cache-Control: public, max-age=31536000, immutable
```

**If missing:**
- Check `customHeaders` in `amplify.yml`
- Redeploy after changes
- Clear browser cache and test

## Migration from Development

### Current Setup
- Local: `npm run dev` on port 5000
- Backend: `http://localhost:8000`
- Environment: `.env` with `VITE_API_BASE_URL=http://localhost:8000`

### Production Setup
- Hosted: Amplify CDN (global)
- Backend: `http://os-proxy-dev-alb-1349485419.us-east-1.elb.amazonaws.com`
- Environment: Amplify environment variables (no `.env` file)

### Migration Checklist

- [x] Remove Docker files (Dockerfile, nginx.conf)
- [x] Create `amplify.yml` configuration
- [x] Update API client to use relative paths
- [x] Configure environment variables in Amplify Console
- [ ] Connect GitHub repository to Amplify
- [ ] Deploy and test
- [ ] Set up custom domain (optional)
- [ ] Configure branch deployments
- [ ] Set up monitoring and alerts

## Next Steps

1. **Connect repository** to Amplify Console (see steps above)
2. **Deploy** and verify functionality
3. **Set up custom domain** (optional, recommended for production)
4. **Configure alerts** in CloudWatch for errors
5. **Document** production URL for team

## Advanced Features

### Password Protection

Protect non-production branches:

1. Amplify Console → App settings → Access control
2. Enable **"Access control"** for dev/preview branches
3. Set username/password
4. Production branch remains public

### Webhook Triggers

Trigger builds from external services:

1. Amplify Console → Build settings → Incoming webhooks
2. Create webhook
3. Copy webhook URL
4. Configure in CI/CD tool (e.g., GitHub Actions)

### Performance Mode

Enable **Performance mode** for faster builds:

1. Amplify Console → Build settings → Build image
2. Select **"Performance mode"**
3. Uses larger build instances (~2x faster)
4. Costs ~2x more per build

### Server-Side Rendering (Future)

If migrating to Next.js later:

1. Amplify supports Next.js SSR out-of-box
2. Update `amplify.yml`:
   ```yaml
   version: 1
   frontend:
     phases:
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```
3. Amplify handles SSR automatically (no container needed)

## Support Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amplify Hosting Guide](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [Amplify CLI Reference](https://docs.amplify.aws/cli/)
- [AWS Support](https://console.aws.amazon.com/support/)

## FAQ

**Q: Can I use Amplify with a monorepo?**
A: Yes, configure build settings to point to `frontend/` directory.

**Q: How do I rollback a deployment?**
A: Amplify Console → Build history → Select previous build → "Redeploy"

**Q: Can I use Amplify with GitLab/Bitbucket?**
A: Yes, Amplify supports GitHub, GitLab, Bitbucket, and AWS CodeCommit.

**Q: Do I need to invalidate CloudFront cache?**
A: No, Amplify handles this automatically on each deployment.

**Q: Can I use environment-specific backends?**
A: Yes, use branch-specific environment variables in Amplify Console.

**Q: How do I migrate from Vercel/Netlify?**
A: Similar process - connect repo, configure build, deploy. Amplify imports settings automatically.

---

**Ready to deploy?** Follow the steps above and you'll have your frontend live in 1-2 hours!
