import Redis, { Command } from "ioredis"
import { env } from "./env"

const redisClient = new Redis(env.REDIS_URL)

export const redisGet = redisClient.get.bind(redisClient)
export const redisSet = redisClient.set.bind(redisClient)

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
