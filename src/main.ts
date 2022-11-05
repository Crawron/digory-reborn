import "dotenv/config"

import { Client } from "discord.js"
import { handleCommands } from "./commands/handler"
import { petCommand } from "./commands/definitions/pet"
import { restartCommand } from "./commands/definitions/restart"
import { pickCommand } from "./commands/definitions/pick"
import { env } from "./env"
import { mirrorCommandGroup } from "./commands/definitions/mirror"
import { handleMirror } from "./message-mirror"

const discordClient = new Client({
	intents: ["GuildMessages", "Guilds", "MessageContent"],
})

handleCommands(discordClient, env.DISCORD_SERVER_ID, [
	petCommand,
	restartCommand,
	pickCommand,
	mirrorCommandGroup,
])

discordClient.on("ready", () => console.info("🦮 Ready"))
discordClient.on("messageCreate", handleMirror)

discordClient.login(env.DISCORD_BOT_TOKEN)
