import Loadable from '@loadable/component'
import ComponentLoader from '../loader/ComponentLoader.js'

const LoadableStatusPage = Loadable(() => import('./StatusPage'),
  { fallback: <ComponentLoader/> }
)

export default LoadableStatusPage
