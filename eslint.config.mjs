import { plugin as shadcn } from "@shadcn/lint"
import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import simpleImportSort from "eslint-plugin-simple-import-sort"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { shadcn },
    rules: {
      "shadcn/no-arbitrary-values": "error",
      "shadcn/no-inline-styles": "error",
      "shadcn/no-raw-colors": "error",
      "shadcn/no-restyle": [
        "error",
        {
          allow: ["*"],
          contracts: [
            {
              pattern: "^Avatar$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size", "w", "min-w", "max-w"],
            },
            {
              pattern: "^AvatarBadge$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^AvatarFallback$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size", "w", "min-w", "max-w"],
            },
            {
              pattern: "^AvatarGroup$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^AvatarGroupCount$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^AvatarImage$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size", "w", "min-w", "max-w"],
            },
            {
              pattern: "^Badge$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^Blobatar$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size", "w", "min-w", "max-w"],
            },
            {
              pattern: "^Button$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ButtonGroup$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ButtonGroupSeparator$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ButtonGroupText$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^Card$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^CardAction$",
              allow: ["layout", "gap"],
            },
            {
              pattern: "^CardContent$",
              allow: ["layout"],
            },
            {
              pattern: "^CardDescription$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^CardFooter$",
              allow: ["layout", "spacing", "border-t"],
            },
            {
              pattern: "^CardHeader$",
              allow: ["layout", "spacing", "border-b"],
            },
            {
              pattern: "^CardTitle$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^Checkbox$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size", "w", "min-w", "max-w"],
            },
            {
              pattern: "^Empty$",
              allow: ["layout", "border"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^EmptyContent$",
              allow: ["layout", "spacing"],
            },
            {
              pattern: "^EmptyDescription$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^EmptyHeader$",
              allow: ["layout", "spacing"],
            },
            {
              pattern: "^EmptyMedia$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^EmptyTitle$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^Field$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^FieldContent$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^FieldDescription$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^FieldError$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^FieldGroup$",
              allow: ["layout", "spacing"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^FieldLabel$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^FieldLegend$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^FieldSeparator$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^FieldSet$",
              allow: ["layout", "spacing"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^FieldTitle$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^Input$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^InputGroup$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^InputGroupAddon$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^InputGroupButton$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^InputGroupInput$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^InputGroupText$",
              allow: ["layout", "typography"],
              deny: ["font-*", "h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^InputGroupTextarea$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^Item$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ItemActions$",
              allow: ["layout"],
            },
            {
              pattern: "^ItemContent$",
              allow: ["layout", "spacing"],
            },
            {
              pattern: "^ItemDescription$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^ItemFooter$",
              allow: ["layout", "spacing"],
            },
            {
              pattern: "^ItemGroup$",
              allow: ["layout", "spacing"],
            },
            {
              pattern: "^ItemHeader$",
              allow: ["layout", "spacing"],
            },
            {
              pattern: "^ItemMedia$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ItemSeparator$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ItemTitle$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^Label$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^NavigationMenu$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^NavigationMenuContent$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^NavigationMenuIndicator$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^NavigationMenuItem$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^NavigationMenuLink$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^NavigationMenuList$",
              allow: ["layout", "spacing"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^NavigationMenuPositioner$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^NavigationMenuTrigger$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^Pagination$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^PaginationContent$",
              allow: ["layout", "spacing"],
            },
            {
              pattern: "^PaginationEllipsis$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^PaginationItem$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^PaginationLink$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^PaginationNext$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^PaginationPrevious$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^Progress$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ProgressIndicator$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ProgressLabel$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^ProgressTrack$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ProgressValue$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^RadioGroup$",
              allow: ["layout", "spacing"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^RadioGroupItem$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size", "w", "min-w", "max-w"],
            },
            {
              pattern: "^ResizableHandle$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ResizablePanel$",
              allow: ["layout"],
            },
            {
              pattern: "^ResizablePanelGroup$",
              allow: ["layout", "border", "rounded-*"],
            },
            {
              pattern: "^Select$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^SelectContent$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^SelectGroup$",
              allow: ["layout", "spacing"],
            },
            {
              pattern: "^SelectItem$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^SelectLabel$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^SelectScrollDownButton$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^SelectScrollUpButton$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^SelectSeparator$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^SelectTrigger$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^SelectValue$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^Separator$",
              allow: ["layout"],
            },
            {
              pattern: "^Skeleton$",
              allow: ["layout"],
            },
            {
              pattern: "^Switch$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size", "w", "min-w", "max-w"],
            },
            {
              pattern: "^Textarea$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^Toast$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ToastAction$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ToastClose$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ToastContent$",
              allow: ["layout", "spacing"],
            },
            {
              pattern: "^ToastDescription$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^Toaster$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ToastPortal$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ToastProvider$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^ToastTitle$",
              allow: ["layout", "typography"],
              deny: ["font-*"],
            },
            {
              pattern: "^ToastViewport$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^Tooltip$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^TooltipContent$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^TooltipProvider$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
            {
              pattern: "^TooltipTrigger$",
              allow: ["layout"],
              deny: ["h", "min-h", "max-h", "size"],
            },
          ],
        },
      ],
      "shadcn/no-unknown-classes": "error",
      "shadcn/require-static-classes": "error",
    },
  },
  {
    files: ["components/ui/**"],
    rules: {
      "shadcn/no-arbitrary-values": "off",
      "shadcn/no-restyle": "off",
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
  ]),
])

export default eslintConfig
