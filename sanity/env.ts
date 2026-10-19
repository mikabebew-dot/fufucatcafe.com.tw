/**
 * Sanity 專案設定。Project ID 與資料集名稱是公開識別碼（不是密碼），
 * 因此直接寫入預設值；.env.local 有設定時以 .env.local 為準。
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "z4pcrrck";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-07-01";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
