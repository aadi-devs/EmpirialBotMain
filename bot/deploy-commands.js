import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Deploy the AFX interactive ticket creation panel to this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('ticket-close')
    .setDescription('Close this ticket, generate an HTML transcript, and clean up the channel')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for closing the ticket')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('ticket-transcript')
    .setDescription('Generate and download the HTML transcript for this ticket without closing it')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function deploy() {
  try {
    console.log(`[AFX Bot] Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log(`[AFX Bot] Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('[AFX Bot] Error deploying commands:', error);
  }
}

deploy();
