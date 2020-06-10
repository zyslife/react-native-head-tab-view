import PropTypes from 'prop-types';

//tabview的props
export const TabViewProps = {
  ...TabProps,
  renderScene: PropTypes.func.isRequired,
  initialPage: PropTypes.number, //初始页面序号
  renderTabBar: PropTypes.func, //渲染tabbar元素方法
  extraData: PropTypes.any, //由于tabview继承至PureComponent，需要刷新页面的额外数据
  onChangeTab: PropTypes.func, //tab切换的回调 参数(上次页面，当前页)
  onScroll: PropTypes.func,  //滚动回调
  preInitSceneNum: PropTypes.number, //预加载页面数
  locked: PropTypes.bool, //是否锁定滚动
  pageDidShow: PropTypes.func, //当前展示的页面
  renderHeader: PropTypes.func, //渲染头部 参数{item,index}
  renderFooter: PropTypes.func, //渲染尾部 参数{item,index}
  tabbarStyle: PropTypes.any, //tabbar style
  headerRespond: PropTypes.bool, //头部是否能响应
  frozeTop: PropTypes.number, //顶部冻结高度
};


//tabbar的props
export const TabProps = {
  tabs: PropTypes.array.isRequired, //数据源
  tabNameConvert: PropTypes.func, //tabbar显示文字转换方法:可以指定数据源tabs中 tabname是直接显示还是经过方法转换,
  averageTab: PropTypes.bool, //tabitem宽度是否均分
  tabsContainerStyle: PropTypes.any, //tabbar容器样式
  activeTextStyle: PropTypes.object, //选中样式
  inactiveTextStyle: PropTypes.object, //未选中样式
}

export const TABVIEW_TABDIDCLICK = 'TABVIEW_TABDIDCLICK'
export const TABVIEW_BECOME_RESPONDER = 'TABVIEW_BECOME_RESPONDER'
export const TABVIEW_HEADER_START = 'TABVIEW_HEADER_START'
export const TABVIEW_HEADER_START_CAPTURE = 'TABVIEW_HEADER_START_CAPTURE'
export const TABVIEW_HEADER_GRANT = 'TABVIEW_HEADER_GRANT'
export const TABVIEW_HEADER_MOVE = 'TABVIEW_HEADER_MOVE'
export const TABVIEW_HEADER_RELEASE = 'TABVIEW_HEADER_RELEASE'
