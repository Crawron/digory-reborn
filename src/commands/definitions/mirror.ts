import { ApplicationCommandOptionType, ChannelType, Guild } from "discord.js"
import { mirrorSourceKey, mirrorTargetKey } from "../../message-mirror"
import { redisSadd, redisSet, redisSrem } from "../../redis"
import { CommandDefinition } from "../handler"

export const mirrorCommandGroup: CommandDefinition = {
	definition: {
		name: "mirror",
		description: "Command group for message mirror",
		options: [
			{
				name: "here",
				type: ApplicationCommandOptionType.Subcommand,
				description: "Mirror messages to this channel",
			},
			{
				name: "add",
				type: ApplicationCommandOptionType.Subcommand,
				description: "Add a channel or category to mirror from",
				options: [
					{
						name: "channel",
						type: ApplicationCommandOptionType.Channel,
						channelTypes: [ChannelType.GuildCategory, ChannelType.GuildText],
						description: "Channels or categories to add",
						required: true,
					},
				],
			},
			{
				name: "remove",
				type: ApplicationCommandOptionType.Subcommand,
				description: "Remove a channel or category to mirror from",
				options: [
					{
						name: "channel",
						type: ApplicationCommandOptionType.Channel,
						channelTypes: [ChannelType.GuildCategory, ChannelType.GuildText],
						description: "Channels or categories to remove",
						required: true,
					},
				],
			},
		],
	},
	async handle(int) {
		if (!int.isChatInputCommand()) return
		const subcommand = int.options.getSubcommand()

		if ("here" === subcommand) return await mirrorHereCommand(int)
		if ("add" === subcommand) return await mirrorAddCommand(int)
		if ("remove" === subcommand) return await mirrorRemoveCommand(int)

		int.reply({ content: "Unknown subcommand", ephemeral: true })
	},
}

function expandChannelIds(guild: Guild, channelId: string) {
	const channel = guild.channels.cache.get(channelId)
	if (!channel) return []

	if (channel.type === ChannelType.GuildCategory)
		return [...channel.children.cache.keys()]

	return [channel.id]
}

const mirrorAddCommand: CommandDefinition["handle"] = async (int) => {
	if (!int.isChatInputCommand()) return
	if (!int.guild) return

	const channelsToAdd = expandChannelIds(
		int.guild,
		int.options.getChannel("channel", true).id
	)

	if (channelsToAdd.length < 1)
		return int.reply({
			content: "Failed to find any channels to add",
			ephemeral: true,
		})

	const count = await redisSadd(mirrorSourceKey, ...channelsToAdd)

	await int.reply({
		content: `✅ Added ${count} new channels to mirror from`,
		ephemeral: true,
	})
}

const mirrorRemoveCommand: CommandDefinition["handle"] = async (int) => {
	if (!int.isChatInputCommand()) return
	if (!int.guild) return

	const channelsToAdd = expandChannelIds(
		int.guild,
		int.options.getChannel("channel", true).id
	)

	if (channelsToAdd.length < 1)
		return int.reply({
			content: "Failed to find any channels to remove",
			ephemeral: true,
		})

	const count = await redisSrem(mirrorSourceKey, ...channelsToAdd)

	await int.reply({
		content: `✅ Removed ${count} channels to mirror from`,
		ephemeral: true,
	})
}

const mirrorHereCommand: CommandDefinition["handle"] = async (int) => {
	await redisSet(mirrorTargetKey, int.channelId)
	await int.reply({
		content: "✅ Messages will be mirrored to this channel",
		ephemeral: true,
	})
}
