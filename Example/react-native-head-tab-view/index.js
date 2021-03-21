import { ScrollView, FlatList, SectionList } from 'react-native'
import createCollapsibleScrollView from './createCollapsibleScrollView'
export { HeaderContext } from './HeaderContext'
export { default as GestureContainer } from './GestureContainer'

const HScrollView = createCollapsibleScrollView(ScrollView)
const HFlatList = createCollapsibleScrollView(FlatList)
const HSectionList = createCollapsibleScrollView(SectionList)
export { HScrollView, HFlatList, HSectionList }