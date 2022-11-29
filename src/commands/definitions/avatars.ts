import { CommandDefinition } from "../handler.js"

export const avatarsCommand: CommandDefinition = {
	definition: {
		name: "avatars",
		description: "Get an avatar url of every player",
		defaultMemberPermissions: ["Administrator"],
	},

	async handle(int) {
		if (!int.guild) return int.reply("Guild only command")
		const playerRole = "1003392522061623337"

		const players = int.guild.members.cache
			.filter((m) => m.roles.cache.has(playerRole))
			.map((p) => [p.user.username, p.displayAvatarURL({ size: 128 })])
			.sort()

		if (!players) return int.reply("No players found")

		await int.reply(
			players.map(([name]) => name).join(", ") +
				"\n```\n" +
				players.map(([, avatarUrl]) => avatarUrl).join("\n") +
				"```"
		)

		int.followUp(int.guild.roles.cache.map((r) => r.name).join(", "))
		int.followUp(int.guild.members.cache.map((r) => r.user.username).join(", "))
	},
}
