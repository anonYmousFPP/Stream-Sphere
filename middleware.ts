import { authMiddleware } from "@clerk/nextjs/server";
export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/webhooks(.*)",
    "/api/uploadthing",
    "/:username",
    "/search",
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

// import { clerkClient } from "@clerk/nextjs/server";

// // Initialize Clerk client
// clerkClient();

// export const config = {
//   matcher: [
//     '/((?!.+\\.[\\w]+$|_next).*)', // Don't run middleware on static files
//     '/', // Run middleware on index page
//     '/(api|trpc)(.*)', // Run middleware on API routes
//   ],
// };
