const Discord = require("discord.js")
const Intents = Discord.Intents;
const Permissions = Discord.Permissions;
const logger = require("winston")
const fs = require("fs")
const ss = require("string-similarity");
require('dotenv').config()
//const { Endpoints } = Discord.Constants;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
})
logger.level = "debug"
// Initialize Discord Bot
var bot = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_PRESENCES], partials: ['MESSAGE', 'CHANNEL', 'REACTION'], allowedMentions: { parse: ['users', 'roles'], repliedUser: true } });
var lowmessage;
var botCommands = "";
var guildID = ["887540443187920906", "804952338669240330", "531433553225842700"]; //public server, internal server, test server
var logsChannel = "922573873352966214";
var muteRole = "932059486909259817";
var roleId = ["922349166699614208", "932360656093605968", "932361184173232148"];
var roleReact = ["🎉", "twitch", "update"];
var roleMessageId = ["935368924713877595", "935368924713877595", "935368924713877595"];
var roleMessage = []
var muteLog;
var deleteList;
var reportList;
var exceptionList;

bot.on("ready", async function() {
    logger.info("Connected")
    logger.info("Logged in as: ")
    logger.info(bot.user.username + " - (" + bot.user.id + ")")
})

bot.once("ready", async function () {
    bot.channels.cache.get("531433553225842700").send("It is ever dawn.");
    deleteList = await bot.channels.cache.get("922350419005558834").messages.fetch("934010882965512232");
    reportList = await bot.channels.cache.get("922350419005558834").messages.fetch("934011065317085225");
    exceptionList = await bot.channels.cache.get("922350419005558834").messages.fetch("934011123412381706");
    muteLog = await bot.channels.cache.get(logsChannel).messages.fetch("934067351199031357");
    var str = await muteLog.content;
    while (str.includes("\n") && str.length > 2) {
        str = str.slice(str.indexOf("\n") + 1);
        var timeIn = 0;
        if (!str.includes("\n")) {
            timeIn = str.split(" ")[1];
        }
        else {
            timeIn = str.substring(str.indexOf(" ") + 1, str.indexOf("\n"));
        }
        var mutedId = str.split(" ")[0];
        var d = new Date();
        var timer = 0;
        if (str.includes("\n")) { timer = parseInt(str.substring(str.indexOf(" ") + 1, str.indexOf("\n"))); }
        else { timer = parseInt(str.substring(str.indexOf(" "))); }
        timer -= d.getTime();
        if (timer <= 0) { unmute(mutedId); }
        else {
            setTimeout(function () {
                unmute(mutedId);
            }, timer)
        }
    }
    const fullPermissions = [
        {
            id: '934018990077014056',
            permissions: [{
                id: '932431108170207243',
                type: 'ROLE',
                permission: true,
            }],
        },
        {
            id: '934018990077014057',
            permissions: [{
                id: '932431108170207243',
                type: 'ROLE',
                permission: true,
            }],
        },
        {
            id: '934018990077014058',
            permissions: [{
                id: '932431108170207243',
                type: 'ROLE',
                permission: true,
            }],
        },
    ];
    for (var x = 0; x < roleMessageId.length; x++) {
        roleMessage[x] = await bot.channels.cache.get("922348688158908527").messages.fetch(roleMessageId[x]);
    }

    await bot.guilds.cache.get(guildID[0]).commands.permissions.set({ fullPermissions });
    //statusMessage();
})

/*function statusMessage() {
    bot.user.setActivity(, { type: 'WATCHING'});
    setTimeout(function() {
        statusMessage();
    }, duration)
}*/

function badWordsReporter(message, messageMember, isEdit) {
    try {
        let messageCon = " " + message.content.toLowerCase() + " ";
        if (!message.author) {return;}
        if (message.author.bot) {return;}
        if (message.channel.parentId == "922349053403082813") {return;}
        let badWordsLog = "";
        var reporting = false;
        for (var i = 1; i < exceptionList.content.split("\n").length; i++) {
            messageCon = messageCon.replaceAll(exceptionList.content.split("\n")[i], "");
        }
        for (var j = 1; j < deleteList.content.split("\n").length; j++) {
            if (messageCon.includes(deleteList.content.split("\n")[j])) {
                message.delete();
                reporting = true;
            }
        }
        for (var k = 1; k < reportList.content.split("\n").length; k++) {
            if (messageCon.includes(reportList.content.split("\n")[k])) {
                reporting = true;
            }
        }
        if (reporting) {
            badWordsLog = new Discord.MessageEmbed().setAuthor(messageMember.displayName + " (" + messageMember.id + ")", messageMember.user.displayAvatarURL()).setTitle("Questionable Content:").addField(messageMember.displayName + " (" + message.author.id + ")", message.channel + ": " + message.content).setColor('RED');
            if (isEdit) {
                badWordsLog.setFooter("This is an edit.")
            }
            bot.channels.cache.get(logsChannel).send({ embeds: [badWordsLog] });
        }
    }
    catch(err) {
        logger.error("Something went wrong reporting message: " + message.url);
    }
}

function selfCleaner(message) {
    message.delete();
}

async function deleteReporter(message) {
    try {
        if (!message.guild) {return;}
        if (!message.guild.available) {return;}
        if (message.guild.id != guildID[0]) {return;}
        if (message.system) {return;}
        if (message.author.bot) {
            if (message.author.id == bot.user.id && logsChannel == message.channel.id) {
                message.channel.send("One of my logs was deleted from here.");
            }
            return;
        }
        var channelToNotify = logsChannel;
        const entry = await message.guild.fetchAuditLogs({type: 'MESSAGE_DELETE'}).then(audit => audit.entries.first())
        let user = ""
        if (entry.extra.channel.id === message.channel.id
          && (entry.target.id === message.author.id)
          && (entry.createdTimestamp > (Date.now() - 5000))
          && (entry.extra.count >= 1)) {
            user = entry.executor;
        } else {
            user = message.author;
        }
        var deleteLog;
        var attachmessage = "";
        var attaches = [...message.attachments.values()];
        var attachnames = "";
        for (i = 0; i < attaches.length; i++) {
            if (i == attaches.length -1 && i != 0) {attachnames += "and ";}
            attachnames += attaches[i].proxyURL
            if (i != attaches.length -1 && attaches.length != 2) {attachnames += ", ";}
            if (i != attaches.length -1 && attaches.length == 2) {attachnames += " ";}
        }
        if (attaches.length > 1) {attachmessage = " with attachments " + attachnames;}
        if (attaches.length == 1) {attachmessage = " with an attachment " + attachnames;}
        messageMember = message.author.username;
        if (message.guild.members.cache.has(message.author.id)) { messageMember = await message.guild.members.fetch(message.author); }
        var deleteMember = await message.guild.members.fetch(user);
        if (messageMember.id == deleteMember.id) {
            deleteLog = new Discord.MessageEmbed().setAuthor(messageMember.displayName + " (" + messageMember.id + ")", messageMember.user.displayAvatarURL());
        }
        else {
            deleteLog = new Discord.MessageEmbed().setAuthor(messageMember.displayName + " (" + messageMember.id + ")", messageMember.user.displayAvatarURL()).setFooter("Deleted by " + deleteMember.displayName + " (" + deleteMember.id + ")", deleteMember.user.displayAvatarURL());
        }
        if (message.content.length < 1024) { deleteLog.addField("Deletion", "<#" + message.channel.id + ">: " + message.content); }
        else {
            deleteLog.addField("Deletion", "<#" + message.channel.id + ">: " + message.content.substring(0, 1000)).addField("Deletion cont.", message.content.substring(1000, 2000));
            if (message.content.length > 2000) {
                deleteLog.addField("Deletion cont.", message.content.substring(2000, 3000));
                if (message.content.length > 3000) {
                    deleteLog.addField("Deletion cont.", message.content.substring(3000));
                }
            }
        }
        if (attaches.length == 0) {
            bot.channels.cache.get(channelToNotify).send({ embeds: [deleteLog] });
        }
        else if (attaches.length == 1) {
            deleteLog.setImage(attaches[0].proxyURL);
            bot.channels.cache.get(channelToNotify).send({ embeds: [deleteLog] });
        }
        else {
            bot.channels.cache.get(channelToNotify).send({ content: "The following " + attachmessage, embeds: [deleteLog]});
        }
    }
    catch(err) {
        logger.error("Something went wrong logging deleted message: " + message.content)
    }
}


async function raidBan(message, messageMember) {
    if (messageMember.roles.cache.size > 1) { return; }
    if (message.mentions.users.size > 5) {
        messageMember.guild.members.ban(message.author, {
            days: 1,
            reason: "Mention spam from non-member"
        });
        bot.channels.cache.get(logsChannel).send({ embeds: [new Discord.MessageEmbed().setAuthor(messageMember.displayName + " (" + messageMember.id + ")", messageMember.displayAvatarURL()).addField("Banned", "Automatically banned for mention spam")] });
    }
    const count = message.channel.messages.filter(m => m.author.id === message.author.id && m.createdTimestamp > Date.now() - 2000).size;
    if(count > 5) {
        messageMember.guild.members.ban(message.author, {
            days: 1,
            reason: "Message spam from non-member"
        });
        bot.channels.cache.get(logsChannel).send({ embeds: [new Discord.MessageEmbed().setAuthor(messageMember.displayName + " (" + messageMember.id + ")", messageMember.displayAvatarURL()).addField("Banned", "Automatically banned for message spam")] });
    }
}

async function mute(interaction) {
    var muteHours = interaction.options.getString('hours');
    var muteMember = await interaction.guild.members.fetch(interaction.options.getUser('member'))
    setTimeout(function () {
        unmute(muteMember.id);
    }, muteHours * 3600000)
    if (muteLog.content.includes(interaction.options.getUser('member').id)) {
        var logs = muteLog.content;
        var newLog = logs.split("\n")[0];
        for (var x = 1; x < logs.split("\n").length; x++) {
            if (!logs.split("\n")[x].includes(interaction.options.getUser('member').id)) { newLog += "\n" + logs.split("\n")[x]; }
        }
        await muteLog.edit(newLog);
    }
    d = new Date();
    unmuteTime = muteHours * 3600000 + d.getTime();
    await muteLog.edit(muteLog.content + "\n" + interaction.options.getUser('member').id + " " + unmuteTime);
    muteLog = await bot.channels.cache.get(logsChannel).messages.fetch("934067351199031357");
    theLog = new Discord.MessageEmbed().setAuthor(muteMember.displayName + " (" + muteMember.id + ")", muteMember.displayAvatarURL()).addField("Muted", "For " + muteHours + " hours.");
    //interaction.reply("Member " + muteMember.displayName + " (id " + interaction.options.getUser('member').id + ") muted for " + muteHours + " hours.");
    await muteMember.roles.add(message.guild.roles.cache.get(muteRole));
    var muteMessage = "You have been muted for " + muteHours + " hours";
    if (interaction.options.getString('reason')) {
        muteMessage += " for \"" + interaction.options.getString('reason') + "\"";
        theLog.addField("Reason:", interaction.options.getString('reason'));
    }
    else { muteMessage += "."; }
    interaction.reply({ embeds: [theLog] })
    await muteMember.send(muteMessage);
    bot.channels.cache.get(logsChannel).send({ embeds: [theLog]})
}

async function unmute(id) {
    if (!bot.guilds.cache.get(guildId[0]).members.cache.has(id)) {
        bot.channels.cache.get(logsChannel).send("Member <@" + id + "> has left before scheduled unmute time.");
    }
    else {
        member = await bot.guilds.cache.get(guildId[0]).members.fetch(id);
        member.roles.remove(member.guild.roles.cache.get(muteRole));
        bot.channels.cache.get(logsChannel).send("Member " + member.displayName + " (id " + member.id + ") unmuted.");
    }
    var logs = muteLog.content;
    var newLog = logs.split("\n")[0];
    for (var x = 1; x < logs.split("\n").length; x++) {
        if (!logs.split("\n")[x].includes(id)) { newLog += "\n" + logs.split("\n")[x]; }
    }
    await muteLog.edit(newLog);
    muteLog = await bot.channels.cache.get(logsChannel).messages.fetch("934067351199031357");
}

async function ban(message, isMod) {
    var banMember = await bot.guilds.cache.get(guildId[0]).members.fetch(interaction.options.getUser('member'));
    if (banMember.roles.cache.has("932431108170207243") || banMember.roles.cache.has("922349528588386394")) {
        interaction.reply({ content: "I'm sorry, I won't ban another mod or admin.", ephemeral: true });
        return;
    }
    if (banMember.bannable) {
        if (interaction.options.getString('reason')) { await banMember.send("You've been banned from Project Everdawn for the following reason: " + interaction.options.getString('reason')); }
        await bot.guilds.cache.get(guildId[1]).members.ban(banMember.user, { reason: interaction.options.getString('reason') });
        interaction.reply("Member " + banMember.displayName + " (id " + key + ") banned.");
    }
}

async function updateWords(interaction) {
    if (!interaction.memberPermissions.has("MANAGE_SERVER")) {return;}
    var theLog;
    let theWord = ""
    if (interaction.options.getBoolean('leading-space')) {
        theWord += " ";
    }
    theWord += interaction.options.getString('word');
    if (interaction.options.getBoolean('trailing-space')) {
        theWord += " ";
    }
    switch (interaction.options.getString('type')) {
        case "delete":
        theLog = deleteList;
        break;
        case "report":
        theLog = reportList;
        break;
        case "exceptions":
        theLog = exceptionList;
        break;
    }
    if (interaction.options.getString('action') == "add") {
        await theLog.edit(theLog.content + "\n" + theWord.toLowerCase());
        interaction.reply({ content: "`" + theWord + "` successfully added to the " + interaction.options.getString('type') + " list.", ephemeral: true });
    }
    else {
        if (theLog.content.includes("\n" + theWord.toLowerCase())) {
            let newLog = theLog.content.split("\n")[0];
            for (x = 1; x < theLog.content.split("\n").length; x++) {
                if (theLog.content.split("\n")[x] != theWord.toLowerCase()) {
                    newLog += "\n" + theLog.content.split("\n")[x];
                }
            }
            await theLog.edit(newLog);
            interaction.reply({ content: "`" + theWord + "` successfully removed from the " + interaction.options.getString('type') + " list.", ephemeral: true });
        }
        else {
            interaction.reply({ content: "`" + theWord + "` not found on the " + interaction.options.getString('type') + " list.  Please confirm you typed it exactly as it appears, including all special characters (though not case sensitive).", ephemeral: true });
        }
    }
    deleteList = await bot.channels.cache.get("922350419005558834").messages.fetch("934010882965512232");
    reportList = await bot.channels.cache.get("922350419005558834").messages.fetch("934011065317085225");
    exceptionList = await bot.channels.cache.get("922350419005558834").messages.fetch("934011123412381706");
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

bot.on('error', console.error);

bot.on("messageCreate", async function(message) {
    if (message.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
            await message.fetch();
        } catch (error) {
            logger.error('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }
    lowmessage = message.content.toLowerCase();

    if (message.author.id == "135999597947387904" && message.content.indexOf(",eval ") == 0 && message.channel.id != "531433553225842700") {
        message.channel.send("```javascript\n" + eval(message.content.split(",eval ")[1]) + "```");
    }

    if (!message.channel.guild) {return;}

    if (message.channel.guild.id != guildID[0]) {return;}

    if (message.system || !message.channel.guild.members.cache.has(message.author.id)) {return;}

    if (message.author.bot) {return;}

    let messageMember = await message.channel.guild.members.fetch(message.author);

    await raidBan(message, messageMember);

    await badWordsReporter(message, messageMember, false);
})

bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'update-words':
        await updateWords(interaction);
        break;
        case 'mute':
        await mute(interaction);
        break;
        case 'ban':
        await ban(interaction);
        break;
    }
})

bot.on("messageDelete", async function(message) {
    //if (message.partial) { message.fetch(); }
    deleteReporter(message);
})

bot.on("messageDeleteBulk", async function(messages) {
    messages.forEach(async function(value, key) {
        //if (value.partial) { value.fetch(); }
        await deleteReporter(value);
    });
})

bot.on("messageUpdate", async function(oldMessage, newMessage) {
    if (newMessage.partial || oldMessage.partial) {
        try {
            newMessage = await newMessage.fetch();
        } catch (error) {
            logger.error('Something went wrong when fetching the message: ', error)
            return;
        }
        if (!newMessage.channel.guild || !newMessage.channel.guild.available || newMessage.channel.guild.id != guildID[0]) {return;}
        messageMember = await newMessage.channel.guild.members.fetch(newMessage.author.id);
        badWordsReporter(newMessage, messageMember, true);
        return;
    }
    let diff = ss.compareTwoStrings(oldMessage.content, newMessage.content);
    if (!newMessage.channel.guild) {return;}
    if (!newMessage.channel.guild.available) {return;}
    if (newMessage.channel.guild.id != guildID[0]) {return;}
    if (!newMessage.author) {return;}
    if (newMessage.author.bot) {
        /*if (!oldMessage.partial && newMessage.author.id == bot.user.id && oldMessage.content != newMessage.content) {
            bot.channels.cache.get("695205182971052103").send({ embeds: [new Discord.MessageEmbed().setThumbnail(bot.user.displayAvatarURL()).setTitle("Edited message from " + bot.user.displayName + " (" + oldMessage.author.id + ")").addField("Channel:", "<#" + oldMessage.channel.id + ">").addField("Original Message:", oldMessage.content).addField("New Message:", newMessage.content).setColor('BLUE')] });
        }*/
        return;
    }
	var deleteLog = ""
    messageMember = await newMessage.channel.guild.members.fetch(newMessage.author);
    /*if (oldMessage.partial) {
        deleteLog = new Discord.MessageEmbed().setThumbnail(messageMember.user.displayAvatarURL()).setTitle("Uncached edited message from " + messageMember.displayName + " (" + newMessage.author.id + ")").addField("Channel:", "<#" + newMessage.channel + ">").setColor('BLUE').setURL(newMessage.url);
        if (newMessage.content.length < 1024) { deleteLog.addField("New Message:", newMessage.content) }
        else { deleteLog.addField("New Message:", newMessage.content.substring(0, 1000)).addField("New Message cont.:", newMessage.content.substring(1000))}
    }
	else*/ if (oldMessage.content && newMessage.content) {
        deleteLog = new Discord.MessageEmbed().setThumbnail(messageMember.user.displayAvatarURL()).setTitle("Edited message from " + messageMember.displayName + " (" + oldMessage.author.id + ")").addField("Channel:", "<#" + oldMessage.channel.id + ">").setColor('BLUE').setURL(newMessage.url);
        if (oldMessage.content.length < 1024) { deleteLog.addField("Original Message:", oldMessage.content) }
        else { deleteLog.addField("Original Message:", oldMessage.content.substring(0, 1000)).addField("Original Message cont.:", oldMessage.content.substring(1000))}
        if (newMessage.content.length < 1024) { deleteLog.addField("New Message:", newMessage.content) }
        else { deleteLog.addField("New Message:", newMessage.content.substring(0, 1000)).addField("New Message cont.:", newMessage.content.substring(1000))}
    }
    else if (newMessage.content) {
        deleteLog = new Discord.MessageEmbed().setThumbnail(messageMember.user.displayAvatarURL()).setTitle("Edited textless message from " + messageMember.displayName + " (" + newMessage.author.id + ")").addField("Channel:", "<#" + newMessage.channel + ">").setColor('BLUE').setURL(newMessage.url);
        if (newMessage.content.length < 1024) { deleteLog.addField("New Message:", newMessage.content) }
        else { deleteLog.addField("New Message:", newMessage.content.substring(0, 1000)).addField("New Message cont.:", newMessage.content.substring(1000))}
    }
	await bot.channels.cache.get(logsChannel).send({ embeds: [deleteLog] });
})

bot.on("guildMemberRemove", async function(member) {
    if (member.guild.id != guildID[0]) {return;}
    var d = new Date();
    if (member.roles.cache.has(muteRole) && !muteLog.content.includes(member.id + " ")) {
        var unmuteTime = d.getTime() + 604800000;
        await muteLog.edit(muteLog.content + "\n" + member.id + " " + unmuteTime);
        muteLog = await bot.channels.cache.get(logsChannel).messages.fetch("934067351199031357");
        bot.channels.cache.get(logsChannel).send(member.displayName + " (id " + member.id + ") left while muted with no fixed duration and has been muted for one week in case they return. If you wish to change the duration, please use `,mute HOURS <@" + member.id + ">`.");
    }
    var newBlood = new Discord.MessageEmbed().setAuthor(member.displayName + " (" + member.id + ")", member.user.displayAvatarURL()).addField("Left", d.toString()).setColor('RED');
    const entry = await member.guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first())
    const entry2 = await member.guild.fetchAuditLogs({type: 'MEMBER_KICK'}).then(audit => audit.entries.first())
    if (entry != null && (entry.target.id === member.id) && (entry.createdTimestamp > (Date.now() - 5000))) {
        await newBlood.setFooter("Banned by " + entry.executor.username, entry.executor.displayAvatarURL());
    }
    else if (entry2 != null && (entry2.target.id === member.id) && (entry2.createdTimestamp > (Date.now() - 5000))) {
        await newBlood.setFooter("Kicked by " + entry2.executor.username, entry2.executor.displayAvatarURL());
    }
    await bot.channels.cache.get(logsChannel).send({ embeds: [newBlood] });
})

bot.on("guildMemberAdd", function(member) {
    if (member.guild.id != guildID[0]) {return;}
    if (logMessage.content.includes(member.id + " ")) { member.roles.add(member.guild.roles.cache.get(muteRole)); }
    var d = new Date();
    var newBlood = new Discord.MessageEmbed().setAuthor(member.displayName + " (" + member.id + ")", member.user.displayAvatarURL()).addField("Joined", d.toString()).setColor('GREEN');
    bot.channels.cache.get(logsChannel).send({ embeds: [newBlood] });
})

bot.on("userUpdate", async function(oldUser, newUser) {
    try {
        if (!bot.guilds.cache.get(guildID[0]).members.cache.has(oldUser.id) || !bot.guilds.cache.get(guildID[0]).members.cache.has(newUser.id)) {return;}
        newMember = await bot.guilds.cache.get(guildID[0]).members.fetch(newUser.id);
        let reporting = false;
        let theLog = new Discord.MessageEmbed().setAuthor(newMember.displayName + " (" + newMember.id + ") ", oldUser.displayAvatarURL());
        if (oldUser.displayAvatarURL != newUser.displayAvatarURL) {
            reporting = true;
            theLog.addField("Update:", "New avatar").setThumbnail(newUser.displayAvatarURL());
        }
    }
    catch(err) {
        logging.error("Something went wrong reporting updates to user " + oldUser.id)
    }
})

bot.on("guildMemberUpdate", function(oldMember, newMember) {
    try {
        let reporting = false;
        let theLog = new Discord.MessageEmbed().setAuthor(oldMember.displayName + " (" + oldMember.id + ") ", oldMember.displayAvatarURL());
        if (oldMember.displayAvatarURL != newMember.displayAvatarURL) {
            reporting = true;
            theLog.addField("Update:", "New avatar").setThumbnail(oldMember.displayAvatarURL());
        }
        if (oldMember.displayName != newMember.displayName) {
            reporting = true;
            theLog.addField("New name:", newMember.displayName);
        }
        if (!oldMember.roles.cache.equals(newMember.roles.cache)) {
            reporting = true;
            let newRoles = [];
            let oldRoles = [];
            let diff = oldMember.roles.cache.difference(newMember.roles.cache);
            diff.forEach((role) => {
                if (oldMember.roles.cache.has(role.id)) {
                    oldRoles.push(role);
                }
                else {
                    newRoles.push(role);
                }
            })
            let theMessage = "";
            if (newRoles.length > 0) {
                if (newRoles.length > 1) {
                    theMessage += "Added roles: "
                    for (var i = 0; i < newRoles.length; i++) {
                        theMessage += "<@&" + newRoles[i].id + ">";
                        if (i < newRoles.length - 1) {
                            theMessage += ", ";
                            if (i == newRoles.length - 2) {
                                theMessage += " and ";
                            }
                        }
                        else {
                            theMessage += "."
                        }
                    }
                }
                else {
                    theMessage += "Added role: <@&" + newRoles[0].id + ">";
                }
            }
            if (oldRoles.length > 0) {
                if (theMessage) {
                    theMessage += "\n";
                }
                if (oldRoles.length > 1) {
                    theMessage += "Removed roles: "
                    for (var j = 0; j < oldRoles.length; j++) {
                        theMessage += "<@&" + oldRoles[j].id + ">";
                        if (j < oldRoles.length - 1) {
                            theMessage += ", ";
                            if (j == oldRoles.length - 2) {
                                theMessage += " and ";
                            }
                        }
                        else {
                            theMessage += ".";
                        }
                    }
                }
                else {
                    theMessage += "Removed role: <@&" + oldRoles[0].id + ">";
                }
            }
            theLog.addField("Role change:", theMessage);
        }
        if (!oldMember.isCommunicationDisabled() && newMember.isCommunicationDisabled()) {
            theLog.addField("Update:", "Was given a timeout");
        }
        if (oldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {
            theLog.addField("Update:", "Is no longer in timeout");
        }
        bot.channels.cache.get(logsChannel).send({ embeds: [theLog] });
    }
    catch(err) {
        logging.error("Something went wrong reporting update to member " + newMember.id)
    }
})

bot.on("guildBanRemove", async function(ban) {
    if (ban.partial) {
        ban.fetch();
    }
    let theLog = new Discord.MessageEmbed().setAuthor(ban.username + " (" + ban.id + ")", ban.displayAvatarURL).setTitle("Unbanned")
    const entry = await ban.guild.fetchAuditLogs({type: 'MEMBER_BAN_REMOVE'}).then(audit => audit.entries.first())
    if (entry != null && (entry.target.id === ban.user.id) && (entry.createdTimestamp > (Date.now() - 5000))) {
        theLog.setFooter("by " + entry.executor.username, entry.executor.displayAvatarURL());
    }
    bot.channels.cache.get(logsChannel).send({ embeds: [theLog]});
})

bot.on("guildBanAdd", async function(ban) {
    if (ban.partial) {
        ban.fetch();
    }
    let theLog = new Discord.MessageEmbed().setAuthor(ban.username + " (" + ban.id + ")", ban.displayAvatarURL).setTitle("Unbanned")
    const entry = await ban.guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first())
    if (entry != null && (entry.target.id === ban.user.id) && (entry.createdTimestamp > (Date.now() - 5000))) {
        theLog.setFooter("by " + entry.executor.username, entry.executor.displayAvatarURL());
    }
    bot.channels.cache.get(logsChannel).send({ embeds: [theLog]});
})

bot.on("voiceStateUpdate", function(oldState, newState) {
    if (oldState.serverMute && !newState.serverMute) {
        bot.channels.cache.get(logsChannel).send({ embeds: [new Discord.MessageEmbed().setAuthor(oldState.username + " (" + oldState.id + ")", oldState.displayAvatarURL()).addField("Voice update:", "Unmuted")] });
    }
    if (!oldState.serverMute && newState.serverMute) {
        bot.channels.cache.get(logsChannel).send({ embeds: [new Discord.MessageEmbed().setAuthor(oldState.username + " (" + oldState.id + ")", oldState.displayAvatarURL()).addField("Voice update:", "Muted")] });
    }
    if (oldState.serverDeaf && !newState.serverDeaf) {
        bot.channels.cache.get(logsChannel).send({ embeds: [new Discord.MessageEmbed().setAuthor(oldState.username + " (" + oldState.id + ")", oldState.displayAvatarURL()).addField("Voice update:", "Undeafened")] });
    }
    if (!oldState.serverMute && newState.serverMute) {
        bot.channels.cache.get(logsChannel).send({ embeds: [new Discord.MessageEmbed().setAuthor(oldState.username + " (" + oldState.id + ")", oldState.displayAvatarURL()).addField("Voice update:", "Deafened")] });
    }
})

bot.on("messageReactionAdd", async function(messageReaction, user) {
    if (roleMessageId.includes(messageReaction.message.id)) {
        member = await messageReaction.message.guild.members.fetch(user);
        if(roleReact.includes(messageReaction.emoji.name) && messageReaction.message.id == roleMessageId[roleReact.indexOf(messageReaction.emoji.name)]) {
            member.roles.add(roleId[roleReact.indexOf(messageReaction.emoji.name)]);
        }
    }
})

bot.on("messageReactionRemove", async function(messageReaction, user) {
    if (roleMessageId.includes(messageReaction.message.id)) {
        member = await messageReaction.message.guild.members.fetch(user);
        if(roleReact.includes(messageReaction.emoji.name) && messageReaction.message.id == roleMessageId[roleReact.indexOf(messageReaction.emoji.name)]) {
            member.roles.remove(roleId[roleReact.indexOf(messageReaction.emoji.name)]);
        }
    }
})

bot.login(process.env.token)
