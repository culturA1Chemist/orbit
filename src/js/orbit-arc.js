
const template = document.createElement('template')
template.innerHTML = `
   <style>
     :host {
       display: inline-block;
     }
     svg {
       width: 100%;
       height: 100%;
       overflow: visible;
       pointer-events: none;
     }
      svg * {
        pointer-events: stroke;
      }
      .arc {
        stroke: var(--o-color, transparent);
        stroke-width:  calc(var(--o-radius) / var(--o-orbit-number) * var(--o-size-ratio, 1));
        transition: stroke 0.3s;
      }
      text {
        color: var(--o-text-color, currentcolor);
      }
      :host(:hover) text {
        color: var(--o-hover-text-color, var(--o-text-color));
      }
      :host(:hover) .arc {
        stroke: var(--o-hover-color, var(--o-color));
      }
   </style>
   <svg viewBox="0 0 100 100">
     <defs></defs>
     <path id="orbitPath" class="arc" vector-effect="non-scaling-stroke" fill="transparent"></path>
     <text>
        <textPath href="#orbitPath"  alignment-baseline="middle"></textPath>
      </text>
   </svg>
 `

export class OrbitArc extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    this.update()

    this.observer = new MutationObserver((mutations) => {
      this.observer.disconnect()
      mutations.forEach((mutation) => {
        this.update()
      })
      this.observer.observe(this, { attributes: true, childList: true })
    })

    this.observer.observe(this, { attributes: true, childList: true })
  }

  update() {
    const { shape, realRadius, gap, flip } = this.getAttributes()
    const path = this.shadowRoot.getElementById('orbitPath')
    const defs = this.shadowRoot.querySelector('defs')
    const text = this.shadowRoot.querySelector('text')
    const textPath = this.shadowRoot.querySelector('textPath')
    if (shape === 'circle') path.setAttribute('stroke-linecap', 'round')
    if (
      shape !== 'none' &&
      shape !== 'circle' &&
      CSS.supports('fill', 'context-stroke')
    ) {
      defs.innerHTML = '' // Limpiar defs previos
      defs.appendChild(this.createMarker('head', 'end'))
      defs.appendChild(this.createMarker('tail', 'start'))
      path.setAttribute('marker-end', 'url(#head)')
      path.setAttribute('marker-start', 'url(#tail)')
    }
    const { length, fontSize, textAnchor, fitRange } = this.getTextAttributes()

    const angle = this.calculateAngle()
    const { d } = this.calculateArcParameters(angle, realRadius, gap, flip)

    path.setAttribute('d', d)

    if (textAnchor === 'start') {
      textPath.setAttribute('startOffset', '0%')
      textPath.setAttribute('text-anchor', 'start')
    } else if (textAnchor === 'middle') {
      textPath.setAttribute('startOffset', '50%')
      textPath.setAttribute('text-anchor', 'middle')
    } else if (textAnchor === 'end') {
      textPath.setAttribute('startOffset', '100%')
      textPath.setAttribute('text-anchor', 'end')
    }

    if (fitRange) {
      textPath.parentElement.setAttribute('textLength', path.getTotalLength())
    }

    text.style.fontSize = `calc(${fontSize} * (100 / (${length}) * (12 /  var(--o-orbit-number) ))`
    textPath.textContent = this.textContent

  }

  getTextAttributes() {
    const { length, fontSize, textAnchor, fitRange } = this.getAttributes()
    return { length, fontSize, textAnchor, fitRange }
  }

  getAttributes() {
    const orbitRadius = parseFloat(
      getComputedStyle(this).getPropertyValue('r') || 0
    )
    const gap = parseFloat(
      getComputedStyle(this).getPropertyValue('--o-gap') || 0.001
    )
    const shape = this.getAttribute('shape') || 'none'
    const flip = this.hasAttribute('flip') || this.classList.contains('flip')
    const fitRange =
      this.hasAttribute('fit-range') ||
      this.classList.contains('fit-range') ||
      false
    const length = parseFloat(
      getComputedStyle(this).getPropertyValue('--o-force')
    )
    const textAnchor = this.getAttribute('text-anchor') || 'middle'
    const fontSize =
      getComputedStyle(this).getPropertyValue('font-size') ||
      getComputedStyle(this).getPropertyValue('--font-size')
    const value = parseFloat(this.getAttribute('value'))
    const range = parseFloat(
      getComputedStyle(this).getPropertyValue('--o-range') || 360
    )
    let rawAngle
    let arcAngle
    if (value) {
      arcAngle = this.getProgressAngle(range, value)

      const prevElement = this.previousElementSibling
      const stackOffset = prevElement
        ? parseFloat(
            getComputedStyle(prevElement).getPropertyValue('--o_stack')
          )
        : 0
      this.style.setProperty('--o_stack', stackOffset + arcAngle)
      if (stackOffset >= 0 && flip) {
        this.style.setProperty(
          '--o-angle-composite',
          parseFloat(stackOffset + arcAngle) + 'deg'
        )
      }

      if (stackOffset > 0 && !flip) {
        this.style.setProperty(
          '--o-angle-composite',
          parseFloat(stackOffset) + 'deg'
        )
      }
    } else {
      rawAngle = getComputedStyle(this).getPropertyValue('--o-angle')
      arcAngle = calcularExpresionCSS(rawAngle)
    }
    const strokeWidth = parseFloat(
      getComputedStyle(this).getPropertyValue('stroke-width') || 1
    )
    const strokeWithPercentage = ((strokeWidth / 2) * 100) / orbitRadius / 2
    let innerOuter = strokeWithPercentage

    if (this.classList.contains('outer-orbit')) {
      innerOuter = strokeWithPercentage * 2
    }
    if (this.classList.contains('quarter-outer-orbit')) {
      innerOuter = strokeWithPercentage * 1.75
    }
    if (this.classList.contains('inner-orbit')) {
      innerOuter = 0
    }
    if (this.classList.contains('quarter-inner-orbit')) {
      innerOuter = strokeWithPercentage * 0.75
    }

    const realRadius = 50 + innerOuter - strokeWithPercentage

    return {
      orbitRadius,
      strokeWidth,
      realRadius,
      gap,
      arcAngle,
      shape,
      length,
      fontSize,
      flip,
      fitRange,
      textAnchor,
    }
  }

  calculateAngle() {
    const { arcAngle, gap } = this.getAttributes()
    return arcAngle - gap
  }

  getProgressAngle(maxAngle, value) {
    const progress = value
    // not now, but take value com parent o-orbit
    const maxValue = parseFloat(this.getAttribute('max')) || 100
    return (progress / maxValue) * maxAngle
  }

  calculateArcParameters(angle, realRadius, gap, flip) {
    const radiusX = realRadius / 1
    const radiusY = realRadius / 1
    let startX, startY, endX, endY, largeArcFlag, d

    if (flip) {
      startX = 50 - gap + radiusX * Math.cos(-Math.PI / 2)
      startY = 50 + radiusY * Math.sin(-Math.PI / 2)
      endX = 50 + radiusX * Math.cos(((270 - angle) * Math.PI) / 180)
      endY = 50 + radiusY * Math.sin(((270 - angle) * Math.PI) / 180)
      largeArcFlag = angle <= 180 ? 0 : 1
      d = `M ${startX},${startY} A ${radiusX},${radiusY} 0 ${largeArcFlag} 0 ${endX},${endY}`
    } else {
      startX = 50 + gap + radiusX * Math.cos(-Math.PI / 2)
      startY = 50 + radiusY * Math.sin(-Math.PI / 2)
      endX = 50 + radiusX * Math.cos(((angle - 90) * Math.PI) / 180)
      endY = 50 + radiusY * Math.sin(((angle - 90) * Math.PI) / 180)
      largeArcFlag = angle <= 180 ? 0 : 1
      d = `M ${startX},${startY} A ${radiusX},${radiusY} 0 ${largeArcFlag} 1 ${endX},${endY}`
    }
    return { d }
  }

  createMarker(id, position = 'end') {
    const { shape } = this.getAttributes()
    const marker = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'marker'
    )
    marker.setAttribute('id', id)
    marker.setAttribute('viewBox', '0 0 10 10')
    position === 'start' && shape !== 'circle'
      ? marker.setAttribute('refX', '2')
      : position === 'start' && shape === 'circle'
      ? marker.setAttribute('refX', '5')
      : marker.setAttribute('refX', '0.1')
    marker.setAttribute('refY', '5')
    marker.setAttribute('markerWidth', '1')
    marker.setAttribute('markerHeight', '1')
    marker.setAttribute('orient', 'auto')
    marker.setAttribute('markerUnits', 'strokeWidth')
    marker.setAttribute('fill', 'context-stroke')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const shapes = {
      arrow: {
        head: 'M 0 0 L 2 5 L 0 10 z',
        tail: 'M 2 0 L 0 0 L 1 5 L 0 10 L 2 10 L 2 5 z',
      },
      slash: {
        head: 'M 0 0 L 0 0 L 1 5 L 2 10 L 0 10 L 0 5 z',
        tail: 'M 2 0 L 0 0 L 1 5 L 2 10 L 2 10 L 2 5 z',
      },
      backslash: {
        head: 'M 0 0 L 2 0 L 1 5 L 0 10 L 0 10 L 0 5 z',
        tail: 'M 2 0 L 2 0 L 1 5 L 0 10 L 2 10 L 2 5 z',
      },
      circle: {
        head: 'M 0 0 C 7 0 7 10 0 10 z',
        tail: 'M 6 0 C -1 0 -1 10 6 10 z',
      },
      zigzag: {
        head: 'M 1 0 L 0 0 L 0 5 L 0 10 L 1 10 L 2 7 L 1 5 L 2 3 z',
        tail: 'M 0 0 L 2 0 L 2 5 L 2 10 L 0 10 L 1 7 L 0 5 L 1 3 z',
      },
    }
    position === 'end'
      ? path.setAttribute('d', shapes[shape].head)
      : path.setAttribute('d', shapes[shape].tail)

    marker.appendChild(path)

    return marker
  }
}

function calcularExpresionCSS(cssExpression) {
  const match = cssExpression.match(
    /calc\(\s*([\d.]+)deg\s*\/\s*\(\s*(\d+)\s*-\s*(\d+)\s*\)\s*\)/
  )
  if (match) {
    const value = parseFloat(match[1])
    const divisor = parseInt(match[2]) - parseInt(match[3])
    if (!isNaN(value) && !isNaN(divisor) && divisor !== 0) {
      return value / divisor
    }
  }
}
