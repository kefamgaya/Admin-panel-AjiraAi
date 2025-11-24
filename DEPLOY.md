# Deployment Guide for Coolify

This guide explains how to deploy the Ajira AI Admin Portal to Coolify.

## Prerequisites

1. A Coolify instance running
2. Docker installed on the Coolify server
3. All environment variables configured
4. Access to your Supabase and Firebase projects

## Quick Start

### Option 1: Using Coolify UI (Recommended)

1. **Create a New Resource in Coolify**
   - Go to your Coolify dashboard
   - Click "New Resource"
   - Select "Docker Compose" or "Dockerfile"

2. **Connect Your Repository**
   - Connect your Git repository
   - Set the build context to the `admin-portal` directory
   - Coolify will automatically detect the Dockerfile

3. **Configure Environment Variables**
   - Add all required environment variables from `.env.production.template`
   - Make sure to set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - All Firebase credentials
     - All AdMob credentials

4. **Set Port**
   - Default port: `3003`
   - You can change this via the `PORT` environment variable

5. **Deploy**
   - Click "Deploy"
   - Coolify will build and start your container

### Option 2: Using Docker Compose

1. **Clone and Navigate**
   ```bash
   cd admin-portal
   ```

2. **Create Environment File**
   ```bash
   cp .env.production.template .env.production
   # Edit .env.production with your values
   ```

3. **Build and Run**
   ```bash
   docker-compose up -d --build
   ```

## Environment Variables

All environment variables are required. See `.env.production.template` for the complete list.

### Critical Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)
- `FIREBASE_PRIVATE_KEY` - Firebase private key (keep secret!)

## Dockerfile Details

The Dockerfile uses a multi-stage build:

1. **Dependencies Stage**: Installs all npm packages
2. **Builder Stage**: Builds the Next.js application
3. **Runner Stage**: Creates a minimal production image

The final image is optimized for production with:
- Non-root user for security
- Standalone Next.js output
- Minimal Alpine Linux base

## Health Checks

The container includes a health check that verifies the application is running:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 40 seconds

## Port Configuration

Default port: `3003`

To change the port:
1. Update `PORT` environment variable
2. Update port mapping in `docker-compose.yml`
3. Rebuild and restart

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify `pnpm-lock.yaml` is up to date
- Check Docker build logs

### Container Won't Start

- Verify all environment variables are set
- Check container logs: `docker logs ajira-admin-portal`
- Ensure port 3003 is not in use

### Application Errors

- Check environment variables are correct
- Verify Supabase and Firebase credentials
- Check application logs in Coolify

## Updating the Application

1. Push changes to your Git repository
2. Coolify will automatically detect changes (if auto-deploy is enabled)
3. Or manually trigger a redeploy in Coolify UI

## Security Notes

- Never commit `.env.production` to Git
- Keep service role keys and private keys secure
- Use Coolify's secret management for sensitive values
- Regularly update dependencies for security patches

## Monitoring

- Check Coolify dashboard for container status
- Monitor application logs in Coolify
- Set up alerts for container failures

## Support

For issues:
1. Check application logs in Coolify
2. Verify environment variables
3. Check Docker container status
4. Review this deployment guide


