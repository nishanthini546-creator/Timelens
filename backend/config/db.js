const { Pool } = require("pg");
require("dotenv").config();

/**
 * Safely normalizes a PostgreSQL connection string when the password
 * contains unencoded '@' characters (e.g. postgresql://user:pass@2026@localhost:5432/db).
 */
function normalizeConnectionString(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return rawUrl;
  const trimmed = rawUrl.trim();
  const schemeMatch = trimmed.match(/^(postgres(?:ql)?:\/\/)(.+)$/i);
  if (!schemeMatch) return trimmed;

  const prefix = schemeMatch[1];
  const rest = schemeMatch[2];

  const slashIndex = rest.indexOf("/");
  const authority = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
  const pathPart = slashIndex === -1 ? "" : rest.slice(slashIndex);

  const lastAtIndex = authority.lastIndexOf("@");
  if (lastAtIndex === -1) return trimmed;

  const userInfo = authority.slice(0, lastAtIndex);
  const hostInfo = authority.slice(lastAtIndex + 1);

  const colonIndex = userInfo.indexOf(":");
  if (colonIndex === -1) return trimmed;

  const user = userInfo.slice(0, colonIndex);
  const rawPassword = userInfo.slice(colonIndex + 1);

  // Encode '@' if unencoded in password
  const safePassword = rawPassword.includes("@")
    ? rawPassword.replace(/@/g, "%40")
    : rawPassword;

  return `${prefix}${user}:${safePassword}@${hostInfo}${pathPart}`;
}

const connectionString = normalizeConnectionString(process.env.DATABASE_URL);

const isLocalOrInternalVpc =
  !connectionString ||
  connectionString.includes("@localhost") ||
  connectionString.includes("@127.0.0.1") ||
  connectionString.includes("//localhost") ||
  connectionString.includes("//127.0.0.1") ||
  (/@dpg-[a-z0-9-]+(?::\d+)?\//i.test(connectionString) &&
    !connectionString.includes(".render.com"));

const useSsl =
  process.env.DB_SSL === "true" ||
  connectionString?.includes("sslmode=require") ||
  (!isLocalOrInternalVpc && process.env.DB_SSL !== "false");

const pool = new Pool({
  connectionString,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

pool.normalizeConnectionString = normalizeConnectionString;

module.exports = pool;