import React from 'react';
import { CollapsibleHeaderProps } from 'react-native-head-tab-view'
import { ScrollableTabViewProperties } from 'react-native-scrollable-tab-view'

type ZTabViewProps = Omit<ScrollableTabViewProperties, 'ref'> & CollapsibleHeaderProps

export class CollapsibleHeaderTabView extends React.Component<ZTabViewProps>{ }