// Ambient module declarations to satisfy TypeScript when these packages
// are not installed in the mobile app. This prevents "Cannot find module"
// type errors during tsc checks without affecting runtime code.
// NOTE: If you plan to use these libraries at runtime, install them via npm.

declare module "react-day-picker" {
  export const DayPicker: unknown;
}

declare module "lucide-react" {
  export const ChevronLeft: unknown;
  export const ChevronRight: unknown;
  export const SearchIcon: unknown;
  export const ArrowLeft: unknown;
  export const ArrowRight: unknown;
  export const GripVerticalIcon: unknown;
  export const ChevronDownIcon: unknown;
  export const XIcon: unknown;
  export const CircleIcon: unknown;
  export const MinusIcon: unknown;
  export const PanelLeftIcon: unknown;
  export const MoreHorizontal: unknown;
}

declare module "@radix-ui/react-slot" {
  export const Slot: unknown;
}

declare module "class-variance-authority" {
  export function cva(...args: unknown[]): unknown;
  export type VariantProps = unknown;
}

declare module "@radix-ui/react-alert-dialog" {
  export const Root: unknown;
  export const Trigger: unknown;
  export const Portal: unknown;
  export const Overlay: unknown;
  export const Content: unknown;
  export const Title: unknown;
  export const Description: unknown;
  export const Action: unknown;
  export const Cancel: unknown;
}

// Mobile-specific shims to avoid TS2307 errors during type checks
declare module "expo-image-picker" {
  export type PermissionResponse = { status: string; granted?: boolean };
  export const requestMediaLibraryPermissionsAsync: () => Promise<PermissionResponse>;
  export type LaunchImageLibraryOptions = {
    mediaTypes?: string | number | undefined;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    base64?: boolean;
  };
  export type ImagePickerAsset = { uri: string; width?: number; height?: number; type?: string; fileName?: string; base64?: string };
  export type ImagePickerResult = { canceled: boolean; assets?: ImagePickerAsset[] };
  export const MediaTypeOptions: { Images: string; All: string; Videos: string };
  export const launchImageLibraryAsync: (opts: LaunchImageLibraryOptions) => Promise<ImagePickerResult>;
  export const launchCameraAsync: (opts: LaunchImageLibraryOptions) => Promise<ImagePickerResult>;
}

declare module "react-native-vector-icons/Feather" {
  const Feather: unknown;
  export default Feather;
}
