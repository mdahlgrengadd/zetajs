# ZetaJS Word Editor - React Demo

A fully self-contained ZetaJS word editor application built with React, shadcn/ui, and Tailwind CSS. This is a standalone word processor focused on text editing and formatting functionality.

[online demo](https://zetaoffice.net/demos/word-editor-react/)

**Key Features:**

- Responsive word editor canvas that adapts to browser window size
- Enhanced toolbar with formatting controls (Bold, Italic, Underline, Font Size, etc.)
- File upload and save functionality
- Self-contained - no external dependencies on parent ZetaJS project
- Clean, modern UI with shadcn/ui components

For React development you'll need nodejs and npm.

## Project Setup

Install the dependencies:

```sh
npm install
```

This project is fully self-contained and includes all necessary ZetaJS runtime files.

### Compile and Hot-Reload for Development

```sh
npm start
```

### Compile and Minify for Production

```sh
npm run build
```

The following HTTP headers must be set in the web server configuration:

```text
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
