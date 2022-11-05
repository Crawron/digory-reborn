import { arrRand } from "../../helpers.js"
import { CommandDefinition } from "../handler.js"

export const petCommand: CommandDefinition = {
	definition: { name: "pet", description: "Pet the dog" },
	async handle(int) {
		const barks = ["Bark", "Woof", "Bork", "Arf", "Wof", "Worf", "Wof"]
		const hearts = [
			"💖",
			"💕",
			"❤",
			"💓",
			"🧡",
			"💜",
			"💙",
			"💚",
			"💛",
			"💝",
			"🐕",
			"🦴",
		]

		const heartMap: Record<string, string> = {
			"141189864287633408": "❤", // Reds
			"262496434954174465": "🧡", // Hamester
			"178328209463574529": "🧽", // Grunkle
			"109677308410875904": "🪶", // Craw
		} as const

		const heart: string = heartMap[int.user.id] ?? arrRand(hearts) ?? "💖"

		await int.reply({
			content: `*${arrRand(barks)}!* ${heart}`,
			fetchReply: true,
		})
	},
}
