# Coolify Deployment Guide

## Quick Start

### 1. Prepare Your Repository

Make sure all files are committed:
- `Dockerfile`
- `docker-compose.yml`
- `coolify.yml`
- `.dockerignore`

### 2. Deploy via Coolify UI

1. **Login to Coolify**
   - Access your Coolify dashboard

2. **Create New Resource**
   - Click "New Resource" → "Docker Compose" or "Dockerfile"
   - Or use "Git Repository" option

3. **Configure Repository**
   - Connect your Git repository
   - Set build context: `admin-portal` (if repo root) or `.` (if in admin-portal folder)
   - Branch: `main` or `master`

4. **Set Environment Variables**
   Add all variables from `env.production.example`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   FIREBASE_PROJECT_ID=...
   # ... (see env.production.example for full list)
   ```

5. **Configure Port**
   - Default: `3003`
   - Or set `PORT` environment variable

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Check logs for any errors

### 3. Verify Deployment

- Check health status in Coolify
- Visit your domain/URL
- Test admin login

## Environment Variables

All variables from `env.production.example` are required.

**Important**: Never commit `.env.production` to Git!

## Docker Build Process

The Dockerfile uses a 3-stage build:

1. **deps**: Installs dependencies
2. **builder**: Builds Next.js app
3. **runner**: Minimal production image

## Troubleshooting

### Build Fails
- Check `pnpm-lock.yaml` exists
- Verify all dependencies in `package.json`
- Check Docker build logs

### Container Exits
- Check environment variables
- Review container logs
- Verify port is available

### Application Errors
- Check environment variables are set correctly
- Verify Supabase/Firebase credentials
- Review application logs in Coolify

## Manual Docker Commands

If deploying manually:

```bash
# Build
docker build -t ajira-admin-portal .

# Run
docker run -d \
  -p 3003:3003 \
  --env-file .env.production \
  --name ajira-admin-portal \
  ajira-admin-portal

# View logs
docker logs -f ajira-admin-portal

# Stop
docker stop ajira-admin-portal

# Remove
docker rm ajira-admin-portal
```

## Updating

1. Push changes to Git
2. Coolify auto-deploys (if enabled)
3. Or manually trigger redeploy in Coolify UI

## Security Checklist

- [ ] All secrets in Coolify environment variables
- [ ] `.env.production` not in Git
- [ ] Service role keys secured
- [ ] Firebase private key secured
- [ ] Port properly configured
- [ ] Health checks working


