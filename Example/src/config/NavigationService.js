import React from 'react';

export const navigationRef = React.createRef();

const navigate = (name, params) => {
  navigationRef.current && navigationRef.current.navigate(name, params);
};

const getNavigation = () => {
  return navigationRef.current && navigationRef.current;
};

export default {
  navigate,
  getNavigation,
};
