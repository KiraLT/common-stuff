/**
 * Perform left-to-right function composition.
 *
 * @example
 * ```
 * pipe(
 *     [1, 2, 3, 4],
 *     arr => arr.map(v => v * 2),
 *     arr => arr.map(v => v + 2)
 * )
 * // [4, 6, 8, 10]
 *```
 * @param value The initial value.
 * @param operations the list of operations to apply.
 * @category FP
 */
export function pipe<A, B>(value: A, op1: (input: A) => B): B
export function pipe<A, B, C>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C
): C
export function pipe<A, B, C, D>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D
): D
export function pipe<A, B, C, D, E>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E
): E
export function pipe<A, B, C, D, E, F>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E,
    op5: (input: E) => F
): F
export function pipe<A, B, C, D, E, F, G>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E,
    op5: (input: E) => F,
    op6: (input: F) => G
): G
export function pipe<A, B, C, D, E, F, G, H>(
    value: A,
    op1: (input: A) => B,
    op2: (input: B) => C,
    op3: (input: C) => D,
    op4: (input: D) => E,
    op5: (input: E) => F,
    op6: (input: F) => G,
    op7: (input: G) => H
): H
export function pipe(
    value: unknown,
    ...operations: Array<(value: unknown) => unknown>
): unknown {
    return operations.reduce((prev, cur) => cur(prev), value)
}
