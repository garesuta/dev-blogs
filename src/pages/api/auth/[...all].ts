import { auth } from "../../../lib/auth";
import type { APIRoute } from "astro";

// Disable prerendering for this dynamic route (SSR only)
export const prerender = false;

export const ALL: APIRoute = async (ctx) => {
  return auth.handler(ctx.request);
};
