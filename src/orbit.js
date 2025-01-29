import { OrbitProgress } from './js/orbit-progress.js'
import { OrbitArc } from './js/orbit-arc.js'
import { Orbit } from './js/orbit-resize.js'

// To prevent re-registration attemps in some environments such as CodeSandBox
if (!customElements.get('o-progress')) {
    customElements.define("o-progress", OrbitProgress);
  }
if (!customElements.get('o-arc')) {
    customElements.define("o-arc", OrbitArc);
}

window.Orbit = Orbit
