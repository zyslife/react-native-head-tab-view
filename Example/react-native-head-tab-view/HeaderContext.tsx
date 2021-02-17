
import React from 'react';
import { IHeaderContext,IHeaderSlideContext } from './types'
export const HeaderContext = React.createContext<IHeaderContext | undefined>(undefined);
export const HeaderSlideContext = React.createContext<IHeaderSlideContext | undefined>(undefined);