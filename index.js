// © 2025 Core Studio.
// تم إنشاء هذا الملف بواسطة بوت Core Studio للحماية.
// جميع الحقوق محفوظة. يُحظر النسخ أو التوزيع غير المصرح به.
// آخر تحديث: 2025-07-24T17:03:59.235Z
// --------------------------------------------

const { 
  Client, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  StringSelectMenuBuilder, 
  GatewayIntentBits, 
  Partials, 
  ButtonStyle, 
  PermissionFlagsBits 
} = require("discord.js");

// ===== الإعدادات العامة =====
const CONFIG = {
  PROBOT_ID: '282859044593598464',//ايدي البرو بوت (ProBot)
  PROBOT_COLOR: '#0099ff', // لون الإيمبدات الي رح يكون في كل الرسايل الي رح يبعتها البروبوت
  THUMBNAIL_URL: 'https://cdn.discordapp.com/attachments/1387515412916342854/1395615667603898438/99ed2b6d-1df2-4b61-b206-f920a5df012a.png?ex=6883a9a0&is=68825820&hm=76577f36214f69cfecf396e77e86c78578446bf5e16a5ff02a912747cb55807d&',//التامب نيل الي رح يكون في كل الرسايل الي رح يبعتها البروبوت

  //===== لا تعدل اي شي هنا ابدا حتى لو حرف واحد =====
  DELETE_MESSAGES: [
    "Deleting messages ...",
    "يرجى الإنتظار (تبقى",
    "Cool down",
    "has been locked.",
    "has been unlocked.",
    "Channel is already locked",
    "تم قفل الروم.",
    "<a:736257973906571306:1359161047960780973> الروم مقفل بالفعل",
    "تم فتح الروم."
  ],
  CONFIRMATION_MESSAGES: [
    "اكتب هذه الأرقام للتأكيد",
    "type these numbers to confirm :"
  ]
};

let SYSTEM_ENABLED = true;

// ===== الاشخاص  الي بيقدرو يشغلو او يطفو  النظام =====
const AUTHORIZED_USERS = [
  "123456789012345678",// id 1
  "987654321098765432", //id 2
  //تقدر تضيف اي دي اي شخص تبي
];


const safaa = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  allowedMentions: { 
    parse: ['users', 'roles', 'everyone'],
    repliedUser: false 
  },
  partials: [
    Partials.Channel, 
    Partials.Message, 
    Partials.User
  ]
});


safaa.setMaxListeners(20);


function cloneButton(button) {
  try {
    const buttonBuilder = new ButtonBuilder()
      .setLabel(button.label || 'Button')
      .setStyle(button.style);


    if (button.emoji) {
      if (button.emoji.id) {
        buttonBuilder.setEmoji({ 
          id: button.emoji.id, 
          name: button.emoji.name 
        });
      } else {
        buttonBuilder.setEmoji(button.emoji.name);
      }
    }


    if (button.style === ButtonStyle.Link) {
      buttonBuilder.setURL(button.url);
    } else {
      buttonBuilder.setCustomId(
        button.customId || `cloned_${Date.now()}_${Math.random()}`
      );
    }


    if (button.disabled) {
      buttonBuilder.setDisabled(true);
    }

    return buttonBuilder;
  } catch (error) {
    console.error('خطأ في تقليد الزر:', error);
    return null;
  }
}

function cloneSelectMenu(selectMenu) {
  try {
    const selectMenuBuilder = new StringSelectMenuBuilder()
      .setCustomId(
        selectMenu.customId || `cloned_select_${Date.now()}_${Math.random()}`
      )
      .setPlaceholder(selectMenu.placeholder || 'اختر خيار...');


    if (selectMenu.minValues !== undefined) {
      selectMenuBuilder.setMinValues(selectMenu.minValues);
    }
    if (selectMenu.maxValues !== undefined) {
      selectMenuBuilder.setMaxValues(selectMenu.maxValues);
    }


    const options = selectMenu.options.map(option => {
      const optionData = {
        label: option.label,
        value: option.value,
        description: option.description || undefined
      };


      if (option.emoji) {
        if (option.emoji.id) {
          optionData.emoji = { 
            id: option.emoji.id, 
            name: option.emoji.name 
          };
        } else {
          optionData.emoji = option.emoji.name;
        }
      }

      if (option.default) {
        optionData.default = true;
      }

      return optionData;
    });

    selectMenuBuilder.addOptions(options);

    if (selectMenu.disabled) {
      selectMenuBuilder.setDisabled(true);
    }

    return selectMenuBuilder;
  } catch (error) {
    console.error('خطأ في تقليد الـ Select Menu:', error);
    return null;
  }
}


async function cloneComponents(components) {
  const clonedComponents = [];

  for (const actionRow of components) {
    const newActionRow = new ActionRowBuilder();

    for (const component of actionRow.components) {
      if (component.type === 2) { 
        const clonedButton = cloneButton(component);
        if (clonedButton) {
          newActionRow.addComponents(clonedButton);
        }
      } else if (component.type === 3) { 
        const clonedSelectMenu = cloneSelectMenu(component);
        if (clonedSelectMenu) {
          newActionRow.addComponents(clonedSelectMenu);
        }
      }
    }

    if (newActionRow.components.length > 0) {
      clonedComponents.push(newActionRow);
    }
  }

  return clonedComponents;
}


function createCustomEmbed(originalEmbed) {
  return new EmbedBuilder(originalEmbed.toJSON())
    .setColor(CONFIG.PROBOT_COLOR)
    .setThumbnail(CONFIG.THUMBNAIL_URL);
}


function isSystemMessage(content) {
  const systemMessages = [
    "Sending command...",
    "probot is thinking"
  ];
  return systemMessages.some(text => content.includes(text));
}


function buildMessageOptions(message) {
  const options = {};

  if (message.content) {
    options.content = message.content;
  }

  if (message.embeds.length > 0) {
    options.embeds = message.embeds.map(embed => createCustomEmbed(embed));
  }

  if (message.attachments.size > 0) {
    // استخدام الملفات مباشرة بدلاً من الروابط للسرعة
    options.files = Array.from(message.attachments.values()).map(attachment => ({
      attachment: attachment.url,
      name: attachment.name || 'file'
    }));
  }

  return options;
}


safaa.once('ready', () => {
  console.clear();
  const line = '─'.repeat(50);
  console.log(line);
  console.log(`🌐 ${safaa.user.tag} is now online!`);
  console.log(line);
  console.log(`🤖 Bot Username  : ${safaa.user.username}`);
  console.log(`🆔 Bot ID        : ${safaa.user.id}`);
  console.log(`📅 Launched On   : ${new Date().toLocaleString()}`);
  console.log(line);
  console.log(`📊 Connected to  : ${safaa.guilds.cache.size} servers`);
  console.log(`👥 Total Users   : ${safaa.users.cache.size}`);
  console.log(line);
  console.log(`© 2024 CoreStudio - All Rights Reserved.`);
  console.log(`🔗 GitHub: https://github.com/corestudio1`);
  console.log(`🌐 YouTube: https://www.youtube.com/@corestudio1`);
  console.log(`💬 Discord: https://discord.gg/pbG5hNkxWj`);
  console.log(line);
  console.log('✅ Bot is fully operational and ready to serve!');
  console.log(line);

  safaa.user.setStatus("idle");
});


safaa.on('messageCreate', async (message) => {

  if (message.author.bot) return;


  if (message.content.startsWith('/probot system')) {

    const hasAdminPermission = message.member.permissions.has(PermissionFlagsBits.Administrator);
    const isAuthorizedUser = AUTHORIZED_USERS.includes(message.author.id);

    if (!hasAdminPermission && !isAuthorizedUser) {
      return message.reply({
        content: '❌ | ليس لديك صلاحية لاستخدام هذا الأمر!',
        ephemeral: true
      });
    }

    const args = message.content.split(' ');
    const action = args[2]?.toLowerCase();

    if (!action || (action !== 'on' && action !== 'off')) {
      return message.reply({
        content: '❌ | استخدام خاطئ! استخدم: `/probot system on` أو `/probot system off`',
        ephemeral: true
      });
    }

    const previousState = SYSTEM_ENABLED;
    SYSTEM_ENABLED = action === 'on';

    const statusEmoji = SYSTEM_ENABLED ? '🟢' : '🔴';
    const statusText = SYSTEM_ENABLED ? 'مفعل' : 'معطل';
    const actionText = SYSTEM_ENABLED ? 'تفعيل' : 'تعطيل';

    if (previousState === SYSTEM_ENABLED) {
      return message.reply({
        content: `${statusEmoji} | النظام ${statusText} بالفعل!`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(SYSTEM_ENABLED ? '#00ff00' : '#ff0000')
      .setTitle(`${statusEmoji} ${actionText} النظام`)
      .setDescription(
        `تم ${actionText} النظام بنجاح!\n\n` +
        `**الحالة الحالية:** ${statusText}\n` +
        `**يشمل:** نظام تقليد ProBot + نظام حذف الكلمات المحددة`
      )
      .setThumbnail(CONFIG.THUMBNAIL_URL)
      .setTimestamp()
      .setFooter({ 
        text: `تم التنفيذ بواسطة ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL() 
      });

    return message.reply({ embeds: [embed] });
  }
});

safaa.on('messageCreate', async (message) => {
  // التحقق من تفعيل النظام
  if (!SYSTEM_ENABLED) return;

  // التحقق من أن الرسالة من ProBot
  if (!message.author.bot || message.author.id !== CONFIG.PROBOT_ID) return;

  // التحقق من صلاحيات البوت في الروم
  const botMember = message.guild.members.cache.get(safaa.user.id);
  if (!botMember || !message.channel.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages)) {
    console.log(`⚠️ Bot doesn't have permission to write in channel: ${message.channel.name}`);
    return;
  }

  // تجاهل رسائل النظام
  if (isSystemMessage(message.content)) return;

  try {
    // بناء خيارات الرسالة
    const messageOptions = buildMessageOptions(message);

    // التحقق من وجود محتوى صالح للإرسال
    const hasContent = messageOptions.content && messageOptions.content.trim() !== '';
    const hasEmbeds = messageOptions.embeds && messageOptions.embeds.length > 0;
    const hasFiles = messageOptions.files && messageOptions.files.length > 0;

    if (!hasContent && !hasEmbeds && !hasFiles) {
      console.log('⚠️ تم تجاهل رسالة فارغة من ProBot');

      // حذف الرسالة الفارغة بدون إرسال بديل
      if (message.deletable) {
        await message.delete().catch(err => {
          if (err.code !== 10008) { // تجاهل خطأ "Unknown Message"
            console.error('خطأ في حذف الرسالة الفارغة:', err);
          }
        });
      }
      return;
    }

    // تقليد المكونات إذا وجدت (بشكل متوازي للسرعة)
    let clonedComponents = [];
    if (message.components.length > 0) {
      try {
        clonedComponents = await cloneComponents(message.components);
        if (clonedComponents.length > 0) {
          messageOptions.components = clonedComponents;
        }
      } catch (componentError) {
        console.error('خطأ في تقليد المكونات، سيتم التجاهل:', componentError);
      }
    }

    // إرسال الرسالة المقلدة وحذف الأصلية بشكل متوازي للسرعة
    const [sentMessage] = await Promise.allSettled([
      message.channel.send(messageOptions),
      message.deletable ? message.delete().catch(err => {
        if (err.code === 10008) {
          console.log('⚠️ الرسالة محذوفة بالفعل أو غير موجودة');
        } else {
          console.error('خطأ في حذف الرسالة الأصلية:', err);
        }
      }) : Promise.resolve()
    ]);

    if (sentMessage.status === 'rejected') {
      throw sentMessage.reason;
    }

  } catch (error) {
    if (error.code === 50006) {
      console.log('⚠️ تم منع إرسال رسالة فارغة');
    } else {
      console.error('حدث خطأ أثناء تقليد الرسالة:', error);
    }

    // محاولة حذف الرسالة الأصلية حتى لو فشل الإرسال
    if (message.deletable) {
      await message.delete().catch(err => {
        if (err.code !== 10008) {
          console.error('خطأ في حذف الرسالة بعد فشل التقليد:', err);
        }
      });
    }
  }
});

safaa.on("messageCreate", async (message) => {
  // التحقق من تفعيل النظام
  if (!SYSTEM_ENABLED) return;

  // التحقق من أن الرسالة من بوت
  if (!message.author.bot) return;

  const shouldDelete = CONFIG.DELETE_MESSAGES.some(text => 
    message.content.includes(text)
  );

  if (!shouldDelete) return;

  try {
    // تحديد وقت الحذف
    let deleteTimer = 0; 

    if (message.author.id === safaa.user.id) {
      deleteTimer = 3000; 
    } else if (message.author.id === CONFIG.PROBOT_ID) {
      deleteTimer = 0; 
    } else {
      deleteTimer = 1000;
    }

    console.log(`🗑️ سيتم حذف رسالة من ${message.author.tag} بعد ${deleteTimer}ms`);

    const deleteMessage = async () => {
      try {
        if (message.deletable) {
          await message.delete();
          console.log(`✅ تم حذف الرسالة من ${message.author.tag}`);
        }
      } catch (deleteError) {
        if (deleteError.code === 10008) {
          console.log(`⚠️ الرسالة من ${message.author.tag} محذوفة بالفعل أو غير موجودة`);
        } else {
          console.error(`❌ فشل حذف الرسالة من ${message.author.tag}:`, deleteError);
        }
      }
    };

    if (deleteTimer === 0) {
      await deleteMessage();
    } else {
      setTimeout(deleteMessage, deleteTimer);
    }

  } catch (error) {
    console.error(`❌ خطأ في نظام الحذف التلقائي من ${message.author.tag}:`, error);
  }
});

safaa.on("messageCreate", async (message) => {
  // التحقق من تفعيل النظام
  if (!SYSTEM_ENABLED) return;

  // التحقق من أن الرسالة من بوت
  if (!message.author.bot) return;

  // التحقق من رسائل التأكيد
  const isConfirmationMessage = CONFIG.CONFIRMATION_MESSAGES.some(text => 
    message.content.toLowerCase().includes(text.toLowerCase())
  );

  if (!isConfirmationMessage) return;

  try {
    // تحديد وقت الحذف
    let deleteTimer = 7000; 

    if (message.author.id === CONFIG.PROBOT_ID) {
      deleteTimer = 3000; 
    } else if (message.author.id === safaa.user.id) {
      deleteTimer = 7000; 
    }

    console.log(`🔢 سيتم حذف رسالة التأكيد من ${message.author.tag} بعد ${deleteTimer}ms`);

    setTimeout(async () => {
      try {
        if (message.deletable) {
          await message.delete();
          console.log(`✅ تم حذف رسالة التأكيد من ${message.author.tag}`);
        }
      } catch (deleteError) {
        if (deleteError.code === 10008) {
          console.log(`⚠️ رسالة التأكيد من ${message.author.tag} محذوفة بالفعل أو غير موجودة`);
        } else {
          console.error(`❌ فشل حذف رسالة التأكيد من ${message.author.tag}:`, deleteError);
        }
      }
    }, deleteTimer);

  } catch (error) {
    console.error(`❌ خطأ في نظام حذف رسائل التأكيد من ${message.author.tag}:`, error);
  }
});

safaa.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;


  if (!interaction.customId || !interaction.customId.startsWith('cloned_')) return;

  try {
    await interaction.reply({
      content: 'تم التفاعل مع المكون المقلد!',
      ephemeral: true
    });
  } catch (error) {
    console.error('خطأ في التعامل مع التفاعل المقلد:', error);
  }
});


process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
});

process.on("rejectionHandled", (error) => {
  console.error("❌ Rejection Handled:", error);
});

// ===== تسجيل الدخول =====
safaa.login("your_bot_token");//حط توكن بوتك هنا