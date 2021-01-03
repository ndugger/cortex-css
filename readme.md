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
    })
})

document.head.append(styleSheet)
```

### Usage With [Cortex](//github.com/ndugger/cortex)
```typescript
import { Component, createElement } from 'cortex'
import { createStyleSheet } from 'glow'

export class Example extends Component {

    protected render() {
        return [
            createElement(HTMLButtonElement, { type: 'submit' },
                createElement(HTMLSlotElement)
            )
        ]
    }
    
    protected theme() {
        return createStyleSheet(this, css => {
            css.selectClass(HTMLButtonElement, css => {
                css.write(`
                    background: blue;
                    color: white;
                `)
                css.selectHover(css => {
                    css.write(`
                        opacity: 0.85;
                    `)
                })
            })
        })
    }
}
```
