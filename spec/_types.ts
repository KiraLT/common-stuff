// Shared helpers for compile-time type assertions.
//
// `Expect<Equal<A, B>>` is a no-runtime-cost assertion: if the two types are not
// strictly equal, `Equal` resolves to `false`, and `Expect` fails to satisfy its
// `extends true` constraint, producing a TypeScript error.

export type Equal<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2)
        ? true
        : false

export type Expect<T extends true> = T

/**
 * Asserts the inferred type of `actual` is *strictly equal* to `Expected`.
 *
 * Compile-time only. If `Expected` and the inferred type differ at all
 * (including subtype/widening differences), the call site gets a TS error.
 *
 * @example
 * ```ts
 * assertType<number[]>()(map([1, 2, 3], v => v * 2))
 * ```
 */
export function assertType<Expected>() {
    return <const Actual>(
        _actual: Actual,
        ..._mismatch: Equal<Expected, Actual> extends true
            ? []
            : [{ __error: 'type mismatch'; expected: Expected; actual: Actual }]
    ): void => {}
}
