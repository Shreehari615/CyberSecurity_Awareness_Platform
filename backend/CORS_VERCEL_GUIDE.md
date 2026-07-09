# CORS Configuration for Vercel Deployment

## Issue
When deploying a Django backend to Vercel, CORS errors occur because:
1. Vercel's edge network handles requests before they reach your Django application
2. Browser preflight (OPTIONS) requests need proper CORS headers
3. Credentials (cookies, authorization headers) require specific CORS configuration

## Solution Implemented

### 1. Django Settings (`core/settings.py`)
- **CORS_ALLOWED_ORIGINS**: Explicitly lists allowed origins (no wildcards with credentials)
- **CORS_ALLOW_CREDENTIALS = True**: Allows cookies/auth headers
- **CORS_ALLOW_HEADERS**: Includes all necessary headers for API calls
- **CORS_ALLOW_METHODS**: Allows all HTTP methods
- **CSRF_TRUSTED_ORIGINS**: Required for CSRF protection with cross-origin requests
- **SESSION_COOKIE_SAMESITE = 'None'** & **SESSION_COOKIE_SECURE = True**: Required for cross-origin cookies
- **CSRF_COOKIE_SAMESITE = 'None'** & **CSRF_COOKIE_SECURE = True**: Required for cross-origin CSRF

### 2. Vercel Configuration (`vercel.json`)
- **Edge-level CORS headers**: Added to routes for immediate response
- **OPTIONS preflight handling**: Proper headers for preflight requests
- **Access-Control-Max-Age**: Caches preflight responses for 24 hours

### 3. API Handler (`api/index.py`)
- **Explicit OPTIONS handling**: Returns proper CORS headers for preflight
- **CORS headers on all responses**: Ensures headers are present even if Django middleware misses them

## Required Environment Variables (Set in Vercel Dashboard)

```bash
# Required
FRONTEND_URL=https://your-frontend.vercel.app
SECRET_KEY=your-django-secret-key
DATABASE_URL=your-postgresql-connection-string

# Optional (for additional domains)
CORS_ADDITIONAL_ORIGINS=https://staging.example.com,https://preview.example.com
CSRF_ADDITIONAL_ORIGINS=https://staging.example.com,https://preview.example.com

# Email (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Vercel Dashboard Configuration

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the variables above
4. Make sure to set them for **Production**, **Preview**, and **Development** environments

## Common CORS Issues & Fixes

### Issue: "Access-Control-Allow-Origin header contains multiple values"
**Fix**: Ensure only one origin is specified (no wildcards with credentials)

### Issue: "Credentials flag is true but Access-Control-Allow-Origin is *"
**Fix**: Use explicit origins in `CORS_ALLOWED_ORIGINS`, never `*` with `CORS_ALLOW_CREDENTIALS = True`

### Issue: Preflight OPTIONS request fails
**Fix**: 
- Ensure `OPTIONS` is in `CORS_ALLOW_METHODS`
- Check that `Access-Control-Allow-Headers` includes all headers your frontend sends
- Verify Vercel edge headers are configured

### Issue: Cookies not sent with requests
**Fix**:
- Set `SESSION_COOKIE_SAMESITE = 'None'` and `SESSION_COOKIE_SECURE = True`
- Set `CSRF_COOKIE_SAMESITE = 'None'` and `CSRF_COOKIE_SECURE = True`
- Ensure frontend uses `credentials: 'include'` in fetch/axios

### Issue: CSRF verification failed
**Fix**:
- Add frontend domain to `CSRF_TRUSTED_ORIGINS`
- Ensure `X-CSRFToken` header is sent with requests
- Check that `corsheaders.middleware.CorsMiddleware` is before `django.middleware.csrf.CsrfViewMiddleware`

## Testing CORS Locally

```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  http://localhost:8000/api/your-endpoint/

# Test actual request with credentials
curl -X POST \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -b cookies.txt -c cookies.txt \
  http://localhost:8000/api/your-endpoint/
```

## Debugging Tips

1. **Check browser Network tab**: Look for OPTIONS requests and their response headers
2. **Verify Vercel logs**: Check function logs for CORS-related errors
3. **Test with curl**: Use the commands above to isolate issues
4. **Check Django logs**: Look for CSRF or CORS middleware messages

## Frontend Configuration

Ensure your frontend (React/Vue/Next.js) is configured to send credentials:

```javascript
// Axios
axios.defaults.withCredentials = true;

// Fetch
fetch(url, {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken')
  }
});
```