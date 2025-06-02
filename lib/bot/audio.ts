import { InferenceClient } from '@huggingface/inference'
import { Context } from 'grammy'

const client = new InferenceClient(process.env.HUGGINGFACE_TOKEN || '')

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
    const audioBuffer = await response.arrayBuffer()

    // Конвертируем аудио в текст с помощью Whisper
    const result = await client.automaticSpeechRecognition({
      model: 'openai/whisper-large-v3',
      data: audioBuffer
    })

    // Удаляем сообщение о процессе обработки
    await ctx.api.deleteMessage(ctx.chat.id, statusMessage.message_id)

    // Отправляем результат с цитированием исходного сообщения
    await ctx.reply(`🎯 Текст из аудио:\n<tg-spoiler>${result.text}</tg-spoiler>`, {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: 'HTML'
    })
  } catch (error) {
    console.error('Ошибка при обработке аудио:', error)
    if (ctx.message) {
      await ctx.reply('Произошла ошибка при обработке голосового сообщения. Попробуйте еще раз.', {
        reply_to_message_id: ctx.message.message_id
      })
    }
  }
} 