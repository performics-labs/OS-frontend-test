# Frontend Security Audit Report

**Date:** 2025-11-22
**Auditor:** Claude Code
**Scope:** OneSuite Frontend Application

## Executive Summary

Security audit of the frontend codebase identified **2 HIGH severity** vulnerabilities and several recommendations for security hardening before production deployment.

---

## 🔴 CRITICAL FINDINGS

### 1. SVG Injection Vulnerability (HIGH)
**File:** `src/components/artifact/renders/ImageRenderer.tsx:24`
**Severity:** HIGH
**CWE:** CWE-79 (Cross-Site Scripting)

**Issue:**
```typescript
<div dangerouslySetInnerHTML={{ __html: artifact.content }} />
```

SVG content from artifacts is directly rendered without sanitization, allowing potential XSS attacks through malicious SVG payloads.

**Attack Vector:**
- Attacker creates artifact with malicious SVG containing `<script>` tags or event handlers
- SVG is rendered, executing arbitrary JavaScript
- Potential for session hijacking, data theft, or account takeover

**Recommendation:**
```typescript
import DOMPurify from 'dompurify';

// Sanitize SVG before rendering
<div dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(artifact.content, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['use'],
        ADD_ATTR: ['target']
    })
}} />
```

**Action Required:** Install `dompurify` and sanitize all SVG content

---

### 2. Open Redirect Vulnerability (HIGH)
**File:** `src/hooks/useAuth.ts:40`
**Severity:** HIGH
**CWE:** CWE-601 (URL Redirection to Untrusted Site)

**Issue:**
```typescript
window.location.href = data.redirect_url;
```

The application trusts `redirect_url` from the server without validation, allowing potential phishing attacks.

**Attack Vector:**
- Attacker compromises backend or performs MITM attack
- Provides malicious redirect_url (e.g., `https://evil.com`)
- User is redirected to attacker-controlled site that mimics login page

**Recommendation:**
```typescript
// Whitelist allowed domains
const ALLOWED_DOMAINS = [
    window.location.origin,
    'https://yourdomain.com',
    'https://app.yourdomain.com'
];

function isSafeRedirect(url: string): boolean {
    try {
        const urlObj = new URL(url, window.location.origin);
        return ALLOWED_DOMAINS.some(domain =>
            urlObj.origin === new URL(domain).origin
        );
    } catch {
        return false;
    }
}

// Use it
if (!isSafeRedirect(data.redirect_url)) {
    throw new Error('Invalid redirect URL');
}
window.location.href = data.redirect_url;
```

**Action Required:** Implement redirect URL validation

---

## ⚠️ MEDIUM FINDINGS

### 3. Missing Content Security Policy
**File:** `index.html`
**Severity:** MEDIUM
**CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers)

**Issue:**
No CSP headers defined in HTML or deployment configuration.

**Recommendation:**
Add CSP meta tag to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
    img-src 'self' data: https:;
    connect-src 'self' http://os-proxy-dev-alb-1349485419.us-east-1.elb.amazonaws.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
">
```

Or configure via deployment platform (Vercel/Netlify).

---

### 4. Third-Party CDN Usage
**File:** `index.html:18`
**Severity:** MEDIUM

**Issue:**
Loading fonts from CDN without Subresource Integrity (SRI):
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/sans/style.css" />
```

**Recommendation:**
Add SRI hash:
```html
<link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/sans/style.css"
    integrity="sha384-HASH_HERE"
    crossorigin="anonymous"
/>
```

Or self-host fonts for better security and performance.

---

## ✅ POSITIVE FINDINGS

### Security Best Practices Already Implemented:

1. **Environment Variables**
   - ✅ `.env` files properly gitignored
   - ✅ No hardcoded secrets or API keys found
   - ✅ Using `VITE_` prefix for client-side variables

2. **Authentication**
   - ✅ Using httpOnly cookies (`withCredentials: true`)
   - ✅ Session data in sessionStorage (cleared on tab close)
   - ✅ Token not persisted in localStorage
   - ✅ Proper 401/403 error handling with redirect

3. **Dependencies**
   - ✅ No known vulnerabilities (`npm audit` clean)
   - ✅ Using modern, maintained packages

4. **Input Handling**
   - ✅ No `eval()` or `Function()` constructor usage
   - ✅ No `innerHTML` usage (except for charts - safe)

5. **CORS**
   - ✅ Properly configured `withCredentials` for cookie-based auth

---

## 📋 RECOMMENDATIONS

### Before Production Deployment:

#### 1. Fix Critical Vulnerabilities
- [ ] Sanitize SVG content with DOMPurify
- [ ] Add redirect URL validation

#### 2. Add Security Headers
Create `vercel.json` (or equivalent):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

#### 3. Enable HTTPS Only
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

#### 4. Remove Development Artifacts
```bash
# Remove console logs in production build
npm install --save-dev vite-plugin-remove-console
```

Add to `vite.config.ts`:
```typescript
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
  plugins: [
    removeConsole({
      includes: ['log', 'info', 'warn']
    })
  ]
});
```

#### 5. Implement Rate Limiting
Add rate limiting for auth endpoints (backend responsibility, but frontend should handle 429 errors):

```typescript
// In api-client.ts
if (error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after'];
    console.error(`Rate limited. Retry after ${retryAfter}s`);
    // Show user-friendly message
}
```

#### 6. Add Error Monitoring
Install Sentry or similar:
```bash
npm install @sentry/react
```

#### 7. Review Third-Party Scripts
- Audit all external scripts and CDN resources
- Add SRI hashes to all external resources
- Consider self-hosting critical assets

---

## 🔒 SECURITY CHECKLIST

Before deploying to production:

- [ ] SVG sanitization implemented
- [ ] Redirect URL validation implemented
- [ ] CSP headers configured
- [ ] Security headers added (X-Frame-Options, etc.)
- [ ] HTTPS enforced
- [ ] SRI hashes added to CDN resources
- [ ] Console logs removed in production
- [ ] Error monitoring configured
- [ ] Rate limiting error handling added
- [ ] Environment variables verified (no dev URLs)
- [ ] `.env` files not committed to git
- [ ] Dependencies audit clean (`npm audit`)
- [ ] Penetration testing completed

---

## 📊 RISK MATRIX

| Vulnerability | Severity | Likelihood | Impact | Priority |
|--------------|----------|------------|--------|----------|
| SVG Injection | HIGH | Medium | High | P0 |
| Open Redirect | HIGH | Low | High | P0 |
| Missing CSP | MEDIUM | Medium | Medium | P1 |
| No SRI | MEDIUM | Low | Medium | P2 |

---

## 🎯 IMMEDIATE ACTIONS REQUIRED

1. **Install DOMPurify:**
   ```bash
   npm install dompurify
   npm install --save-dev @types/dompurify
   ```

2. **Fix ImageRenderer.tsx**
3. **Fix useAuth.ts redirect validation**
4. **Add security headers configuration**
5. **Test thoroughly**

---

## CONCLUSION

The frontend application has a solid security foundation with proper authentication, environment variable handling, and dependency management. However, the **2 HIGH severity vulnerabilities must be fixed before production deployment** to prevent XSS and phishing attacks.

After addressing these issues and implementing the recommended security headers, the application will be production-ready from a security perspective.

---

**Next Steps:**
1. Fix critical vulnerabilities
2. Implement security headers
3. Perform security testing
4. Schedule follow-up audit after fixes

**Estimated Time to Remediate:** 2-4 hours
