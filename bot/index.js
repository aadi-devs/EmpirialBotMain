import {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits,
  AttachmentBuilder
} from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message]
});

// Category configs
const TICKET_CATEGORIES = {
  payout: {
    label: 'Payout Desk',
    emoji: '💰',
    style: ButtonStyle.Success,
    description: 'First payout request, status verification, or bank/crypto payout queries.'
  },
  mentorship: {
    label: 'Mentorship Inquiry',
    emoji: '🎓',
    style: ButtonStyle.Primary,
    description: 'Cohort schedules, private mentoring curriculum, or technical chart reviews.'
  },
  vip: {
    label: 'VIP Access',
    emoji: '💎',
    style: ButtonStyle.Secondary,
    description: 'Private trading room access, premium tier verification, or subscription support.'
  },
  general: {
    label: 'General Support',
    emoji: '🎫',
    style: ButtonStyle.Secondary,
    description: 'Rules questions, server navigation, or general community inquiries.'
  }
};

async function applyCustomNameStyle(guildId) {
  if (!guildId || !process.env.DISCORD_TOKEN) return;
  try {
    const payload = {
      nick: 'EMPIRIAL',
      display_name_font_id: 8, // 8Bit (Pixelify Sans) font
      display_name_effect_id: 3, // Neon effect
      display_name_colors: [16711680] // Red (#FF0000)
    };
    const res = await fetch(`https://discord.com/api/v9/guilds/${guildId}/members/@me`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      console.log(`[AFX Ticket Bot] Display Name Style (Medieval, Pop, Black) active on guild ${guildId}`);
    }
  } catch (err) {
    console.error('[AFX Ticket Bot] Failed to apply display name style:', err);
  }
}

client.once('ready', async () => {
  console.log(`[AFX Ticket Bot] Logged in as ${client.user.tag}`);
  console.log(`[AFX Ticket Bot] Active on Guild: ${process.env.GUILD_ID}`);
  await applyCustomNameStyle(process.env.GUILD_ID);
});

// Command & Interaction Handler
client.on('interactionCreate', async (interaction) => {
  try {
    // 1. Slash Commands
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'ticket-panel') {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: '❌ You require **Administrator** permissions to deploy this panel.', ephemeral: true });
        }

        const panelEmbed = new EmbedBuilder()
          .setTitle('🏛️ ▍𝐄𝐌𝐏𝐈𝐑𝐈𝐀𝐋 [ 𝐀𝐅𝐗 ] 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 𝐃𝐄𝐒𝐊')
          .setDescription(
            `Welcome to the **Empirial [ ᴀғx ]** Private Support Hub.\n\n` +
            `Please select the appropriate department below to initiate a private, one-on-one inquiry with our staff team.\n\n` +
            `💰 **Payout Desk** — Payout inquiries, eligibility, & verification\n` +
            `🎓 **Mentorship** — Private mentorship cohorts & technical curriculum\n` +
            `💎 **VIP Access** — Private trading room & role verification\n` +
            `🎫 **General** — Account help, server inquiries, & reports\n\n` +
            `*All tickets are strictly confidential and encrypted in our internal logs.*`
          )
          .setColor(0xE11D48)
          .setThumbnail(client.user.displayAvatarURL())
          .setFooter({ text: 'AFX Ticket Command Engine • 24/7 Operations', iconURL: interaction.guild.iconURL() })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('btn_open_payout').setLabel('Payout Desk').setEmoji('💰').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId('btn_open_mentorship').setLabel('Mentorship').setEmoji('🎓').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('btn_open_vip').setLabel('VIP Access').setEmoji('💎').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('btn_open_general').setLabel('General Support').setEmoji('🎫').setStyle(ButtonStyle.Secondary)
        );

        await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
        return interaction.reply({ content: '✅ AFX Ticket Panel successfully deployed!', ephemeral: true });
      }

      if (interaction.commandName === 'ticket-close') {
        const reason = interaction.options.getString('reason') || 'Resolved by staff';
        return handleTicketClose(interaction, reason);
      }

      if (interaction.commandName === 'ticket-transcript') {
        return handleTicketTranscript(interaction);
      }
    }

    // 2. Button Interactions (Opening Modal)
    if (interaction.isButton()) {
      const customId = interaction.customId;

      if (customId.startsWith('btn_open_')) {
        const categoryKey = customId.replace('btn_open_', '');
        const cat = TICKET_CATEGORIES[categoryKey] || TICKET_CATEGORIES.general;

        const modal = new ModalBuilder()
          .setCustomId(`modal_ticket_${categoryKey}`)
          .setTitle(`AFX Support: ${cat.label}`);

        const subjectInput = new TextInputBuilder()
          .setCustomId('ticket_subject')
          .setLabel('Subject / Summary')
          .setPlaceholder('Brief description of your request')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100);

        const detailsInput = new TextInputBuilder()
          .setCustomId('ticket_details')
          .setLabel('Details / Account or Order ID')
          .setPlaceholder('Include your member ID, transaction link, or detailed question...')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(1000);

        modal.addComponents(
          new ActionRowBuilder().addComponents(subjectInput),
          new ActionRowBuilder().addComponents(detailsInput)
        );

        return interaction.showModal(modal);
      }

      // In-Ticket Action Buttons
      if (customId === 'action_claim_ticket') {
        const staffRoles = (process.env.STAFF_ROLE_IDS || '').split(',').map(s => s.trim());
        const hasStaff = interaction.member.roles.cache.some(r => staffRoles.includes(r.id)) ||
                         interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels);

        if (!hasStaff) {
          return interaction.reply({ content: '❌ Only verified AFX Staff members can claim tickets.', ephemeral: true });
        }

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);
        embed.spliceFields(1, 1, { name: 'Assigned Staff', value: `👤 <@${interaction.user.id}> (${interaction.user.tag})`, inline: true });
        embed.setColor(0xF59E0B);

        const updatedRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('action_close_ticket').setLabel('Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('action_claimed_disabled').setLabel(`Claimed by ${interaction.user.username}`).setEmoji('✅').setStyle(ButtonStyle.Success).setDisabled(true),
          new ButtonBuilder().setCustomId('action_save_transcript').setLabel('Transcript').setEmoji('📄').setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ embeds: [embed], components: [updatedRow] });
        return interaction.followUp({ content: `🔔 Ticket claimed by <@${interaction.user.id}>. They will assist you shortly.` });
      }

      if (customId === 'action_close_ticket') {
        return handleTicketClose(interaction, 'Closed via control panel');
      }

      if (customId === 'action_save_transcript') {
        return handleTicketTranscript(interaction);
      }
    }

    // 3. Modal Submission Handler (Creates Ticket Channel)
    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('modal_ticket_')) {
        await interaction.deferReply({ ephemeral: true });

        const categoryKey = interaction.customId.replace('modal_ticket_', '');
        const cat = TICKET_CATEGORIES[categoryKey] || TICKET_CATEGORIES.general;
        const subject = interaction.fields.getTextInputValue('ticket_subject');
        const details = interaction.fields.getTextInputValue('ticket_details');

        const cleanUsername = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const channelName = `ticket-${cleanUsername}-${randomNum}`;

        const staffRoles = (process.env.STAFF_ROLE_IDS || '').split(',').filter(Boolean);
        const permissionOverwrites = [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AttachFiles
            ]
          }
        ];

        for (const roleId of staffRoles) {
          permissionOverwrites.push({
            id: roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ReadMessageHistory
            ]
          });
        }

        const ticketChannel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: process.env.TICKET_CATEGORY_ID || null,
          topic: `AFX Ticket | Creator: ${interaction.user.tag} (${interaction.user.id}) | Dept: ${cat.label}`,
          permissionOverwrites
        });

        const ticketEmbed = new EmbedBuilder()
          .setTitle(`🎫 ▍${cat.label.toUpperCase()} — #${randomNum}`)
          .setDescription(
            `Thank you for contacting **Empirial [ ᴀғx ]** support, <@${interaction.user.id}>.\n` +
            `Our team has been notified and will assist you shortly.\n\n` +
            `**Subject:** ${subject}\n` +
            `**Details / Account Info:**\n\`\`\`\n${details}\n\`\`\``
          )
          .addFields(
            { name: 'Status', value: '🟢 Open', inline: true },
            { name: 'Assigned Staff', value: '*Unassigned*', inline: true },
            { name: 'Category', value: `${cat.emoji} ${cat.label}`, inline: true }
          )
          .setColor(0xE11D48)
          .setFooter({ text: 'AFX Ticket Command Engine' })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('action_close_ticket').setLabel('Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId('action_claim_ticket').setLabel('Claim Ticket').setEmoji('🙋').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('action_save_transcript').setLabel('Transcript').setEmoji('📄').setStyle(ButtonStyle.Secondary)
        );

        await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [ticketEmbed], components: [row] });

        return interaction.editReply({
          content: `✅ Your ticket has been created: <#${ticketChannel.id}>`
        });
      }
    }
  } catch (error) {
    console.error('[AFX Bot] Interaction Error:', error);
    if (!interaction.replied && !interaction.deferred) {
      interaction.reply({ content: '⚠️ An error occurred processing your request.', ephemeral: true }).catch(() => {});
    }
  }
});

// Helper: Generate HTML Transcript
async function generateHtmlTranscript(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = Array.from(messages.values()).reverse();

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Transcript - ${channel.name}</title>
  <style>
    body { background-color: #0F172A; color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; }
    .header { border-bottom: 2px solid #E11D48; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: bold; color: #FFFFFF; }
    .meta { color: #94A3B8; font-size: 14px; margin-top: 4px; }
    .msg { display: flex; gap: 14px; margin-bottom: 16px; padding: 8px 12px; border-radius: 6px; }
    .msg:hover { background: #1E293B; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; }
    .content { flex: 1; }
    .author { font-weight: 600; color: #38BDF8; font-size: 15px; }
    .time { font-size: 12px; color: #64748B; margin-left: 8px; }
    .text { margin-top: 4px; line-height: 1.5; color: #E2E8F0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Empirial [AFX] Ticket Transcript</div>
    <div class="meta">Channel: #${channel.name} | Exported: ${new Date().toUTCString()}</div>
  </div>
  <div class="chat">
`;

  for (const m of sorted) {
    const avatarUrl = m.author.displayAvatarURL({ extension: 'png', size: 64 });
    const cleanContent = m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '*[Embed or Attachment]*';
    html += `
    <div class="msg">
      <img class="avatar" src="${avatarUrl}" alt="Avatar">
      <div class="content">
        <span class="author">${m.author.tag}</span>
        <span class="time">${m.createdAt.toLocaleTimeString()}</span>
        <div class="text">${cleanContent}</div>
      </div>
    </div>`;
  }

  html += `
  </div>
</body>
</html>`;

  return Buffer.from(html, 'utf-8');
}

// Helper: Handle Ticket Close
async function handleTicketClose(interaction, reason) {
  if (interaction.deferred || interaction.replied) {
    await interaction.followUp({ content: '🔒 Closing ticket and compiling transcript in 5 seconds...' });
  } else {
    await interaction.reply({ content: '🔒 Closing ticket and compiling transcript in 5 seconds...' });
  }

  const channel = interaction.channel;
  const transcriptBuffer = await generateHtmlTranscript(channel);
  const attachment = new AttachmentBuilder(transcriptBuffer, { name: `${channel.name}-transcript.html` });

  // Post to Log Channel
  const logChannelId = process.env.TICKET_LOGS_CHANNEL_ID;
  if (logChannelId) {
    try {
      const logChannel = await interaction.guild.channels.fetch(logChannelId);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('📁 ▍𝐓𝐈𝐂𝐊𝐄𝐓 𝐂𝐋𝐎𝐒𝐄𝐃 & 𝐀𝐑𝐂𝐇𝐈𝐕𝐄𝐃')
          .setDescription(`**Channel:** #${channel.name}\n**Closed By:** <@${interaction.user.id}>\n**Reason:** ${reason}`)
          .setColor(0x64748B)
          .setTimestamp();
        await logChannel.send({ embeds: [logEmbed], files: [attachment] });
      }
    } catch (e) {
      console.error('[AFX Bot] Log dispatch error:', e);
    }
  }

  // Delete channel after countdown
  setTimeout(async () => {
    try {
      await channel.delete(`Closed by ${interaction.user.tag}: ${reason}`);
    } catch (e) {
      console.error('[AFX Bot] Failed to delete channel:', e);
    }
  }, 5000);
}

// Helper: Handle On-Demand Transcript
async function handleTicketTranscript(interaction) {
  await interaction.deferReply();
  const transcriptBuffer = await generateHtmlTranscript(interaction.channel);
  const attachment = new AttachmentBuilder(transcriptBuffer, { name: `${interaction.channel.name}-transcript.html` });
  return interaction.editReply({ content: '📄 Here is the on-demand HTML transcript for this ticket:', files: [attachment] });
}

client.login(process.env.DISCORD_TOKEN);
