import { buildLegacyTheme } from "sanity";

/** 後台配色：沿用官網的米白底與 FUFU 墨綠，讓前後台看起來是同一套 */
export const studioTheme = buildLegacyTheme({
  "--black": "#3e3b3a",
  "--white": "#ffffff",
  "--gray": "#6f6a66",
  "--gray-base": "#6f6a66",
  "--component-bg": "#ffffff",
  "--component-text-color": "#3e3b3a",
  "--brand-primary": "#4f7a72",
  "--default-button-color": "#6f6a66",
  "--default-button-primary-color": "#4f7a72",
  "--default-button-success-color": "#2e6b3f",
  "--default-button-warning-color": "#8a5a12",
  "--default-button-danger-color": "#a75337",
  "--state-info-color": "#4f7a72",
  "--state-success-color": "#2e6b3f",
  "--state-warning-color": "#8a5a12",
  "--state-danger-color": "#a75337",
  "--main-navigation-color": "#faf9f7",
  "--main-navigation-color--inverted": "#3e3b3a",
  "--focus-color": "#4f7a72",
});

/** 左上角的 Logo */
export function StudioIcon() {
  return <img src="/icons/admin-64.png" alt="" width={25} height={25} style={{ borderRadius: 6, display: "block" }} />;
}
