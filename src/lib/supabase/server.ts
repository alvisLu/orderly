import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export function createClient() {
  return createSupabaseClient(URL, SERVICE_KEY);
}

/** Route Handler / Server Action 用（anon key + next/headers cookies） */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(URL, ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) =>
        list.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
    },
  });
}

/** proxy.ts 用（anon key + NextRequest cookies） */
export function createProxyClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const client = createServerClient(URL, ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  return { client, getResponse: () => response };
}
