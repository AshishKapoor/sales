# CORS Configuration Guide

This document explains how the CORS (Cross-Origin Resource Sharing) configuration is set up for the Sales Cookbook application to work with the `sales.sannty.in` domain.

## Configuration Files

### 1. Backend Configuration

#### Production Settings (`app/settings/prod.py`)

The production settings include:

- `CORS_ALLOWED_ORIGINS`: Allows requests from `https://sales.sannty.in` and `https://www.sales.sannty.in`
- `CORS_ALLOW_CREDENTIALS`: Enables credential support for authentication
- `CSRF_TRUSTED_ORIGINS`: Configures CSRF protection for the domain
- `ALLOWED_HOSTS`: Allows Django to serve requests from the domain

#### Backend Environment Variables

Use the `.env.prod.example` file as a template to create your production environment file:

```bash
cp .env.prod.example .env.prod
```

Then update the values in `.env.prod` with your actual production credentials.

### 2. Frontend Configuration

#### Frontend Environment Variables (`web-ui/.env.production`)

Use the `web-ui/.env.prod.example` file as a template:

```bash
cd web-ui
cp .env.prod.example .env.production
```

Update the API base URL to match your backend deployment:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.sales.sannty.in
```

### 3. Key Environment Variables for CORS

#### Backend (.env.prod)

- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins
- `CSRF_TRUSTED_ORIGINS`: Comma-separated list of trusted origins for CSRF
- `DJANGO_ALLOWED_HOSTS`: Comma-separated list of allowed hosts

#### Frontend (web-ui/.env.production)

- `NEXT_PUBLIC_API_BASE_URL`: The base URL for API requests to the backend

## Deployment Checklist

1. ✅ **CORS Headers**: `django-cors-headers` is installed and configured
2. ✅ **Allowed Origins**: `sales.sannty.in` is added to CORS_ALLOWED_ORIGINS
3. ✅ **CSRF Protection**: Domain is added to CSRF_TRUSTED_ORIGINS
4. ✅ **Allowed Hosts**: Domain is added to DJANGO_ALLOWED_HOSTS
5. ✅ **SSL/HTTPS**: Production settings enforce HTTPS
6. ✅ **Frontend Config**: API base URL is set correctly for production

## Domain Configuration Options

### Option 1: Same Domain (Recommended)

- Frontend: `https://sales.sannty.in`
- Backend API: `https://sales.sannty.in/api/`

### Option 2: Subdomain for API

- Frontend: `https://sales.sannty.in`
- Backend API: `https://api.sales.sannty.in`

The current configuration supports both options. Choose based on your deployment setup.

## Testing CORS

To test CORS functionality:

1. Deploy the backend with production settings
2. Access the frontend from `https://sales.sannty.in`
3. Check browser developer tools for CORS errors
4. Verify API requests are successful

## Troubleshooting

### Common CORS Issues

1. **Mixed Content**: Ensure all API calls use HTTPS in production
2. **Credentials**: Make sure `CORS_ALLOW_CREDENTIALS = True` is set
3. **Preflight Requests**: OPTIONS method is allowed by default
4. **Headers**: Standard headers are allowed, custom headers may need to be added

### Browser Developer Tools

Check the Network tab for:

- OPTIONS preflight requests
- Response headers like `Access-Control-Allow-Origin`
- Any CORS-related error messages

## Security Notes

- Only specific origins are allowed (not `*`)
- HTTPS is enforced in production
- Credentials are allowed for authentication
- CSRF protection is maintained
