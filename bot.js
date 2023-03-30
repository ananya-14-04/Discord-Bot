require('dotenv').config({ path: '/home/ananya/Documents/web/nodejs/discord_bot/.env' });

const { Client, GatewayIntentBits, PermissionsBitField, Collection, intents } = require('discord.js');
const { Player } = require("discord-player")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9");
const fs = require('fs');
const path = require("path");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

const Prefix = "$";
const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands"); // E:\yt\discord bot\js\intro\commands
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}


client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

client.on('ready', () => {
    console.log('the bot has logged in');
    const guild_ids = client.guilds.cache.map(guild => guild.id);


    const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
    for (const guildId of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands })
            .then(() => console.log('Successfully updated commands for guild ' + guildId))
            .catch(console.error);
    }

})

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute({ client, interaction });
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error executing this command" });
    }
});

client.on('messageCreate', async (mes) => {
    if (mes.author.bot) return;
    if (mes.content === 'ping me') {
        mes.reply(`${mes.author.tag} hi`);
    }

    if (mes.content.startsWith(Prefix)) {
        const [cmd_name, ...args] = mes.content.trim().substring(Prefix.length).split(/\s+/);


        if (cmd_name === "kick") {
            if (args.length === 0) return mes.reply("please provide an id");

            const member = mes.guild.members.cache.get(args[0]);
            if (member) {
                member.kick().then((member) => mes.channel.send(`${member} was kicked`)).catch((err) => mes.channel.send("I cannot kick this member out"));
            }
            else {
                mes.channel.send("that member not found");
            }

        }

    }
});

client.login(process.env.BOT_TOKEN);

