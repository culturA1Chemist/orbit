import { OrbitProgress } from './js/orbit-progress.js'
import { OrbitArc } from './js/orbit-arc.js'
import { Orbit } from './js/orbit-resize.js'

customElements.define('o-progress', OrbitProgress)
customElements.define('o-arc', OrbitArc)

window.Orbit = Orbit
