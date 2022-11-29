import { ApplicationCommandOptionType, ChannelType } from "discord.js"
import {
	clearCounts,
	getCountClearDate,
	getCounts,
	setCategoryId,
} from "../../message-counter.js"
import { CommandDefinition } from "../handler.js"

export const counterCommandGroup: CommandDefinition = {
	definition: {
		name: "count",
		description: "Command group for message counter",
		defaultMemberPermissions: "Administrator",
		options: [
			{
				name: "show",
				description: "Show count of messages in all channels since last clear",
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: "clear",
				description: "Clear all message counters",
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: "category",
				description: "Set category to count from",
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: "category",
						description: "Category to count from",
						required: true,
						type: ApplicationCommandOptionType.Channel,
						channelTypes: [ChannelType.GuildCategory],
					},
				],
			},
		],
	},
	async handle(int) {
		if (!int.isChatInputCommand()) return
		const subcommand = int.options.getSubcommand()

		if ("show" === subcommand) return await countShowCommand(int)
		if ("clear" === subcommand) return await countClearCommand(int)
		if ("category" === subcommand) return await countCategoryCommand(int)

		int.reply({ content: "Unknown subcommand", ephemeral: true })
	},
}

const countShowCommand: CommandDefinition["handle"] = async (int) => {
	const counts = [...(await getCounts())].sort(([, a], [, b]) => b - a)
	const lastClear = await getCountClearDate()

	const clearString = lastClear
		? `<t:${Math.round(lastClear / 1000)}:F>`
		: "never"

	if (counts.length < 1)
		return await int.reply(`No new messages since last clear (${clearString})`)

	await int.reply(
		`**Counts per channel**\n` +
			counts
				.map(([id, count]) => `\`${String(count).padStart(2, "0")}\` <#${id}>`)
				.join("\n") +
			`\n*Last clear: ${clearString}*`
	)
}

const countClearCommand: CommandDefinition["handle"] = async (int) => {
	await countShowCommand(int)
	await clearCounts()
	int.followUp("Counts cleared! Showing above counts before clearing")
}

const countCategoryCommand: CommandDefinition["handle"] = async (int) => {
	if (!int.isChatInputCommand()) return
	if (!int.guild) return

	const channelId = int.options.getChannel("category", true).id
	await setCategoryId(channelId)

	int.reply(`Counting messages in <#${channelId}>`)
}
