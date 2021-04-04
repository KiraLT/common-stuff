export function truncate(
    value: string,
    length: number,
    ending = '...'
): string {
    if (value.length > length) {
        return value.substring(0, length - ending.length) + ending
    } else {
        return value
    }
}

export function getWords(value: string): string[] {
    return value
        .split(/[ -./\\()"',;<>~!@#$%^&*|+=[\]{}`~?:]+/)
        .filter((v) => v !== '')
}
