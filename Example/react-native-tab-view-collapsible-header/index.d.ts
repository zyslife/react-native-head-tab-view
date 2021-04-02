import { TabViewProps, Route } from 'react-native-tab-view';
import React from 'react';

import { CollapsibleHeaderProps } from 'react-native-head-tab-view'

export type ZTabViewProps<T extends Route> = Partial<TabViewProps<T>> &
    Pick<TabViewProps<T>, 'onIndexChange' | 'navigationState' | 'renderScene'> & CollapsibleHeaderProps

export class CollapsibleHeaderTabView<T extends Route> extends React.Component<ZTabViewProps<T>>{ }