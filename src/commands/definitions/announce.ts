import { ApplicationCommandOptionType, ChannelType, Guild } from "discord.js"
import { redisSadd, redisSet, redisSmembers, redisSrem } from "../../redis.js"
import { CommandDefinition } from "../handler.js"

const announceTargetKey = "announceTarget"

export const announceCommandGroup: CommandDefinition = {
	definition: {
		name: "announce",
		description: "Announce to channels",
		defaultMemberPermissions: "Administrator",
		options: [
			{
				name: "message",
				type: ApplicationCommandOptionType.Subcommand,
				description: "Mirror messages to this channel",
				options: [
					{
						name: "message",
						type: ApplicationCommandOptionType.String,
						description: "Message",
						required: true,
					},
				],
			},
			{
				name: "add",
				type: ApplicationCommandOptionType.Subcommand,
				description: "Add a channel or category to announce to",
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
				description: "Remove a channel or category to announce to",
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

		if ("message" === subcommand) return await announceMessageCommand(int)
		if ("add" === subcommand) return await announceAddCommand(int)
		if ("remove" === subcommand) return await announceRemoveCommand(int)

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

const announceAddCommand: CommandDefinition["handle"] = async (int) => {
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

	const count = await redisSadd(announceTargetKey, ...channelsToAdd)

	await int.reply({
		content: `✅ Added ${count} new channels to announce to`,
		ephemeral: true,
	})
}

const announceRemoveCommand: CommandDefinition["handle"] = async (int) => {
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

	const count = await redisSrem(announceTargetKey, ...channelsToAdd)

	await int.reply({
		content: `✅ Removed ${count} channels to mirror from`,
		ephemeral: true,
	})
}

const announceMessageCommand: CommandDefinition["handle"] = async (int) => {
	const content = int.options.get("message")?.value?.toString().trim()
	if (!content) return int.reply("No message provided")

	const targets = await redisSmembers(announceTargetKey)

	int.reply(
		`Would reply to ${targets.length} channels\n${targets
			.map((t) => `<#${t}>`)
			.join("\n")}`
	)

	/* await int.deferReply()

	for (const target of targets) {
		const channel = int.guild?.channels.cache.get(target)
		if (!channel?.isTextBased()) continue

		await channel.send({ content, allowedMentions: {} })
	}

	int.editReply(`Sent message\n>>> ${content}`) */
}
