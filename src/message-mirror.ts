import { Message } from "discord.js"
import { isTruthy } from "./helpers.js"
import { getEmoji, redisGet, redisSmembers } from "./redis.js"

export const mirrorTargetKey = "mirrorTarget"
export const mirrorSourceKey = "mirrorSource"

type MirrorMessage = {
	first?: boolean
	channelId: string
	timestamp: number
	emoji: string
	authorId: string
	content: string
	url: string
	attachment: boolean
	/* edited?: boolean
	deleted?: boolean
	 */
}

async function createMirrorMessage(message: Message): Promise<MirrorMessage> {
	return {
		channelId: message.channelId,
		timestamp: Math.floor(message.createdTimestamp / 1000),
		emoji: (await getEmoji(message.author.id)) ?? "⚪",
		content: message.content,
		authorId: message.author.id,
		url: message.url,
		attachment: message.attachments.size > 0,
	}
}

type MirrorBunch = {
	/* color: string */
	id: string
	timestamp: number
	url: string
	messages: MirrorMessage[]
}

function bunchMessages(messages: MirrorMessage[]): MirrorBunch[] {
	const bunches: MirrorBunch[] = []

	let lastChannel = ""
	let lastAuthor = ""
	let currentBunch: MirrorBunch | null = null

	for (const message of messages) {
		if (lastChannel !== message.channelId) {
			if (currentBunch) bunches.push(currentBunch)
			currentBunch = {
				id: message.channelId,
				timestamp: message.timestamp,
				messages: [],
				url: message.url,
			}
			lastAuthor = ""
		}

		if (lastAuthor !== message.authorId) message.first = true

		currentBunch?.messages.push(message)

		lastChannel = message.channelId
		lastAuthor = message.authorId
	}

	if (currentBunch) bunches.push(currentBunch)
	return bunches
}

function renderMessage({
	timestamp,
	emoji,
	authorId,
	first,
	content,
	attachment,
	url,
}: MirrorMessage): string {
	const header = `\n${emoji} <@${authorId}> <t:${timestamp}:t>\n`

	return [first && header, content, attachment && ` [[Attachment]](${url})`]
		.filter(isTruthy)
		.join("")
}

function renderBunch({ id, timestamp, url, messages }: MirrorBunch): string {
	const header = `<#${id}> <t:${timestamp}:D> [Scroll here](${url})\n\n`
	const content = messages.map(renderMessage).join("\n").trim()

	return [header, content].filter(isTruthy).join("")
}

//

const messages = new Map<string, MirrorMessage>()
let targetMessage: Message | null = null

export async function handleMirror(message: Message) {
	if (message.author.bot) return

	const mirrorSources = await redisSmembers(mirrorSourceKey)
	if (!mirrorSources.includes(message.channelId)) return

	const targetMirror = await redisGet(mirrorTargetKey)
	if (!targetMirror) return

	messages.set(message.id, await createMirrorMessage(message))
	let bunches = bunchMessages([...messages.values()]).map(renderBunch)

	const descriptionLimit = bunches.some((b) => b.length > 4096)
	const embedLimit = bunches.length > 10
	const totalLimit = bunches.reduce((a, b) => a + b.length, 0) > 6000

	if (descriptionLimit || embedLimit || totalLimit) {
		messages.clear()
		messages.set(message.id, await createMirrorMessage(message))
		bunches = bunchMessages([...messages.values()]).map(renderBunch)
		targetMessage = null
	}

	const messageToSend = {
		embeds: bunches.map((b) => ({ description: b })),
	}

	if (!targetMessage) {
		const { client } = message
		const targetChannel =
			client.channels.cache.get(targetMirror) ??
			(await client.channels.fetch(targetMirror))

		if (!targetChannel || !targetChannel.isTextBased()) return

		targetMessage = await targetChannel.send(messageToSend)
	} else {
		targetMessage.edit(messageToSend)
	}
}
