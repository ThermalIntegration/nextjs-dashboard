export const authConfig = {
  pages: {
    signIn: '/login', // Redirect users here if not logged in
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/ui');

      if (isOnDashboard) {
        // Only allow logged-in users to access dashboard pages
        if (isLoggedIn) return true;
        return false; // Unauthenticated users will be redirected to /login
      } else if (isLoggedIn) {
        // Logged-in users visiting other pages (like home) get redirected to dashboard
        return Response.redirect(new URL('/ui/dashboard', nextUrl));
      }

      return true; // Allow access to public pages
    },
  },
  providers: [], // Empty for now, will add authentication providers later
};