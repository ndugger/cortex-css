const styleSheets = new WeakMap<Element, StyleSheetFactory>()

enum Combinators {
    Adjacent = '+',
    Child = '>',
    Class = '.',
    Descendant = ' ',
    Id = '#',
    None = '',
    PseudoElement = '::',
    PseudoState = ':',
    Sibling = '~'
}

/**
 * DSL Entry point
 */
type GenerateRules = (css: StyleSheetFactory) => void

/**
 * Represents a CSS string factory
 */
class StyleSheetFactory {

    private children: StyleSheetFactory[]
    private host?: Element
    private parent?: StyleSheetFactory
    private scope: {
        [ key: string ]: string
    }
    private selector: string
    private value: string

    /**
     * Checks whether or not a custom property has been defined by its name
     * @param name CSS custom property name
     */
    private checkReferenceByName(name: string): boolean {
        return name in this.scope || (this.parent?.checkReferenceByName(name) ?? false)
    }

    /**
     * Constructs a CSS string factory
     * @param selector CSS selector to wrap rule set
     * @param generate Function which exposes the factory DSL
     * @param host Element which will host the resulting style sheet
     */
    public constructor(selector: string, generate: GenerateRules, host?: Element) {
        this.host = host
        this.selector = selector

        generate(this)
    }

    /**
     * Resets generated CSS from new registration function
     * @param generate Function which exposes the factory DSL
     */
    public reset(generate: GenerateRules): StyleSheetFactory {
        generate(this)

        return this
    }

    /**
     * Convert JS object to valid CSS rule set and write to style sheet
     * @param properties Partial CSS style declaration object
     */
    public assign(properties: Partial<CSSStyleDeclaration>): void {
        this.write(Object.keys(properties).reduce((css, key) => {
            const cssKey = key.replace(/[A-Z]/g, char => `-${ char.toLowerCase() }`)
            const cssValue = String(properties[ key ])

            return `${ css }${ cssKey }: ${ cssValue };\n`
        }, ''))
    }

    /**
     * Define a custom CSS property
     * (Can sometimes increase performance depending on how the value is serialized)
     * @param name Name of the custom property
     * @param value Value to be serialized for CSS
     */
    public define(name: string, value: any): void {
        this.scope[ name ] = String(value)
    }

    /**
     * 
     * @param name 
     */
    public var(name: string): string {

        if (!this.checkReferenceByName(name)) {
            throw ReferenceError(`${ name } is not defined`)
        }

        return `var(--${ name })`
    }

    /**
     * Write CSS string to style sheet
     * @param value CSS content string
     */
    public write(value: string): void {

        if (this.selector.endsWith(Combinators.Descendant)) {
            throw new Error('Cannot write rules for incomplete selector')
        }

        this.value += value
    }

    /**
     * Creates new child rule set for matching selector, returns selector for use in other selections
     * @param selector CSS selector to wrap rule set
     * @param generate Function which exposes the factory DSL
     */
    public select(selector: string, generate?: GenerateRules): string {

        if (generate) {
            this.children.push(new StyleSheetFactory(this.selector + selector, generate))
        }

        return selector
    }

    public selectActive(generate?: GenerateRules): string {
        return this.selectPseudoClass('active', generate)
    }

    public selectAfter(generate?: GenerateRules): string {
        return this.selectPseudoElement('after', generate)
    }

    public selectAnyLink(generate?: GenerateRules): string {
        return this.selectPseudoClass('any-link', generate)
    }

    public selectBackdrop(generate?: GenerateRules): string {
        return this.selectPseudoElement('backdrop', generate)
    }

    public selectBefore(generate?: GenerateRules): string {
        return this.selectPseudoElement('before', generate)
    }

    public selectBlank(generate?: GenerateRules): string {
        return this.selectPseudoClass('blank', generate)
    }

    public selectChecked(generate?: GenerateRules): string {
        return this.selectPseudoClass('checked', generate)
    }

    /**
     * Select elements which implement the specified class
     * @param constructor Element class to select
     * @param generate Function which exposes the factory DSL
     */
    public selectClass(constructor: new() => Element, generate?: GenerateRules): string {
        return this.selectClassName(constructor.name, generate)
    }

    /**
     * Select elements whose class lists include the specified name
     * @param className Name to select from element class lists
     * @param generate Function which exposes the factory DSL
     */
    public selectClassName(className: string, generate?: GenerateRules): string {
        return this.select(Combinators.Class + className, generate)
    }

    public selectCue(generate?: GenerateRules): string {
        return this.selectPseudoElement('cue', generate)
    }

    public selectCueRegion(generate?: GenerateRules): string {
        return this.selectPseudoElement('cue-region', generate)
    }

    public selectCurrentTimed(selectors: string[], generate?: GenerateRules): string {
        return this.selectPseudoClass(`current(${ selectors.join(', ') })`, generate)
    }

    public selectDefault(generate?: GenerateRules): string {
        return this.selectPseudoClass('default', generate)
    }

    public selectDefined(generate?: GenerateRules): string {
        return this.selectPseudoClass('defined', generate)
    }

    public selectDescendant(generate?: GenerateRules): string {
        return this.select(Combinators.Descendant, generate)
    }

    public selectDir(direction: 'ltr' | 'rtl', generate?: GenerateRules): string {
        return this.selectPseudoClass(`dir(${ direction })`, generate)
    }

    public selectDisabled(generate?: GenerateRules): string {
        return this.selectPseudoClass('disabled', generate)
    }

    public selectEmpty(generate?: GenerateRules): string {
        return this.selectPseudoClass('empty', generate)
    }

    public selectEnabled(generate?: GenerateRules): string {
        return this.selectPseudoClass('enabled', generate)
    }

    public selectFileSelectorButton(generate?: GenerateRules): string {
        return this.selectPseudoElement('file-selector-button', generate)
    }

    public selectFirstLetter(generate?: GenerateRules): string {
        return this.selectPseudoElement('first-letter', generate)
    }
    
    public selectFirstLine(generate?: GenerateRules): string {
        return this.selectPseudoElement('first-line', generate)
    }

    public selectFirstPage(generate?: GenerateRules): string {
        return this.selectPseudoClass('first', generate)
    }

    public selectFirstChild(generate?: GenerateRules): string {
        return this.selectPseudoClass('first-child', generate)
    }

    public selectFirstOfType(generate?: GenerateRules): string {
        return this.selectPseudoClass('first-of-type', generate)
    }

    public selectFocus(generate?: GenerateRules): string {
        return this.selectPseudoClass('focus', generate)
    }

    public selectFocusVisible(generate?: GenerateRules): string {
        return this.selectPseudoClass('focus-visible', generate)
    }

    public selectFocusWithin(generate?: GenerateRules): string {
        return this.selectPseudoClass('focus-within', generate)
    }

    public selectFullscreen(generate?: GenerateRules): string {
        return this.selectPseudoClass('fullscreen', generate)
    }

    public selectFutureTimed(selectors: string[], generate?: GenerateRules): string {
        return this.selectPseudoClass(`future(${ selectors.join(', ') })`, generate)
    }

    public selectGrammarError(generate?: GenerateRules): string {
        return this.selectPseudoElement('grammar-error', generate)
    }

    public selectHas(selectors: string[], generate?: GenerateRules): string {
        return this.selectPseudoClass(`has(${ selectors.join(', ') })`, generate)
    }

    public selectHost(generate?: GenerateRules): string {
        return this.selectPseudoClass('host', generate)
    }

    public selectHostContext(selectors: string[], generate?: GenerateRules): string {
        return this.selectPseudoClass(`host-context(${ selectors.join(', ') })`, generate)
    }

    public selectHostIs(selectors: string[], generate?: GenerateRules): string {
        return this.selectPseudoClass(`host(${ selectors.join(', ') })`, generate)
    }

    public selectHover(generate?: GenerateRules): string {
        return this.selectPseudoClass('hover', generate)
    }

    /**
     * Select element whose id matches the specified id
     * @param id Unique Id to select
     * @param generate Function which exposes the factory DSL
     */
    public selectId(id: string, generate?: GenerateRules): string {
        return this.select(Combinators.Id + id, generate)
    }

    public selectIndeterminate(generate?: GenerateRules): string {
        return this.selectPseudoClass('indeterminate', generate)
    }

    public selectInRange(generate?: GenerateRules): string {
        return this.selectPseudoClass('in-range', generate)
    }

    public selectInvalid(generate?: GenerateRules): string {
        return this.selectPseudoClass('invalid', generate)
    }

    public selectIs(selectors: string[], generate?: GenerateRules): string {
        return this.selectPseudoClass(`is(${ selectors.join(', ') })`, generate)
    }

    public selectLang(language: string, generate?: GenerateRules): string {
        return this.selectPseudoClass(`lang(${ language })`, generate)
    }

    public selectLastChild(generate?: GenerateRules): string {
        return this.selectPseudoClass('last-child', generate)
    }

    public selectLastOfType(generate?: GenerateRules): string {
        return this.selectPseudoClass('last-of-type', generate)
    }

    public selectLeftHandPage(generate?: GenerateRules): string {
        return this.selectPseudoClass('left', generate)
    }

    public selectLink(generate?: GenerateRules): string {
        return this.selectPseudoClass('link', generate)
    }

    public selectLocalLink(generate?: GenerateRules): string {
        return this.selectPseudoClass('local-link', generate)
    }

    public selectMarker(generate?: GenerateRules): string {
        return this.selectPseudoElement('marker', generate)
    }

    public selectNot(selectors: string[], generate?: GenerateRules): string {
        return this.selectPseudoClass(`not(${ selectors.join(', ') })`, generate)
    }

    public selectNthChild(nth: string | number, generate?: GenerateRules): string {
        return this.selectPseudoClass(`nth-child(${ nth })`, generate)
    }

    public selectNthColumn(nth: string | number, generate?: GenerateRules): string {
        return this.selectPseudoClass(`nth-col(${ nth })`, generate)
    }

    public selectNthOfType(nth: string | number, generate?: GenerateRules): string {
        return this.selectPseudoClass(`nth-of-type(${ nth })`, generate)
    }

    public selectNthLastChild(nth: string | number, generate?: GenerateRules): string {
        return this.selectPseudoClass(`nth-last-child(${ nth })`, generate)
    }

    public selectNthLastColumn(nth: string | number, generate?: GenerateRules): string {
        return this.selectPseudoClass(`nth-last-col(${ nth })`, generate)
    }

    public selectNthLastOfType(nth: string | number, generate?: GenerateRules): string {
        return this.selectPseudoClass(`nth-last-of-type(${ nth })`, generate)
    }

    public selectOnlyChild(generate?: GenerateRules): string {
        return this.selectPseudoClass('only-child', generate)
    }

    public selectOnlyOfType(generate?: GenerateRules): string {
        return this.selectPseudoClass('only-of-type', generate)
    }

    public selectOptional(generate?: GenerateRules): string {
        return this.selectPseudoClass('optional', generate)
    }

    public selectOutOfRange(generate?: GenerateRules): string {
        return this.selectPseudoClass('out-of-range', generate)
    }

    public selectPart(part: string, generate?: GenerateRules): string {
        return this.selectPseudoElement(`part(${ part })`, generate)
    }

    public selectPastTimed(generate?: GenerateRules): string {
        return this.selectPseudoClass('past', generate)
    }

    public selectPaused(generate?: GenerateRules): string {
        return this.selectPseudoClass('paused', generate)
    }

    public selectPictureInPicture(generate?: GenerateRules): string {
        return this.selectPseudoClass('picture-in-picture', generate)
    }

    public selectPlaceholder(generate?: GenerateRules): string {
        return this.selectPseudoElement('placeholder', generate)
    }

    public selectPlaceholderShown(generate?: GenerateRules): string {
        return this.selectPseudoClass('placeholder-shown', generate)
    }

    public selectPlaying(generate?: GenerateRules): string {
        return this.selectPseudoClass('playing', generate)
    }

    /**
     * 
     * @param element 
     * @param generate 
     */
    public selectPseudoElement(element: string, generate?: GenerateRules): string {
        return this.select(Combinators.PseudoElement + element, generate)
    }

    /**
     * 
     * @param state 
     * @param generate 
     */
    public selectPseudoClass(state: string, generate?: GenerateRules): string {
        return this.select(Combinators.PseudoState + state, generate)
    }

    public selectReadOnly(generate?: GenerateRules): string {
        return this.selectPseudoClass('read-only', generate)
    }

    public selectReadWrite(generate?: GenerateRules): string {
        return this.selectPseudoClass('read-write', generate)
    }

    public selectRequired(generate?: GenerateRules): string {
        return this.selectPseudoClass('required', generate)
    }

    public selectRightHandPage(generate?: GenerateRules): string {
        return this.selectPseudoClass('right', generate)
    }

    public selectRoot(generate?: GenerateRules): string {
        return this.selectPseudoClass('root', generate)
    }

    public selectSelection(generate?: GenerateRules): string {
        return this.selectPseudoElement('selection', generate)
    }

    public selectSlotted(selectors: string[], generate?: GenerateRules): string {
        return this.selectPseudoElement(`slotted(${ selectors.join(', ') })`, generate)
    }

    public selectScope(generate?: GenerateRules): string {
        return this.selectPseudoClass('scope', generate)
    }

    public selectSpellingError(generate?: GenerateRules): string {
        return this.selectPseudoElement('spelling-error', generate)
    }

    public selectState(status: string, generate?: GenerateRules): string {
        return this.selectPseudoClass(`state(${ status })`, generate)
    }

    public selectTarget(generate?: GenerateRules): string {
        return this.selectPseudoClass('target', generate)
    }

    public selectTargetWithin(generate?: GenerateRules): string {
        return this.selectPseudoClass('target-within', generate)
    }

    public selectUserInvalid(generate?: GenerateRules): string {
        return this.selectPseudoClass('user-invalid', generate)
    }

    public selectValid(generate?: GenerateRules): string {
        return this.selectPseudoClass('valid', generate)
    }

    public selectVisited(generate?: GenerateRules): string {
        return this.selectPseudoClass('visited', generate)
    }

    public selectWhere(selectors: string[], generate?: GenerateRules): string {
        return this.selectPseudoClass(`where(${ selectors.join(', ') })`, generate)
    }

    /**
     * Serializes style sheet objects into valid CSS rules
     */
    public toString(): string {
        return ''
    }
}

/**
 * Create a CSS string from a factory DSL
 * @param host Element which will host the resulting style sheet
 * @param generate Function which exposes the factory DSL
 */
export function createStyleSheet(generate: GenerateRules): string
export function createStyleSheet(hostOrGenerate: Element | GenerateRules, generate?: GenerateRules): string {
    
    /**
     * In order to support overloading for generic usages, check type of `hostOrGenerate`
     */
    if (hostOrGenerate instanceof Element) {
        const host = hostOrGenerate

        /**
         * Since `generate` has been made optional for overloading, validate its existence
         */
        if (!generate) {
            throw new Error('You must provide a valid CSS generator')
        }

        /**
         * Reset existing style sheet if one already exists
         * (Happens when existing host updates)
         */
        if (styleSheets.has(host)) {
            return styleSheets
                .get(host)?.reset(generate)?.toString() ?? Combinators.None
        }

        return styleSheets
            .set(host, new StyleSheetFactory(Combinators.None, generate, host))
            .get(host)?.toString() ?? Combinators.None
    }

    return new StyleSheetFactory(Combinators.None, hostOrGenerate, document.documentElement).toString()
}
