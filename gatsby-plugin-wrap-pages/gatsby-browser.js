import { wrapPageElement, renewRenderCycle } from './wrap-pages'

const onPreRouteUpdate = renewRenderCycle

export { wrapPageElement, onPreRouteUpdate }
