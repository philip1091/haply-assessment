const COLORS = [
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#22C55E",
    "#06B6D4",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
];

export function getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    return COLORS[randomIndex];
}