import { Bot } from 'grammy'
import { handleVoiceMessage } from './audio'

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '')

// Обработка команды /start
bot.command('start', async (ctx) => {
  const firstName = ctx.from?.first_name || 'Гость'
  await ctx.reply(
    `Привет, ${firstName}! 👋\n\nЯ бот, который поможет тебе. Вот что я умею:\n\n/help - показать список команд\n/about - информация о боте\n\nТакже я могу преобразовывать голосовые сообщения в текст! Просто отправь мне голосовое сообщение.`
  )
})

// Обработка команды /help
bot.command('help', async (ctx) => {
  await ctx.reply(
    'Список доступных команд:\n\n' +
    '/start - начать общение с ботом\n' +
    '/help - показать это сообщение\n' +
    '/about - информация о боте\n\n' +
    'Дополнительные возможности:\n' +
    '- Отправьте голосовое сообщение, и я преобразую его в текст'
  )
})

// Обработка команды /about
bot.command('about', async (ctx) => {
  await ctx.reply('Я простой бот, созданный с помощью grammY и Next.js 15! 🚀\nЯ умею преобразовывать голосовые сообщения в текст используя OpenAI Whisper.')
})

// Обработка текстовых сообщений
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.toLowerCase()
  
  if (text.includes('привет')) {
    await ctx.reply('Привет! Как я могу помочь?')
  } else if (text.includes('пока')) {
    await ctx.reply('До свидания! Буду рад помочь снова!')
  } else {
    await ctx.reply('Я пока не знаю как ответить на это. Попробуйте использовать команды /help для просмотра доступных команд.')
  }
})

// Обработка голосовых сообщений
bot.on('message:voice', handleVoiceMessage)

// Обработка ошибок
bot.catch((err) => {
  console.error('Ошибка в боте:', err)
})

export default bot 