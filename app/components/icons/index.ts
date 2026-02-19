/**
 * Icon system — re-exports for convenient import
 *
 * Usage:
 *   import { Icon } from "@/app/components/icons";
 *   import type { IconProps, IconSize } from "@/app/components/icons";
 *
 * For IconContext (global defaults in a subtree):
 *   import { IconContext } from "@phosphor-icons/react";
 *   <IconContext.Provider value={{ weight: "bold", color: "var(--icon-primary)" }}>
 *     ...
 *   </IconContext.Provider>
 */

export { Icon } from "./Icon";
export type { IconProps, IconSize } from "./Icon";
