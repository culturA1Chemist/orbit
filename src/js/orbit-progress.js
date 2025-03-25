export class OrbitProgress extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
        --o-fill: var(--o-gray-light);
        --o-stroke: var(--o-fill);
        --o-stroke-width: 1;
        --o-back-fill: transparent;
        --o-back-stroke: none;
        --o-back-stroke-width: 1;
      }
      :host(:hover){
        --o-fill: var(--o-gray-light);
        --o-stroke: var(--o-fill);
        --o-stroke-width: 1;
        --o-back-fill: transparent;
        --o-back-stroke: none;
        --o-back-stroke-width: 1;
      }
      svg {
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
        }
        svg * {
          pointer-events: visiblePainted;
        }
        .progress-bar {
          fill: var(--o-fill);
          stroke: var(--o-stroke);
          stroke-width: var(--o-stroke-width);
          transition: fill 0.25s, stroke 0.25s;
          stroke-linejoin: round;
        }
        .progress-bg {
          fill: var(--o-back-fill);
          stroke: var(--o-back-stroke);
          stroke-width: var(--o-back-stroke-width);
        }
      </style>
      <svg viewBox="0 0 100 100">
        <path class="progress-bg" shape-rendering="geometricPrecision" vector-effect="non-scaling-stroke"></path>
        <path class="progress-bar" shape-rendering="geometricPrecision" vector-effect="non-scaling-stroke"></path>
      </svg>
    `
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
    const progressBg = this.shadowRoot.querySelector('.progress-bg');
    const progressBar = this.shadowRoot.querySelector('.progress-bar');
    this.updateArc(progressBg, true);
    this.updateArc(progressBar, false);
  }
  updateArc(arc, full) {
    const { d } = this.calculateArcParameters(full);
    arc.setAttribute('d', d);
  }
  getAttributes() {
    const orbitRadius = parseFloat(getComputedStyle(this).getPropertyValue('r') || 0);
    let orbitNumber = parseFloat(getComputedStyle(this).getPropertyValue('--o-orbit-number'))
    let size = parseFloat(getComputedStyle(this).getPropertyValue('--o-size-ratio'))
    const range = parseFloat(getComputedStyle(this).getPropertyValue('--o-range') || 360);
    const progress = parseFloat( getComputedStyle(this).getPropertyValue('--o-progress') || this.getAttribute('value') || 0);
    const shape = this.getAttribute('shape') || 'none';
    const strokeWidth = parseFloat(getComputedStyle(this).getPropertyValue('--o-stroke-width'))
    const arcHeight = orbitRadius / orbitNumber * size - strokeWidth + 0.3 // 0.3 tries to fix bug when render arcs
    const arcHeightPercentage = ((arcHeight / 2 ) * 100) / orbitRadius / 2
    const maxAngle = range;
    const maxValue = parseFloat(this.getAttribute('max')) || 100;
    let innerOuter
    if (this.classList.contains('outer-orbit')) {
      innerOuter = arcHeightPercentage
    } else if (this.classList.contains('quarter-outer-orbit')) {
      innerOuter = arcHeightPercentage * -0.5
    } else if (this.classList.contains('inner-orbit')) {
      innerOuter = arcHeightPercentage * -1
    } else if (this.classList.contains('quarter-inner-orbit')) {
      innerOuter = arcHeightPercentage * 0.5
    } else {
      innerOuter = 0
    }
    const realRadius = 50 + innerOuter
    return {
      orbitRadius,
      progress,
      strokeWidth,
      realRadius,
      maxAngle,
      maxValue,
      shape,
      arcHeightPercentage,
      orbitNumber,
      arcHeight
    };
  }
  getProgressAngle(full) {
    const {maxAngle, progress, maxValue} = this.getAttributes()
    return full
      ? ((maxValue - 0.00001) / maxValue) * maxAngle
      : (progress / maxValue) * maxAngle;
  }


  getControlPoint(x, y, x1, y1, direction = "clockwise") {
    // Punto medio
    let xm = (x + x1) / 2;
    let ym = (y + y1) / 2;

    // Vector del segmento
    let dx = x1 - x;
    let dy = y1 - y;

    // Determinar el punto de control según el sentido de la curva
    let xc, yc;
    if (direction === "clockwise") {
        xc = xm + dy * 0.4;   // Giro horario (90°)
        yc = ym - dx * 0.4;  
    } else {
        xc = xm - dy * 0.4;     // Giro antihorario (-90°)
        yc = ym + dx * 0.4;
    }

    return { xc, yc };
}

 arcPoint(radius, angle, radiusAdjustment = 0, angleOffsetDegrees = 0) {
      const adjustedRadius = radius + radiusAdjustment;
      const adjustedAngle = angle + (angleOffsetDegrees * Math.PI / 180);
      return {
        x: 50 + adjustedRadius * Math.cos(adjustedAngle),
        y: 50 + adjustedRadius * Math.sin(adjustedAngle)
      };
    }

  calculateArcParameters(full) {
    const arcAngle = this.getProgressAngle(full);
    const {realRadius, arcHeightPercentage, orbitNumber, shape, strokeWidth, arcHeight} = this.getAttributes()
    const radius = realRadius
    let largeArcFlag, d
    let offset = Math.PI / 2
    let stroke = strokeWidth
    let fangle =  arcAngle * Math.PI / 180
    let bigRadius = radius + arcHeightPercentage
    let smallRadius = (radius - arcHeightPercentage) !== 0 ? radius - arcHeightPercentage : radius
    let bigGap = (stroke * 1.25)  / orbitNumber / bigRadius
    let smallGap = (stroke * 1.25)  / orbitNumber / smallRadius
    let upperAngleStart  = bigGap  - offset
    let upperAngleEnd  = fangle  - bigGap - offset
    let innerAngleStart = smallGap - offset
    let innerAngleEnd = fangle  - smallGap - offset
    
    // upper arc
    let upperArcStart = this.arcPoint(bigRadius, upperAngleStart)
    let upperArcEnd = this.arcPoint(bigRadius,upperAngleEnd)
    
    // inner arc
    let innerArcStart  = this.arcPoint(smallRadius, innerAngleStart)
    let innerArcEnd  = this.arcPoint(smallRadius, innerAngleEnd)
    
    largeArcFlag = arcAngle <= 180 ? 0 : 1;


    if (shape === "rounded") {
      let curve = arcHeight < 10 ? 5 : arcHeight < 5 ? 2.5 : 10
      let newUpperStart = this.arcPoint(bigRadius,upperAngleStart, 0, (curve) / orbitNumber)
      let newUpperEnd = this.arcPoint(bigRadius,upperAngleEnd, 0, -(curve) / orbitNumber)
      let newInnerStart  = this.arcPoint(smallRadius, innerAngleStart , 0, (curve) / orbitNumber)
      let newInnerEnd  = this.arcPoint(smallRadius, innerAngleEnd , 0, -(curve) / orbitNumber)

      let upperPointStart = this.arcPoint(bigRadius, upperAngleStart, -(curve / 2  ) / orbitNumber, 0)
      let upperPointEnd  = this.arcPoint(bigRadius, upperAngleEnd, -(curve / 2  ) / orbitNumber, 0)
      let innerPointStart = this.arcPoint(smallRadius, innerAngleStart, (curve / 2  ) / orbitNumber, 0)
      let innerPointEnd = this.arcPoint(smallRadius, innerAngleEnd, (curve / 2  ) / orbitNumber, 0)

      let Q = this.getControlPoint(newUpperEnd.x, newUpperEnd.y, upperPointEnd.x, upperPointEnd.y)
      let Q1 = this.getControlPoint(innerPointEnd.x, innerPointEnd.y, newInnerEnd.x,newInnerEnd.y)
      let Q2 = this.getControlPoint(newInnerStart.x,  newInnerStart.y, innerPointStart.x, innerPointStart.y)
      let Q3 = this.getControlPoint( upperPointStart.x,  upperPointStart.y, newUpperStart.x,newUpperStart.y)

      d  = `M ${newUpperStart.x},${newUpperStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${newUpperEnd.x},${newUpperEnd.y}`
      d += `Q ${Q.xc}, ${Q.yc} ${upperPointEnd.x}  ${upperPointEnd.y} `
      d += `L ${upperPointEnd.x} ${upperPointEnd.y}`
      d += `L ${innerPointEnd.x} ${innerPointEnd.y}`
      d += `Q ${Q1.xc}, ${Q1.yc} ${newInnerEnd.x} ${newInnerEnd.y} `
     
      d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${newInnerStart.x},${ newInnerStart.y}`
      d += `Q ${Q2.xc}, ${Q2.yc} ${innerPointStart.x}  ${innerPointStart.y} `
      d += `L ${innerPointStart.x} ${innerPointStart.y}`
      d += `L ${ upperPointStart.x} ${ upperPointStart.y}`
      d += ` Q ${Q3.xc}, ${Q3.yc} ${newUpperStart.x} ${newUpperStart.y} `
      d += ` Z`
    } else if (shape === "circle" || shape === "circle-a" || shape === "bullet") {
      d  = `M ${upperArcStart.x},${upperArcStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${upperArcEnd.x},${upperArcEnd.y}`
      d += ` A 1,1 0 0 1 ${innerArcEnd.x},${innerArcEnd.y} `
      d += ` A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${innerArcStart.x},${ innerArcStart.y}`
      d += ` A 1,1 0 0 ${shape === "circle" || shape === "circle-a" ? 1 : 0} ${upperArcStart.x},${upperArcStart.y} `
      d += ` Z`
    } else if (shape === "circle-b") {
      let segment =  arcHeight * 1.36
      let newUpperStart = this.arcPoint(bigRadius,upperAngleStart, 0, ((segment)) / orbitNumber)
      let newUpperEnd = this.arcPoint(bigRadius,upperAngleEnd, 0, -(((segment)) / orbitNumber))
      let newInnerStart = this.arcPoint(smallRadius,innerAngleStart, 0, ((segment)) / orbitNumber)
      let newInnerEnd = this.arcPoint(smallRadius,innerAngleEnd, 0, -(((segment)) / orbitNumber))
      d  = `M ${newUpperStart.x},${newUpperStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${newUpperEnd.x},${newUpperEnd.y}`
      d += ` A 1,1 0 0 1 ${newInnerEnd.x},${newInnerEnd.y} `
      d += ` A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${newInnerStart.x},${ newInnerStart.y}`
      d += ` A 1,1 0 0 1 ${newUpperStart.x},${newUpperStart.y} `
      d += ` Z`
    } else if (shape === "arrow") {
      let middleEnd = this.arcPoint(radius, upperAngleEnd, 0, 24 / orbitNumber / 2)
      let middleStart = this.arcPoint(radius, upperAngleStart, 0, 24 / orbitNumber / 2)
      d  = `M ${upperArcStart.x},${upperArcStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${upperArcEnd.x},${upperArcEnd.y}`
      d += `L ${middleEnd.x} ${middleEnd.y}`
      d += `L ${innerArcEnd.x} ${innerArcEnd.y}`
      d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${innerArcStart.x}, ${innerArcStart.y}`
      d += `L ${middleStart.x} ${middleStart.y}  `
      d += `Z`
    } else if (shape === "backslash" || shape === "slash") {
      let newUpperStart = this.arcPoint(bigRadius,upperAngleStart, 0, shape === "backslash" ? 0 : 24 / orbitNumber / 2)
      let newUpperEnd = this.arcPoint(bigRadius,upperAngleEnd, 0, shape === "backslash" ? 0 : 24 / orbitNumber / 2)
      let newInnerStart = this.arcPoint(smallRadius,innerAngleStart, 0, shape === "backslash" ? 24 / orbitNumber / 2 : 0)
      let newInnerEnd = this.arcPoint(smallRadius,innerAngleEnd, 0, shape === "backslash" ? 24 / orbitNumber / 2 : 0)
      d  = `M ${newUpperStart.x},${newUpperStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${newUpperEnd.x},${newUpperEnd.y}`
      d += `L ${newInnerEnd.x} ${newInnerEnd.y}`
      d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${newInnerStart.x}, ${newInnerStart.y}`
      d += `Z`
    } else if (shape === "zigzag") {
      let s2 = this.arcPoint(radius, upperAngleStart,  -arcHeight  / orbitNumber / 2, 3)
      let s3 = this.arcPoint(radius, upperAngleStart,  0  / orbitNumber / 2, 0)
      let s4 = this.arcPoint(radius, upperAngleStart, arcHeight   / orbitNumber / 2, 3)

      let e2 = this.arcPoint(radius, innerAngleEnd, arcHeight   / orbitNumber / 2, 3)
      let e3 = this.arcPoint(radius, innerAngleEnd, 0  / orbitNumber / 2, 0)
      let e4 = this.arcPoint(radius, innerAngleEnd,-arcHeight   / orbitNumber / 2, 3)
   
      d  = `M ${upperArcStart.x},${upperArcStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${upperArcEnd.x},${upperArcEnd.y}`
      d += `L ${e2.x} ${e2.y}`
      d += `L ${e3.x} ${e3.y}`
      d += `L ${e4.x} ${e4.y}`
      d += `L ${innerArcEnd.x} ${innerArcEnd.y}`
      d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${innerArcStart.x}, ${innerArcStart.y}`
      d += `L ${s2.x} ${s2.y}`
      d += `L ${s3.x} ${s3.y}`
      d += `L ${s4.x} ${s4.y}`
      d += `Z`
    } else {
      d  = `M ${upperArcStart.x},${upperArcStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${upperArcEnd.x},${upperArcEnd.y}`
      d += `L ${innerArcEnd.x} ${innerArcEnd.y}`
      d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${innerArcStart.x}, ${innerArcStart.y}`
      d += `Z`
    }
    return { d }
  }
}
