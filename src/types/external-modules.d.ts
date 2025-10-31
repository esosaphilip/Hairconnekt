// Ambient module declarations to satisfy TypeScript when these packages
// are not installed in the mobile app. This prevents "Cannot find module"
// type errors during tsc checks without affecting runtime code.
// NOTE: If you plan to use these libraries at runtime, install them via npm.

declare module "react-day-picker" {
  export const DayPicker: any;
}

declare module "lucide-react" {
  export const ChevronLeft: any;
  export const ChevronRight: any;
  export const SearchIcon: any;
  export const ArrowLeft: any;
  export const ArrowRight: any;
  export const GripVerticalIcon: any;
  export const ChevronDownIcon: any;
  export const XIcon: any;
  export const CircleIcon: any;
  export const MinusIcon: any;
  export const PanelLeftIcon: any;
  export const MoreHorizontal: any;
}

declare module "@radix-ui/react-slot" {
  export const Slot: any;
}

declare module "class-variance-authority" {
  export function cva(...args: any[]): any;
  export type VariantProps<T> = any;
}

declare module "@radix-ui/react-alert-dialog" {
  export const Root: any;
  export const Trigger: any;
  export const Portal: any;
  export const Overlay: any;
  export const Content: any;
  export const Title: any;
  export const Description: any;
  export const Action: any;
  export const Cancel: any;
}

// Mobile-specific shims to avoid TS2307 errors during type checks
declare module "expo-image-picker" {
  export const launchImageLibraryAsync: any;
  export const launchCameraAsync: any;
  export const MediaTypeOptions: any;
  export const requestMediaLibraryPermissionsAsync: any;
}

declare module "react-native-vector-icons/Feather" {
  const Feather: any;
  export default Feather;
}