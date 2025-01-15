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
          transition: all 0.3s;
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
      orbitNumber
    };
  }
  getProgressAngle(full) {
    const {maxAngle, progress, maxValue} = this.getAttributes()
    return full
      ? ((maxValue - 0.00001) / maxValue) * maxAngle
      : (progress / maxValue) * maxAngle;
  }
  calculateArcParameters(full) {
    const arcAngle = this.getProgressAngle(full);
    const {realRadius, arcHeightPercentage, orbitNumber, shape, strokeWidth} = this.getAttributes()
    const radius = realRadius
    let startX, startY, endX, endY, largeArcFlag, startX1, startY1, endX1, endY1, dShape, pointX, pointX1, pointY, pointY1
    let offset = Math.PI / 2
    let stroke = strokeWidth
    let fangle =  arcAngle * Math.PI / 180
    let bigRadius = radius + arcHeightPercentage
    let smallRadius = (radius - arcHeightPercentage) !== 0 ? radius - arcHeightPercentage : radius
    let bigGap = (stroke * 2) / orbitNumber / 2 / bigRadius
    let smallGap = (stroke * 2)  / orbitNumber / 2  / smallRadius
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
    largeArcFlag = arcAngle <= 180 ? 0 : 1;

    let d = `M ${startX},${startY} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${endX},${endY}`
    if (shape === "arrow") d += `L ${(pointX + pointX1) / 2}  ${(pointY + pointY1) / 2} `
    if (shape === "circle" || shape === 'bullet') d += `A ${(arcHeightPercentage)}, ${(arcHeightPercentage)} 0 0 1 ${endX1},${endY1} `
    d += `L ${endX1} ${endY1}`
    d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${startX1},${startY1}`
    if (shape === "circle") d += `A ${(arcHeightPercentage)}, ${(arcHeightPercentage)} 0 0 1 ${startX},${startY} `
    if (shape === "bullet") d += `A ${(arcHeightPercentage)}, ${(arcHeightPercentage)} 0 0 0 ${startX},${startY} `
    if (shape === "arrow") d += `L ${startX1 + 3} ${(startY + startY1) / 2}  `
    d += `Z`
    return { d }
  }
}
