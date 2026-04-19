import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  ...(process.env.DIRECT_URL
    ? { datasource: { url: env("DIRECT_URL") } }
    : {}),
});
