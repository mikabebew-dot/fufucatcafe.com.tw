import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** 會自動加上語言前綴的 Link、redirect 等 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
