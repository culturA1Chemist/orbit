
const template = document.createElement('template')
template.innerHTML = `
   <style>
     :host {
      
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
      .shape-arc {
      fill: black;
        stroke: var(--o-color,black);
        stroke-width:  calc(var(--o-radius) / var(--o-orbit-number) * var(--o-size-ratio, 1));
        stroke-width: 0.7;
        transition: stroke 0.3s;
       
         stroke-linejoin: round;
      }
      .text-arc {
        stroke: transparent;
        stroke-width: 0;
       
      }
      text {
        color: var(--o-text-color, currentcolor);
      }
      textPath {
     
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
     <path id="orbitPath" class="text-arc" shape-rendering="geometricPrecision" vector-effect="non-scaling-stroke" fill="transparent"></path>
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
   // if (shape === 'circle') path.setAttribute('stroke-linecap', 'round')
    
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
          parseFloat(stackOffset ) + 'deg'
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
    let orbitNumber, size
   
    
    orbitNumber = parseFloat(
      getComputedStyle(this).getPropertyValue('--o-orbit-number')
    )
    size = parseFloat(
      getComputedStyle(this).getPropertyValue('--o-size-ratio')
    )
   // calc(var(--o-radius) / var(--o-orbit-number) * var(--o-size-ratio, 1));
    const strokeWidth = orbitRadius / orbitNumber * size - (0.7 / 2 )
    const strokeWithPercentage = ((strokeWidth / 2 ) * 100) / orbitRadius / 2
    const gap =  (parseFloat(getComputedStyle(this).getPropertyValue('--o-gap')) + (0.7/ 2) ) * 2 / orbitNumber * 2 / (size * 2) - (0.7 * 2)  || 0 
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
    const { arcAngle, gap, flip } = this.getAttributes()
    let calculation = flip ? arcAngle : arcAngle
    return calculation
  }

  getProgressAngle(maxAngle, value) {
    const progress = value
    // not now, but take value com parent o-orbit
    const maxValue = parseFloat(this.getAttribute('max')) || 100
    return (progress / maxValue) * maxAngle
  }

  calculateArcParameters(angle, realRadius, gap,  flip, strokeWithPercentage, strokeWidth, innerOuter, orbitNumber, size) {
    const radiusX = realRadius / 1
    const radiusY = realRadius / 1
    let startX, startY, endX, endY, largeArcFlag, startX1, startY1, endX1, endY1, largeArcFlag1, dShape, pointX, pointX1, pointY, pointY1
    let stroke = 0.7
    let adjustedGap = gap * 0.5 -  (gap   * ((strokeWithPercentage - innerOuter) / 100)) 
    const angleGap = gap * 0.5  + (gap  * ((strokeWithPercentage - innerOuter) / 100))
    let adjustedStroke = stroke   -  (stroke  * ((strokeWithPercentage - innerOuter) / 100))
    const angleStroke = stroke * 2 - (stroke / 4 * ((strokeWithPercentage - innerOuter) / 100)) * orbitNumber * 4 / size * 4
    
      // upper arc
      // Coordenadas ajustadas para el inicio del arco (gap incluido)
      startX = 50 + (radiusX + strokeWithPercentage ) * Math.cos((-90 + adjustedStroke + adjustedGap) * (Math.PI / 180));
      startY = 50 + (radiusY + strokeWithPercentage ) * Math.sin((-90 + adjustedStroke + adjustedGap) * (Math.PI / 180));
      // Coordenadas ajustadas para el final del arco (gap incluido)
      endX = 50 + (radiusX + strokeWithPercentage ) * Math.cos(((angle - 90 - adjustedStroke - adjustedGap) * Math.PI) / 180);
      endY = 50 + (radiusY + strokeWithPercentage ) * Math.sin(((angle - 90 - adjustedStroke - adjustedGap) * Math.PI) / 180);
      // Coordenadas ajustadas para el final del arco (gap incluido)
      pointX = 50 + (radiusX + strokeWithPercentage ) * Math.cos(((angle + 3 - 90 - adjustedStroke - adjustedGap) * Math.PI) / 180);
      pointY = 50 + (radiusY + strokeWithPercentage ) * Math.sin(((angle + 3 - 90 - adjustedStroke - adjustedGap) * Math.PI) / 180);
      // Determinación del flag de arco largo
      largeArcFlag = angle <= 180 ? 0 : 1;

      // inner arc
      // Coordenadas ajustadas para el inicio del arco (gap incluido)
      startX1 = 50 + (radiusX - strokeWithPercentage ) * Math.cos((-90 + angleStroke + (angleGap)) * (Math.PI / 180));
      startY1 = 50 + (radiusY - strokeWithPercentage ) * Math.sin((-90 + angleStroke + (angleGap)) * (Math.PI / 180));
      // Coordenadas ajustadas para el final del arco (gap incluido)
      endX1 = 50 + (radiusX - strokeWithPercentage ) * Math.cos(((angle - 90 - angleStroke - (angleGap)) * Math.PI) / 180);
      endY1 = 50 + (radiusY - strokeWithPercentage ) * Math.sin(((angle - 90 - angleStroke - (angleGap)) * Math.PI) / 180);
      // Coordenadas ajustadas para el final del arco (gap incluido)
      pointX1 = 50 + (radiusX - strokeWithPercentage ) * Math.cos(((angle + 3 - 90 - angleStroke - (angleGap)) * Math.PI) / 180);
      pointY1 = 50 + (radiusY - strokeWithPercentage ) * Math.sin(((angle + 3 - 90 - angleStroke - (angleGap)) * Math.PI) / 180);
      // Determinación del flag de arco largo
      largeArcFlag1 = angle <= 180 ? 0 : 1;

      // Generación del path SVG
      /**
      d = `
      M ${startX},${startY} 
      A ${radiusX + strokeWithPercentage},${radiusY + strokeWithPercentage} 0 ${largeArcFlag} 1 ${endX},${endY}
      L ${endX1 + startY1 } ${endY1 + 5} 
      L ${endX1} ${endY1} 
      A ${radiusX - strokeWithPercentage},${radiusY - strokeWithPercentage} 0 ${largeArcFlag1} 0 ${startX1},${startY1}
      L ${startX1  + 5 } ${0}
      Z`;


      L ${(endX + endX1) / 2 + 1} ${(endY + endY1) / 2} 

        L ${startX1  + 1 } ${(startY + startY1) / 2} 


normal
 dShape = `
      M ${startX},${startY} 
      A ${radiusX + strokeWithPercentage},${radiusY + strokeWithPercentage} 0 ${largeArcFlag} 1 ${endX},${endY}
      L ${endX1} ${endY1} 
      A ${radiusX - strokeWithPercentage},${radiusY - strokeWithPercentage} 0 ${largeArcFlag1} 0 ${startX1},${startY1}
      Z`;
    
circulo

dShape = `
      M ${startX},${startY} 
      A ${radiusX + strokeWithPercentage},${radiusY + strokeWithPercentage} 0 ${largeArcFlag} 1 ${endX},${endY}
      A ${(strokeWithPercentage)}, ${(strokeWithPercentage)} 0 0 1 ${endX1},${endY1} 
      A ${radiusX - strokeWithPercentage},${radiusY - strokeWithPercentage} 0 ${largeArcFlag1} 0 ${startX1},${startY1}
      A ${(strokeWithPercentage)}, ${(strokeWithPercentage)} 0 0 1  ${startX},${startY}  // 0 0 0 forma conica
      Z`;

arrow

dShape = `
      M ${startX},${startY} 
      A ${radiusX + strokeWithPercentage},${radiusY + strokeWithPercentage} 0 ${largeArcFlag} 1 ${endX},${endY}
       L ${(pointX + pointX1 ) / 2 }  ${(pointY + pointY1) / 2} 
        L ${endX1} ${endY1} 
      A ${radiusX - strokeWithPercentage},${radiusY - strokeWithPercentage} 0 ${largeArcFlag1} 0 ${startX1},${startY1}
      A ${(strokeWithPercentage)}, ${(strokeWithPercentage)} 0 0 1  ${startX},${startY} 
       L ${startX1  + 3 } ${(startY + startY1) / 2} 
      Z`;


       */
      dShape = `
      M ${startX},${startY} 
      A ${radiusX + strokeWithPercentage},${radiusY + strokeWithPercentage} 0 ${largeArcFlag} 1 ${endX},${endY}
     
       L ${endX1} ${endY1} 
      A ${radiusX - strokeWithPercentage},${radiusY - strokeWithPercentage} 0 ${largeArcFlag1} 0 ${startX1},${startY1}
      
      Z`;
    
    return { dShape }
  }

  calculateTextArcParameters(angle, realRadius, gap,  flip, strokeWithPercentage) {
    const radiusX = realRadius / 1
    const radiusY = realRadius / 1
    let startX, startY, endX, endY, largeArcFlag, dPath
    let adjustedGap = gap * 0.5

    if (flip) {
      // Coordenadas ajustadas para el inicio del arco (gap incluido)
      startX = 50 + radiusX * Math.cos((-90 - adjustedGap) * (Math.PI / 180));
      startY = 50 + radiusY * Math.sin((-90 - adjustedGap) * (Math.PI / 180));
      // Coordenadas ajustadas para el final del arco (gap incluido)
      endX = 50 + radiusX * Math.cos(((270 - angle + adjustedGap) * Math.PI) / 180);
      endY = 50 + radiusY * Math.sin(((270 - angle + adjustedGap) * Math.PI) / 180);
      // Determinación del flag de arco largo
      largeArcFlag = angle <= 180 ? 0 : 1;
      // Generación del path SVG
      dPath = `M ${startX},${startY} A ${radiusX},${radiusY} 0 ${largeArcFlag} 0 ${endX},${endY}`;
    } else {
      // Coordenadas ajustadas para el inicio del arco (gap incluido)
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
