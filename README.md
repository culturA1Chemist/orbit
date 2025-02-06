
<p align="center">
  <a href="http://zumerlab.github.io/orbit-docs">
    <img src="https://raw.githubusercontent.com/zumerlab/orbit-docs/main/public/images/orbithero.gif" width="100%">
  </a>
</p>
<p align="center">
  <a href="https://zumerlab.github.io/orbit-docs" target="_blank"><b>📚 Docs</b></a> •
  <a href="https://github.com/zumerlab/orbit/discussions" target="_blank"><b>💬 Github discussions</b></a> •
  <a href="https://t.me/ZumlyCommunity" target="_blank"><b>🧑‍💻 Telegram group</b></a>
</p>
<p align="center">
  <b>Use Orbit to create amazing radial UIs using CSS only!</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@zumer/orbit"><img src="https://img.shields.io/github/package-json/v/zumerlab/orbit"></a>
</p>

<p align="center">
  <a href="#stay-in-orbit"><b>Get involved</b></a>, 
place your ⭐ in Orbit! <a href="https://github.com/zumerlab/orbit/stargazers"> <img src="https://img.shields.io/github/stars/zumerlab/orbit.svg?label=%E2%98%85%20Stars&logo=-&style=social"></a>
</p>

## Orbit CSS overview

**Orbit** is a CSS framework designed for creating radial layouts. It offers simplicity, effectiveness, ease of use, and tremendous versatility for crafting compelling designs. It offers extensive customization options and supports nesting for building intricate designs tailored to your requirements.

## Why Orbit?

Creating radial UIs generally involves using JavaScript or other programming languages to calculate angles, radii, distances, and more. **Orbit** saves you time and effort by enabling you to build these UIs with just CSS.

## Features

With **Orbit**, you can:

- Build any kind of radial UI using predefined CSS classes that do the heavy lifting.  
- Easily compose simple or complex radial designs by combining **Orbit** elements.  
- Use **Orbit** alongside other traditional CSS frameworks.  
- Get started quickly with our detailed documentation, examples, and guides.  

## Documentation

Learn all about **Orbit** in our [doc site](https://zumerlab.github.io/orbit-docs)!

## What is radial UI?

Radial UI refers to a design paradigm where elements are organized in a circular or radial pattern, diverging from traditional grid-based or linear layouts. This design approach is particularly effective for applications that involve:

- **Circular data visualization:** progress bars, pie charts, multi-level pies, gauges, knobs  
- **Navigation menus and controls:** radial or pie menus, circular scrolling  
- **Dashboards:** smart-home interfaces, car dashboards, infotainment systems  
- **Calendars:** circular layouts for scheduling and event tracking  
- **Creative art and structures:** mandalas, sci-fi-inspired art, chemical structures  
- **Interactive interfaces:** watch faces, dynamic controls for games or tools  

**Characteristics:**

- **Circular layout:** elements are arranged in a circular or curved pattern.  
- **Center-focused:** the center often serves as a focal point.  
- **Symmetry:** radial UIs frequently exhibit symmetry, fostering a sense of balance.  
- **Angular relationships:** elements are positioned at specific angles relative to one another.  

**Benefits:**

- **Aesthetics:** radial designs are visually striking and engaging.  
- **Intuitive navigation:** circular layouts simplify navigation and reduce cognitive load.  
- **Space efficiency:** radial UIs make efficient use of available screen, ideal for both compact and expansive interfaces.  

## Installation

**Orbit** comes with just two files: `orbit.css` (or `orbit.min.css`) and `orbit.js` (or `orbit.min.js`).

### Obtaining the Orbit files

You can get **Orbit** files in three ways:  

#### 1. Download the files

- Download the **CSS file:** [orbit.css](https://unpkg.com/@zumer/orbit@latest/dist/orbit.css) or [orbit.min.css](https://unpkg.com/@zumer/orbit@latest/dist/orbit.min.css).  
- Download the **JS file:** [orbit.js](https://unpkg.com/@zumer/orbit@latest/dist/orbit.js) or [orbit.min.js](https://unpkg.com/@zumer/orbit@latest/dist/orbit.min.js).  

#### 2. Use a CDN

- **CSS:**  
  Uncompressed: [orbit.css](https://unpkg.com/@zumer/orbit@latest/dist/orbit.css)  
  Minified: [orbit.min.css](https://unpkg.com/@zumer/orbit@latest/dist/orbit.min.css)  

- **JS:**  
  Uncompressed: [orbit.js](https://unpkg.com/@zumer/orbit@latest/dist/orbit.js)  
  Minified: [orbit.min.js](https://unpkg.com/@zumer/orbit@latest/dist/orbit.min.js)  

#### 3. Install via npm or yarn

```sh
npm install @zumer/orbit
```

or

```sh
yarn add @zumer/orbit
```

### Adding Orbit to your project

Include the files in your project as follows:

```html
<head>
  <link rel="stylesheet" href="path/to/orbit.css">
  <script src="path/to/orbit.js"></script>
</head>
```

Or via CDN:

```html
<head>
  <link rel="stylesheet" href="https://unpkg.com/@zumer/orbit@latest/dist/orbit.css">
  <script src="https://unpkg.com/@zumer/orbit@latest/dist/orbit.js"></script>
</head>
```

## 🏁 Quick start

```html
<div class="bigbang">
  <div class="gravity-spot">
    <div class="orbit-2 range-180 from-180">
      <o-arc shape="circle" class="shrink-50"></o-arc>
    </div>
    <div class="orbit-3 range-270 ">
      <o-arc shape="circle" class="shrink-50"></o-arc>
    </div>
  </div>
</div>
```

## Examples

- **A dashboard**  
  ![demo1](https://raw.githubusercontent.com/zumerlab/orbit-docs/main/public/images/demo1.png)  

- **A watch**  
  ![demo3](https://raw.githubusercontent.com/zumerlab/orbit-docs/main/public/images/demo3.png)  

Explore more examples in our [doc site](https://zumerlab.github.io/orbit-docs/examples/progress).

## Stay in Orbit

There are many ways to **contribute** to **Orbit** development:

- [**Contribution guidelines**](https://github.com/zumerlab/orbit/blob/main/CONTRIBUTING.md): This guide outlines how you can contribute to Orbit, help us test and improve it, and share your experiences with the community.
- [**GitHub discussions**](https://github.com/zumerlab/orbit/discussions): Engage with other contributors, ask questions, and share your experiences.
- [**Telegram group**](https://t.me/ZumlyCommunity): Join our Telegram group for real-time discussions and updates.

## Special thanks to our contributors

<a href="https://github.com/zumerlab/orbit-docs/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=zumerlab/orbit-docs" />
</a>

## License 

[MIT](https://github.com/zumerlab/orbit/blob/main/LICENSE)
