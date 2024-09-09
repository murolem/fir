export interface Entity {
    update: () => void,
    draw: () => void,
    isDead: boolean
}