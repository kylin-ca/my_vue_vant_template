// 按需全局引入 vant组件
import Vue from 'vue'
import { Button, List, Cell, Tabbar, TabbarItem,Tab, Tabs, AddressEdit, CellGroup, Checkbox, Radio, RadioGroup,Icon,  PullRefresh } from 'vant'
Vue.use(Button)
Vue.use(Cell)
Vue.use(List)
Vue.use(Tab)
Vue.use(Tabs)
Vue.use(Tabbar).use(TabbarItem).use(AddressEdit).use(CellGroup).use(Checkbox).use(Radio).use(RadioGroup).use(Icon).use(PullRefresh)