/*
- acomodar variables y propiedades css
- incporar ending shapes
*/
const template = document.createElement('template')
template.innerHTML = `
   <style>
     svg {
       width: 100%;
       height: 100%;
       overflow: visible;
       pointer-events: none;
     }
      svg * {
        pointer-events: stroke;
      }
      .shape-arc {
       fill: transparent;
        stroke: var(--o-color,black);
        stroke-width: 1;
        transition: stroke 0.3s;
        stroke-linejoin: round;
      }
      .text-arc {
        stroke: red;
        stroke-width: 0.2;
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
     <path id="orbitShape" class="shape-arc" shape-rendering="geometricPrecision" vector-effect="non-scaling-stroke" fill="transparent"></path>
     <path id="orbitPath" class="text-arc" shape-rendering="geometricPrecision" vector-effect="non-scaling-stroke" fill="transparent" ></path>
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
    const { shape, realRadius, gap, flip, strokeWithPercentage, strokeWidth, innerOuter, orbitNumber, size} = this.getAttributes()
    const orbitPath = this.shadowRoot.getElementById('orbitPath')
    const orbitShape = this.shadowRoot.getElementById('orbitShape')
    
    const text = this.shadowRoot.querySelector('text')
    const textPath = this.shadowRoot.querySelector('textPath')
    
    const { length, fontSize, textAnchor, fitRange } = this.getTextAttributes()
    const angle = this.calculateAngle()
    const { dShape } = this.calculateArcParameters(angle, realRadius, gap, flip, strokeWithPercentage, strokeWidth, innerOuter, orbitNumber, size)
    const { dPath } = this.calculateTextArcParameters(angle, realRadius, gap, flip, strokeWithPercentage)

    orbitShape.setAttribute('d', dShape)
    orbitPath.setAttribute('d', dPath)

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
      textPath.parentElement.setAttribute('textLength', textPath.getTotalLength())
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
    const shape = this.getAttribute('shape') || 'none'
    const flip = this.hasAttribute('flip') || this.classList.contains('flip')
    const fitRange =
      this.hasAttribute('fit-range') ||
      this.classList.contains('fit-range') ||
      false
    const length = parseFloat(getComputedStyle(this).getPropertyValue('--o-force'))
    const textAnchor = this.getAttribute('text-anchor') || 'middle'
    const fontSize =
      getComputedStyle(this).getPropertyValue('font-size') ||
      getComputedStyle(this).getPropertyValue('--font-size')
    const value = parseFloat(this.getAttribute('value'))
    const range = parseFloat(getComputedStyle(this).getPropertyValue('--o-range') || 360)
    let rawAngle
    let arcAngle
    if (value) {
      arcAngle = this.getProgressAngle(range, value)
      const prevElement = this.previousElementSibling
      const stackOffset = prevElement
        ? parseFloat(getComputedStyle(prevElement).getPropertyValue('--o_stack'))
        : 0
      this.style.setProperty('--o_stack', stackOffset + arcAngle)
      if (stackOffset >= 0 && flip) {
        this.style.setProperty('--o-angle-composite',parseFloat(stackOffset ) + 'deg')
      }

      if (stackOffset > 0 && !flip) {
        this.style.setProperty('--o-angle-composite', parseFloat(stackOffset) + 'deg')
      }
    } else {
      rawAngle = getComputedStyle(this).getPropertyValue('--o-angle')
      arcAngle = calcularExpresionCSS(rawAngle)
    }
    let orbitNumber, size

    orbitNumber = parseFloat(getComputedStyle(this).getPropertyValue('--o-orbit-number'))
    size = parseFloat(getComputedStyle(this).getPropertyValue('--o-size-ratio'))
   
    const strokeWidth = orbitRadius / orbitNumber * size - 1
    const strokeWithPercentage = ((strokeWidth / 2 ) * 100) / orbitRadius / 2
    const gap =  parseFloat(getComputedStyle(this).getPropertyValue('--o-gap'))
    var innerOuter

    if (this.classList.contains('outer-orbit')) {
      innerOuter = strokeWithPercentage
    } else if (this.classList.contains('quarter-outer-orbit')) {
      innerOuter = strokeWithPercentage * -0.5
    } else if (this.classList.contains('inner-orbit')) {
      innerOuter = strokeWithPercentage * -1
    } else if (this.classList.contains('quarter-inner-orbit')) {
      innerOuter = strokeWithPercentage * 0.5
    } else {
      innerOuter = 0
    }
    
    const realRadius = 50 + innerOuter 

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
      strokeWithPercentage,
      innerOuter,
      orbitNumber,
      size
    }
  }

  calculateAngle() {
    const { arcAngle} = this.getAttributes()
    return arcAngle
  }

  getProgressAngle(maxAngle, value) {
    const progress = value
    // not now, but take value com parent o-orbit
    const maxValue = parseFloat(this.getAttribute('max')) || 100
    return (progress / maxValue) * maxAngle
  }

  calculateArcParameters(angle, realRadius, gap,  flip, strokeWithPercentage, strokeWidth, innerOuter, orbitNumber, size) {
    const radiusX = realRadius
    let startX, startY, endX, endY, largeArcFlag, startX1, startY1, endX1, endY1, largeArcFlag1, dShape, pointX, pointX1, pointY, pointY1
    let stroke = 1
    let offset = Math.PI / 2
    let fangle =  angle * Math.PI / 180
    let bigRadius = radiusX + strokeWithPercentage
    let smallRadius = (radiusX - strokeWithPercentage) !== 0 ? radiusX - strokeWithPercentage : radiusX
    let bigGap = (gap + stroke * 2) / orbitNumber / 2 / bigRadius
    const smallGap = (gap + stroke * 2)  / orbitNumber / 2  / smallRadius
    let startAngle = bigGap  - offset
    let endAngle = fangle  - bigGap - offset
    let startAngle1 = smallGap - offset
    let endAngle1 = fangle  - smallGap - offset
    
    // upper arc
    startX = 50 + bigRadius * Math.cos(startAngle );
    startY = 50 + bigRadius * Math.sin(startAngle );
    endX = 50 + bigRadius * Math.cos(endAngle );
    endY = 50 + bigRadius * Math.sin(endAngle );
    pointX = 50 + bigRadius * Math.cos(endAngle + 3 * Math.PI / 180);
    pointY = 50 + bigRadius  * Math.sin(endAngle + 3 * Math.PI / 180);
    // inner arc
    startX1 = 50 + smallRadius * Math.cos(startAngle1 );
    startY1 = 50 + smallRadius * Math.sin(startAngle1 );
    endX1 = 50 + smallRadius * Math.cos(endAngle1 );
    endY1 = 50 + smallRadius * Math.sin(endAngle1 );
    pointX1 = 50 + smallRadius * Math.cos(endAngle1 + 3 * Math.PI / 180);
    pointY1 = 50 + smallRadius * Math.sin(endAngle1 + 3 * Math.PI / 180);
    // Determinación del flag de arco largo
    largeArcFlag = angle <= 180 ? 0 : 1;
// arrow
// L ${(pointX + pointX1) / 2}  ${(pointY + pointY1) / 2} 
// L ${startX1 + 3} ${(startY + startY1) / 2} 


// circle
// A ${(strokeWithPercentage)}, ${(strokeWithPercentage)} 0 0 1 ${endX1},${endY1} 
// A ${(strokeWithPercentage)}, ${(strokeWithPercentage)} 0 0 1 ${startX},${startY}

// bullet
// A ${(strokeWithPercentage)}, ${(strokeWithPercentage)} 0 0 1 ${endX1},${endY1} 
// A ${(strokeWithPercentage)}, ${(strokeWithPercentage)} 0 0 0 ${startX},${startY}
    dShape = `
    M ${startX},${startY} 
    A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${endX},${endY}
    L ${endX1} ${endY1}
    A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${startX1},${startY1}
    Z`;
    
    return { dShape }
  }

  calculateTextArcParameters(angle, realRadius, gap,  flip, strokeWithPercentage) {
    const radiusX = realRadius
    const radiusY = realRadius
    let startX, startY, endX, endY, largeArcFlag, dPath
    let adjustedGap = gap * 0.5

    if (flip) {
      endX = 50 + radiusX * Math.cos((-90 + adjustedGap) * (Math.PI / 180));
      endY = 50 + radiusY * Math.sin((-90 + adjustedGap) * (Math.PI / 180));
      // Coordenadas ajustadas para el final del arco (gap incluido)
      startX = 50 + radiusX * Math.cos(((angle - 90 - adjustedGap) * Math.PI) / 180);
      startY = 50 + radiusY * Math.sin(((angle - 90 - adjustedGap) * Math.PI) / 180);
      // Determinación del flag de arco largo
      largeArcFlag = angle <= 180 ? 0 : 1;
      // Generación del path SVG
      dPath = `M ${startX},${startY} A ${radiusX},${radiusY} 0 ${largeArcFlag} 0 ${endX},${endY}`;
    } else {

      startX = 50 + radiusX * Math.cos((-90 + adjustedGap) * (Math.PI / 180));
      startY = 50 + radiusY * Math.sin((-90 + adjustedGap) * (Math.PI / 180));
      // Coordenadas ajustadas para el final del arco (gap incluido)
      endX = 50 + radiusX * Math.cos(((angle - 90 - adjustedGap) * Math.PI) / 180);
      endY = 50 + radiusY * Math.sin(((angle - 90 - adjustedGap) * Math.PI) / 180);
      // Determinación del flag de arco largo
      largeArcFlag = angle <= 180 ? 0 : 1;
      // Generación del path SVG
      dPath = `M ${startX},${startY} A ${radiusX},${radiusY} 0 ${largeArcFlag} 1 ${endX},${endY}`;
    }
    return { dPath }
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