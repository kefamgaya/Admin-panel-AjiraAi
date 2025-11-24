import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

async function isAdminRegistrationEnabled(request: NextRequest): Promise<boolean> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // No-op for read-only operation
          },
        },
      }
    );

    const { data, error } = await supabase
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "admin_registration_enabled")
      .single();

    if (error || !data) {
      return false; // Default to disabled for security
    }

    return data.setting_value?.value ?? false;
  } catch (error) {
    return false; // Default to disabled on error
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Development Bypass: Always allow access to admin routes
  if (process.env.NODE_ENV === 'development') {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to login and register pages without authentication
  // Registration is now always enabled - no restrictions
  const publicAdminRoutes = ['/admin/login', '/admin/register']
  
  const isPublicRoute = publicAdminRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (request.nextUrl.pathname.startsWith('/admin') && !isPublicRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from login/register pages
  if ((request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/admin/register') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
