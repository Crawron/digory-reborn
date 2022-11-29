import "dotenv/config"

import { Client } from "discord.js"
import { handleCommands } from "./commands/handler.js"
import { petCommand } from "./commands/definitions/pet.js"
import { restartCommand } from "./commands/definitions/restart.js"
import { pickCommand } from "./commands/definitions/pick.js"
import { env } from "./env.js"
import { mirrorCommandGroup } from "./commands/definitions/mirror.js"
import { handleMirror } from "./message-mirror.js"
import { counterCommandGroup } from "./commands/definitions/counter.js"
import { countMessages } from "./message-counter.js"
import { avatarsCommand } from "./commands/definitions/avatars.js"

const discordClient = new Client({
	intents: ["GuildMessages", "Guilds", "MessageContent"],
})

handleCommands(discordClient, env.DISCORD_SERVER_ID, [
	petCommand,
	restartCommand,
	pickCommand,
	mirrorCommandGroup,
	counterCommandGroup,
	avatarsCommand,
])

discordClient.on("ready", () => console.info("🦮 Ready"))
discordClient.on("messageCreate", handleMirror)
discordClient.on("messageCreate", countMessages)

discordClient.login(env.DISCORD_BOT_TOKEN)
