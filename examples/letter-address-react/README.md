# A ZetaJS Word Editor (Writer Demo using React + shadcn/ui + Tailwind CSS)

An example of a Web word processor demo, using a stripped-down, standalone Writer document canvas
without any surrounding menubars, toolbars, side panels, etc. This version uses React with shadcn/ui components and Tailwind CSS for styling.

[online demo](https://zetaoffice.net/demos/word-editor-react/)

For React development you'll need nodejs and npm.

# React + shadcn/ui + Tailwind CSS

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

First, install the dependencies:

```sh
npm install
```

The project includes an automatic build step that copies the required ZetaJS files from the main source directory. This happens automatically when you run any of the development or build commands.

### Compile and Hot-Reload for Development

```sh
npm start
```

### Compile and Minify for Production

```sh
npm run build
```

The following HTTP headers must be set in the web server configuration.
```
Cross-Origin-Opener-Policy "same-origin"
Cross-Origin-Embedder-Policy "require-corp"
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Technologies Used

- **React 18**: Modern React with functional components and hooks
- **TypeScript**: Type-safe development
- **shadcn/ui**: Beautiful, accessible UI components built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Vite**: Fast build tool and development server
- **Lucide React**: Beautiful icons
