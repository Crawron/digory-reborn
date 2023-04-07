import { Maze, closedCell } from "./maze"

export function travelMaze(
	maze: Maze,
	position: { x: number; y: number },
	path: string
) {
	let { x, y } = position

	function nextMove(direction: string) {
		let currentCell = maze.getCell(x, y) ?? closedCell
		if (direction === "U")
			return {
				pos: { x: x, y: y - 1 },
				open: currentCell.up && (maze.getCell(x, y - 1) ?? closedCell).down,
			}
		if (direction === "D")
			return {
				pos: { x: x, y: y + 1 },
				open: currentCell.down && (maze.getCell(x, y + 1) ?? closedCell).up,
			}
		if (direction === "L")
			return {
				pos: { x: x - 1, y: y },
				open: currentCell.left && (maze.getCell(x - 1, y) ?? closedCell).right,
			}
		else
			return {
				pos: { x: x + 1, y },
				open: currentCell.right && (maze.getCell(x + 1, y) ?? closedCell).left,
			} // "R"
	}

	for (const [i, direction] of [...path.toUpperCase()].entries()) {
		let next = nextMove(direction)
		if (next.open) {
			x = next.pos.x
			y = next.pos.y
		} else {
			return { failedStep: i + 1 }
		}
	}

	return { x, y }
}
