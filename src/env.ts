import { z } from "zod"

export const env = z
	.object({
		DISCORD_BOT_TOKEN: z.string(),
		REDIS_URL: z.string(),
		DISCORD_SERVER_ID: z.string(),
	})
	.parse(process.env)
