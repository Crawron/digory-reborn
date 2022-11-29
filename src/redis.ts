import Redis from "ioredis"
import { env } from "./env.js"

const redisClient = new Redis(env.REDIS_URL)

export const redisGet = redisClient.get.bind(redisClient)
export const redisSet = redisClient.set.bind(redisClient)
export const redisDel = redisClient.del.bind(redisClient)
export const redisHgetall = redisClient.hgetall.bind(redisClient)

export const redisSadd = redisClient.sadd.bind(redisClient)
export const redisSrem = redisClient.srem.bind(redisClient)
export const redisSmembers = redisClient.smembers.bind(redisClient)

const emojiKey = (id: string) => `emoji:${id}`

export async function getEmoji(userId: string) {
	return await redisClient.get(emojiKey(userId))
}

export async function setEmoji(userId: string, emoji: string) {
	return await redisClient.set(emojiKey(userId), emoji)
}

export async function bumpCounter(key: string, field: string, by = 1) {
	return await redisClient.hincrby(key, field, by)
}

export async function getKeys(pattern: string) {
	const keys = new Set<string>()
	let cursor = "0"

	do {
		const [newCursor, elements] = await redisClient.scan(
			cursor,
			"MATCH",
			pattern
		)

		for (const element of elements) keys.add(element)

		cursor = newCursor
	} while (cursor !== "0")

	return [...keys.values()]
}
