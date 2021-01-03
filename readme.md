# glow
CSS Style Sheet Factory DSL

### Description
Glow is a library for generating CSS. It provides a type-safe DSL for creating a heirarchy of selectors and associated rules.

### Installation
```
npm install ndugger/glow --save
```

### Example
```typescript
import { createStyleSheet } from 'glow'

const styleSheet = document.createElement('style')

styleSheet.textContent = createStyleSheet(document.documentElement, css => {
    css.select('button', css => {
        css.write(`
            background: blue;
            color: white;
        `)
        css.selectHover(css => {
            css.write(`
                opacity: 0.85;
            `)
        })
        css.selectNot([ css.selectOnlyChild() ], css => {
            css.write(`
                border: 1px solid red;
            `)
        })
    })
})

document.head.append(styleSheet)
```
