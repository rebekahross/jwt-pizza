# PizzaShop

## Development notes

We use Vite, React, and Tailwind.

### Vite

Create the basic Vite app.

```sh
npm init -y
npm install vite@latest -D
```

Modify `package.json`

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
```

### React

React works out of the box with Vite, but we do need to install the desired React packages. The `index.html` file loads `index.jsx` which then loads the app component (`src/app.jsx`).

```sh
npm install react react-dom react-router-dom
```

### Tailwind

To process the Tailwind css we are going to use `postcss` and `autoprefixer`.

```sh
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

Modify `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['index.html', './src/**/*.{html,js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Create a `main.css` and add the basic Tailwind directives.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Modify `index.html` to include tailwind output.css.

```html
<head>
  ...
  <link href="./main.css" rel="stylesheet" />
</head>
```

Now when you run with `npm run dev` the css will automatically be generated.

## Preline

Added the Tailwind [Preline component library](https://preline.co/) so that I can use all of their nifty nav, slideshow, containers, and cards.

```sh
npm i preline
```

Updated the tailwind config to use preline.

```js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['index.html', './src/**/*.{html,js,jsx}', './node_modules/preline/preline.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('preline/plugin')],
};
```

Import preline into app.jsx.

```js
import 'preline/preline';
```

Initialize components whenever the page location changes.

```js
import { useLocation, Routes, Route, NavLink } from 'react-router-dom';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.HSStaticMethods.autoInit();
  }, [location.pathname]);
  //...
```