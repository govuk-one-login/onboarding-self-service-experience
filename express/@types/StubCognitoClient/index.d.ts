export interface Overrides {
    createUser?: Override[]
}

export interface Override {
    criteria: Critereon[],l
    action: Action
}

export interface Critereon {
    parameter: string,
    value: string
}

export interface Action {
    throw?: string,
    return?: any
}