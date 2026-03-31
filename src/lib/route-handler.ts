import { ZodError } from "zod";
import { HttpError, UnauthorizedError } from "./http-error";
import { createAuthClient, createClient } from "./supabase/server";

type RouteHandler = (
  request: Request,
  context: { params: Promise<Record<string, string>> }
) => Promise<Response>;

async function authenticate(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await createClient().auth.getUser(token);
    if (!user) throw new UnauthorizedError();
    return user;
  }

  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export function authRouteHandler(
  handler: (
    request: Request,
    context: { params: Promise<Record<string, string>>; user: { id: string } }
  ) => Promise<Response>
): RouteHandler {
  return routeHandler(async (request, context) => {
    const user = await authenticate(request);
    return handler(request, { ...context, user });
  });
}

export function routeHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    if (["POST", "PATCH"].includes(request.method)) {
      const clone = request.clone();
      clone
        .json()
        .then((body) => {
          console.log(` ${request.method} ${request.url}`);
          console.log(` BODY: ${JSON.stringify(body)}`);
        })
        .catch(() => {});
    }

    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ZodError) {
        // validation error
        return Response.json(
          {
            error: "Validation failed",
            fields: error.issues.map((i) => ({
              path: i.path.map(String).join("."),
              message: i.message,
            })),
          },
          { status: 400 }
        );
      }

      if (error instanceof HttpError) {
        return Response.json(
          { error: error.message, code: error.code },
          { status: error.status }
        );
      }

      return Response.json(
        { error: (error as Error).message },
        { status: 500 }
      );
    }
  };
}
