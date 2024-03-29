import "dotenv/config"

import { Client } from "discord.js"
import { handleCommands } from "./commands/handler.js"
import { petCommand } from "./commands/definitions/pet.js"
import { restartCommand } from "./commands/definitions/restart.js"
import { pickCommand } from "./commands/definitions/pick.js"
import { env } from "./env.js"
import { mirrorCommandGroup } from "./commands/definitions/mirror.js"
import { handleMirror } from "./message-mirror.js"
import { avatarsCommand } from "./commands/definitions/avatars.js"
import { announceCommandGroup } from "./commands/definitions/announce.js"

const discordClient = new Client({
	intents: ["GuildMessages", "Guilds", "MessageContent", "GuildMembers"],
})

handleCommands(discordClient, env.DISCORD_SERVER_ID, [
	petCommand,
	restartCommand,
	pickCommand,
	mirrorCommandGroup,
	avatarsCommand,
	announceCommandGroup,
])

discordClient.on("ready", () => console.info("🦮 Ready"))
discordClient.on("messageCreate", handleMirror)

discordClient.login(env.DISCORD_BOT_TOKEN)
