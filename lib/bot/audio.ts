import { HfInference } from '@huggingface/inference'
import { Context } from 'grammy'

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN || '')

export async function handleVoiceMessage(ctx: Context) {
  try {
    if (!ctx.message?.voice || !ctx.chat) return

    const statusMessage = await ctx.reply('Обрабатываю голосовое сообщение...', {
      reply_to_message_id: ctx.message.message_id
    })

    // Получаем информацию о голосовом сообщении
    const file = await ctx.getFile()
    const filePath = file.file_path

    if (!filePath) {
      await ctx.reply('Не удалось получить аудио файл', {
        reply_to_message_id: ctx.message.message_id
      })
      return
    }

    // Получаем прямую ссылку на файл
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`

    // Скачиваем аудио файл
    const response = await fetch(fileUrl)
    const audioBlob = await response.blob()

    // Распознаем речь
    const result = await hf.automaticSpeechRecognition({
      model: 'openai/whisper-large-v3-turbo',
      data: audioBlob,
    })

    // Отправляем результат с использованием тега tg-spoiler
    await ctx.reply(`<tg-spoiler>${result.text}</tg-spoiler>`, {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: 'HTML'
    })

    // Удаляем статусное сообщение
    await ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id)
  } catch (error) {
    console.error('Error processing voice message:', error)
    if (ctx.message) {
      await ctx.reply('Произошла ошибка при обработке голосового сообщения', {
        reply_to_message_id: ctx.message.message_id
      })
    }
  }
} 