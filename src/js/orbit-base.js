export class OrbitBase extends HTMLElement {
    constructor() {
     super();
    this.commonProperties = {
      orbitRadius: 0,
      arcHeight: 0,
      realRadius: 0,
      arcAngle: 0,
      shape: 'none',
      arcHeightPercentage: 0,
      orbitNumber: 1,
      size: 1,
      strokeWidth: 1
    };
  }

  getCommonAttributes(element) {
    const orbitRadius = parseFloat(getComputedStyle(element).getPropertyValue('r') || 0);
    const orbitNumber = parseFloat(getComputedStyle(element).getPropertyValue('--o-orbit-number') || 1);
    const size = parseFloat(getComputedStyle(element).getPropertyValue('--o-size-ratio') || 1);
    const strokeWidth = parseFloat(getComputedStyle(element).getPropertyValue('--o-stroke-width') || 1);
    const shape = element.getAttribute('shape') || 'none';
    
    const arcHeight = orbitRadius / orbitNumber * size - strokeWidth + 0.3;
    const arcHeightPercentage = ((arcHeight / 2) * 100) / orbitRadius / 2;
    
    let innerOuter = 0;
    if (element.classList.contains('outer-orbit')) {
      innerOuter = arcHeightPercentage;
    } else if (element.classList.contains('quarter-outer-orbit')) {
      innerOuter = arcHeightPercentage * -0.5;
    } else if (element.classList.contains('inner-orbit')) {
      innerOuter = arcHeightPercentage * -1;
    } else if (element.classList.contains('quarter-inner-orbit')) {
      innerOuter = arcHeightPercentage * 0.5;
    }
    
    const realRadius = 50 + innerOuter;

    return {
      orbitRadius,
      arcHeight,
      realRadius,
      arcAngle: 0, // Se sobrescribe en cada componente
      shape,
      arcHeightPercentage,
      orbitNumber,
      size,
      strokeWidth
    };
  }

  getProgressAngle(maxAngle, value, maxValue = 100) {
    return (value / maxValue) * maxAngle;
  }

  getControlPoint(x, y, x1, y1, direction = "clockwise") {
    const xm = (x + x1) / 2;
    const ym = (y + y1) / 2;
    const dx = x1 - x;
    const dy = y1 - y;

    if (direction === "clockwise") {
      return {
        xc: xm + dy * 0.4,
        yc: ym - dx * 0.4
      };
    }
    
    return {
      xc: xm - dy * 0.4,
      yc: ym + dx * 0.4
    };
  }

  arcPoint(radius, angle, radiusAdjustment = 0, angleOffsetDegrees = 0) {
    const adjustedRadius = radius + radiusAdjustment;
    const adjustedAngle = angle + (angleOffsetDegrees * Math.PI / 180);
    return {
      x: 50 + adjustedRadius * Math.cos(adjustedAngle),
      y: 50 + adjustedRadius * Math.sin(adjustedAngle)
    };
  }

  calculateCommonArcParameters(arcAngle, radius, arcHeightPercentage, orbitNumber, shape, strokeWidth, arcHeight, gap = 0) {
    const offset = Math.PI / 2;
    const fangle = arcAngle * Math.PI / 180;
    const bigRadius = radius + arcHeightPercentage;
    const smallRadius = (radius - arcHeightPercentage) !== 0 ? radius - arcHeightPercentage : radius;
    const bigGap = (gap + strokeWidth * 1.25) / orbitNumber / bigRadius;
    const smallGap = (gap + strokeWidth * 1.25) / orbitNumber / smallRadius;
    const upperAngleStart = bigGap - offset;
    const upperAngleEnd = fangle - bigGap - offset;
    const innerAngleStart = smallGap - offset;
    const innerAngleEnd = fangle - smallGap - offset;
    
    const upperArcStart = this.arcPoint(bigRadius, upperAngleStart);
    const upperArcEnd = this.arcPoint(bigRadius, upperAngleEnd);
    const innerArcStart = this.arcPoint(smallRadius, innerAngleStart);
    const innerArcEnd = this.arcPoint(smallRadius, innerAngleEnd);
    
    const largeArcFlag = arcAngle <= 180 ? 0 : 1;

    return {
      upperArcStart,
      upperArcEnd,
      innerArcStart,
      innerArcEnd,
      largeArcFlag,
      bigRadius,
      smallRadius,
      radius,
      upperAngleStart,
      upperAngleEnd,
      innerAngleStart,
      innerAngleEnd
    };
  }

  generatePathData(shape, params, arcHeight, orbitNumber) {
    let d = '';
    
    switch (shape) {
      case "rounded":
        d = this.generateRoundedPath(params, arcHeight, orbitNumber);
        break;
      case "circle":
      case "circle-a":
      case "bullet":
        d = this.generateCirclePath(params, shape);
        break;
      case "circle-b":
        d = this.generateCircleBPath(params, arcHeight, orbitNumber);
        break;
      case "arrow":
        d = this.generateArrowPath(params, orbitNumber);
        break;
      case "backslash":
      case "slash":
        d = this.generateSlashPath(params, shape, orbitNumber);
        break;
      case "zigzag":
        d = this.generateZigzagPath(params, arcHeight, orbitNumber);
        break;
      default:
        d = this.generateDefaultPath(params);
    }
    
    return d;
  }

  generateRoundedPath(params, arcHeight, orbitNumber) {
    const { upperArcStart, upperArcEnd, innerArcStart, innerArcEnd, bigRadius, smallRadius, largeArcFlag } = params;
    const curve = arcHeight < 10 ? 5 : arcHeight < 5 ? 2.5 : 10;
    
    const newUpperStart = this.arcPoint(bigRadius, params.upperAngleStart, 0, curve / orbitNumber);
    const newUpperEnd = this.arcPoint(bigRadius, params.upperAngleEnd, 0, -curve / orbitNumber);
    const newInnerStart = this.arcPoint(smallRadius, params.innerAngleStart, 0, curve / orbitNumber);
    const newInnerEnd = this.arcPoint(smallRadius, params.innerAngleEnd, 0, -curve / orbitNumber);

    const upperPointStart = this.arcPoint(bigRadius, params.upperAngleStart, -(curve / 2) / orbitNumber, 0);
    const upperPointEnd = this.arcPoint(bigRadius, params.upperAngleEnd, -(curve / 2) / orbitNumber, 0);
    const innerPointStart = this.arcPoint(smallRadius, params.innerAngleStart, (curve / 2) / orbitNumber, 0);
    const innerPointEnd = this.arcPoint(smallRadius, params.innerAngleEnd, (curve / 2) / orbitNumber, 0);

    const Q = this.getControlPoint(newUpperEnd.x, newUpperEnd.y, upperPointEnd.x, upperPointEnd.y);
    const Q1 = this.getControlPoint(innerPointEnd.x, innerPointEnd.y, newInnerEnd.x, newInnerEnd.y);
    const Q2 = this.getControlPoint(newInnerStart.x, newInnerStart.y, innerPointStart.x, innerPointStart.y);
    const Q3 = this.getControlPoint(upperPointStart.x, upperPointStart.y, newUpperStart.x, newUpperStart.y);

    let d = `M ${newUpperStart.x},${newUpperStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${newUpperEnd.x},${newUpperEnd.y}`;
    d += `Q ${Q.xc}, ${Q.yc} ${upperPointEnd.x} ${upperPointEnd.y} `;
    d += `L ${upperPointEnd.x} ${upperPointEnd.y}`;
    d += `L ${innerPointEnd.x} ${innerPointEnd.y}`;
    d += `Q ${Q1.xc}, ${Q1.yc} ${newInnerEnd.x} ${newInnerEnd.y} `;
    d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${newInnerStart.x},${newInnerStart.y}`;
    d += `Q ${Q2.xc}, ${Q2.yc} ${innerPointStart.x} ${innerPointStart.y} `;
    d += `L ${innerPointStart.x} ${innerPointStart.y}`;
    d += `L ${upperPointStart.x} ${upperPointStart.y}`;
    d += ` Q ${Q3.xc}, ${Q3.yc} ${newUpperStart.x} ${newUpperStart.y} `;
    d += ` Z`;
    
    return d;
  }

  // Dentro de la clase OrbitCommon en orbit-common.js

generateCirclePath(params, shape) {
  const { upperArcStart, upperArcEnd, innerArcStart, innerArcEnd, bigRadius, smallRadius, largeArcFlag } = params;
  
  let d = `M ${upperArcStart.x},${upperArcStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${upperArcEnd.x},${upperArcEnd.y}`;
  d += ` A 1,1 0 0 1 ${innerArcEnd.x},${innerArcEnd.y} `;
  d += ` A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${innerArcStart.x},${innerArcStart.y}`;
  d += ` A 1,1 0 0 ${shape === "circle" || shape === "circle-a" ? 1 : 0} ${upperArcStart.x},${upperArcStart.y} `;
  d += ` Z`;
  
  return d;
}

generateCircleBPath(params, arcHeight, orbitNumber) {
  const { upperAngleStart, upperAngleEnd, innerAngleStart, innerAngleEnd, bigRadius, smallRadius, largeArcFlag } = params;
  const segment = arcHeight * 1.36;
  
  const newUpperStart = this.arcPoint(bigRadius, upperAngleStart, 0, segment / orbitNumber);
  const newUpperEnd = this.arcPoint(bigRadius, upperAngleEnd, 0, -segment / orbitNumber);
  const newInnerStart = this.arcPoint(smallRadius, innerAngleStart, 0, segment / orbitNumber);
  const newInnerEnd = this.arcPoint(smallRadius, innerAngleEnd, 0, -segment / orbitNumber);

  let d = `M ${newUpperStart.x},${newUpperStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${newUpperEnd.x},${newUpperEnd.y}`;
  d += ` A 1,1 0 0 1 ${newInnerEnd.x},${newInnerEnd.y} `;
  d += ` A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${newInnerStart.x},${newInnerStart.y}`;
  d += ` A 1,1 0 0 1 ${newUpperStart.x},${newUpperStart.y} `;
  d += ` Z`;
  
  return d;
}

generateArrowPath(params, orbitNumber) {
  const { upperArcStart, upperArcEnd, innerArcStart, innerArcEnd, bigRadius, smallRadius, largeArcFlag, radius } = params;
  
  const middleEnd = this.arcPoint(radius, params.upperAngleEnd, 0, 24 / orbitNumber / 2);
  const middleStart = this.arcPoint(radius, params.upperAngleStart, 0, 24 / orbitNumber / 2);

  let d = `M ${upperArcStart.x},${upperArcStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${upperArcEnd.x},${upperArcEnd.y}`;
  d += `L ${middleEnd.x} ${middleEnd.y}`;
  d += `L ${innerArcEnd.x} ${innerArcEnd.y}`;
  d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${innerArcStart.x}, ${innerArcStart.y}`;
  d += `L ${middleStart.x} ${middleStart.y}`;
  d += `Z`;
  
  return d;
}

generateSlashPath(params, shape, orbitNumber) {
  const { upperAngleStart, upperAngleEnd, innerAngleStart, innerAngleEnd, bigRadius, smallRadius, largeArcFlag } = params;
  
  const newUpperStart = this.arcPoint(bigRadius, upperAngleStart, 0, shape === "backslash" ? 0 : 24 / orbitNumber / 2);
  const newUpperEnd = this.arcPoint(bigRadius, upperAngleEnd, 0, shape === "backslash" ? 0 : 24 / orbitNumber / 2);
  const newInnerStart = this.arcPoint(smallRadius, innerAngleStart, 0, shape === "backslash" ? 24 / orbitNumber / 2 : 0);
  const newInnerEnd = this.arcPoint(smallRadius, innerAngleEnd, 0, shape === "backslash" ? 24 / orbitNumber / 2 : 0);

  let d = `M ${newUpperStart.x},${newUpperStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${newUpperEnd.x},${newUpperEnd.y}`;
  d += `L ${newInnerEnd.x} ${newInnerEnd.y}`;
  d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${newInnerStart.x}, ${newInnerStart.y}`;
  d += `Z`;
  
  return d;
}

generateZigzagPath(params, arcHeight, orbitNumber) {
  const { upperArcStart, upperArcEnd, innerArcStart, innerArcEnd, bigRadius, smallRadius, largeArcFlag, radius } = params;
  
  const s2 = this.arcPoint(radius, params.upperAngleStart, -arcHeight / orbitNumber / 2, 3);
  const s3 = this.arcPoint(radius, params.upperAngleStart, 0 / orbitNumber / 2, 0);
  const s4 = this.arcPoint(radius, params.upperAngleStart, arcHeight / orbitNumber / 2, 3);

  const e2 = this.arcPoint(radius, params.innerAngleEnd, arcHeight / orbitNumber / 2, 3);
  const e3 = this.arcPoint(radius, params.innerAngleEnd, 0 / orbitNumber / 2, 0);
  const e4 = this.arcPoint(radius, params.innerAngleEnd, -arcHeight / orbitNumber / 2, 3);

  let d = `M ${upperArcStart.x},${upperArcStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${upperArcEnd.x},${upperArcEnd.y}`;
  d += `L ${e2.x} ${e2.y}`;
  d += `L ${e3.x} ${e3.y}`;
  d += `L ${e4.x} ${e4.y}`;
  d += `L ${innerArcEnd.x} ${innerArcEnd.y}`;
  d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${innerArcStart.x}, ${innerArcStart.y}`;
  d += `L ${s2.x} ${s2.y}`;
  d += `L ${s3.x} ${s3.y}`;
  d += `L ${s4.x} ${s4.y}`;
  d += `Z`;
  
  return d;
}

generateDefaultPath(params) {
  const { upperArcStart, upperArcEnd, innerArcStart, innerArcEnd, bigRadius, smallRadius, largeArcFlag } = params;
  
  let d = `M ${upperArcStart.x},${upperArcStart.y} A ${bigRadius},${bigRadius} 0 ${largeArcFlag} 1 ${upperArcEnd.x},${upperArcEnd.y}`;
  d += `L ${innerArcEnd.x} ${innerArcEnd.y}`;
  d += `A ${smallRadius},${smallRadius} 0 ${largeArcFlag} 0 ${innerArcStart.x}, ${innerArcStart.y}`;
  d += `Z`;
  
  return d;
}
}