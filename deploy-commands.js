const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config()

const guildCommands = [
	new SlashCommandBuilder().setName('update-words').setDescription('Updates which words are automatically reported or deleted.').setDefaultPermission(false).addStringOption(option =>
		option.setName('action')
			.setDescription("Whether to add or remove a word or phrase")
			.setRequired(true)
			.addChoice("Add", "add")
			.addChoice("Remove", "remove")).addStringOption(option =>
		option.setName('type')
			.setDescription("Which list to edit. Exceptions is for innocent words that contain problematic ones.")
			.setRequired(true)
			.addChoice("Delete", "delete")
			.addChoice("Report", "report")
			.addChoice("Exceptions", "exceptions")).addStringOption(option =>
		option.setName('word')
			.setDescription("Which word or phrase to add to or remove from the list.")
			.setRequired(true)).addBooleanOption(option =>
		option.setName('leading-space')
			.setDescription("Whether to add a space beforehand")
			.setRequired(false)).addBooleanOption(option =>
		option.setName('trailing-space')
			.setDescription("Whether to add a space afterwards")
			.setRequired(false)),
	new SlashCommandBuilder().setName('mute').setDescription('Mutes a member').setDefaultPermission(false).addUserOption(option =>
		option.setName('member')
			.setDescription("Who to mute")
			.setRequired(true)).addNumberOption(option =>
		option.setName('hours')
			.setDescription("How many hours to mute them for (decimals accepted)")
			.setRequired(true)).addStringOption(option =>
		option.setName('reason')
			.setDescription("Why they're being muted")
			.setRequired(false)),
	new SlashCommandBuilder().setName('ban').setDescription('Bans a member').setDefaultPermission(false).addUserOption(option =>
		option.setName('member')
			.setDescription("Who to ban")
			.setRequired(true)).addStringOption(option =>
		option.setName('reason')
			.setDescription("Why they're being banned")
			.setRequired(false))
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.token);

rest.put(Routes.applicationGuildCommands("933212401522851901", "887540443187920906"), { body: guildCommands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);