declare module 'react-native-actions-sheet' {
  import * as React from 'react';
  import { ViewProps, StyleProp, ViewStyle } from 'react-native';
  export interface ActionSheetProps extends ViewProps {
    containerStyle?: StyleProp<ViewStyle>;
  }
  export default class ActionSheet extends React.Component<ActionSheetProps> {
    show(): void;
    hide(): void;
  }
}

declare module '@react-native-picker/picker' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';
  export interface PickerProps extends ViewProps {
    selectedValue?: any;
    onValueChange?: (itemValue: any, itemIndex: number) => void;
    enabled?: boolean;
  }
  export class Picker extends React.Component<PickerProps> {}
  export namespace Picker {
    export interface ItemProps extends ViewProps {
      label: string;
      value: any;
      color?: string;
    }
    export class Item extends React.Component<ItemProps> {}
  }
}