
import React from 'react';
import {
    Animated,
} from 'react-native';
import SlideSceneContainer from './sceneExtension/SlideSceneContainer'
import NormalSceneContainer from './sceneExtension/NormalSceneContainer'

import { SlideSceneContainerType, SlideSceneContainerProps, NormalSceneContainerType, NormalSceneContainerProps, SceneConfig } from './types'

export default function HPageViewHoc<T>(WrappedComponent: any, config: SceneConfig) {
    const AnimatePageView: any = Animated.createAnimatedComponent(WrappedComponent);

    return React.forwardRef((props: SlideSceneContainerType<any> | NormalSceneContainerType<any>, ref) => {
        const { slideAnimated } = props
        const mProps = {
            ...props,
            forwardedRef: ref,
            WrappedComponent,
            ContainerView: AnimatePageView
        }
        if (slideAnimated) {
            return <SlideSceneContainer {...mProps as SlideSceneContainerProps<any>} />;
        }
        return <NormalSceneContainer {...mProps as NormalSceneContainerProps<any>} {...config} />;
    });
}

