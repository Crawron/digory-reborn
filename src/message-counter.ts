import { Message } from "discord.js"
import {
	bumpCounter,
	redisDel,
	redisGet,
	redisHgetall,
	redisSet,
} from "./redis"

const counterKey = "count"
const clearDateKey = "count.clearDate"
const categoryKey = "count.category"

export async function countMessages(message: Message) {
	if (!message.inGuild() || message.author.bot) return

	const inCategory = message.channel.parentId === (await redisGet(categoryKey))
	if (!inCategory) return

	bumpCounter(counterKey, message.channelId)
}

export async function getCounts() {
	const counts = new Map<string, number>() // <id, count>
	const keys = await redisHgetall(counterKey)

	for (const [key, count] of Object.entries(keys)) {
		counts.set(key, parseInt(count))
	}

	return counts
}

export async function clearCounts() {
	redisSet(clearDateKey, Date.now())
	return await redisDel(counterKey)
}

export async function getCountClearDate() {
	const clearDate = await redisGet(clearDateKey)
	if (clearDate) return parseFloat(clearDate)
}

export async function setCategoryId(id: string) {
	return redisSet(categoryKey, id)
}
