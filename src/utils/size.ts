const units = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB',
]

export function getSizeString(size: number): string {
    let tmp = Math.ceil(size)
    let unit = units[0]
    for (let i = 1; i < units.length; i++) {
        if (tmp < 1024) break
        tmp /= 1024
        unit = units[i]
    }
    return tmp.toFixed(2) + unit
}
