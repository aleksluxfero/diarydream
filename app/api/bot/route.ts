import { webhookCallback } from 'grammy'
import { type NextRequest } from 'next/server'
import bot from '@/lib/bot'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Обработчик webhook
export async function POST(req: NextRequest) {
  try {
    return await webhookCallback(bot, 'std/http')(req)
  } catch (error) {
    console.error('Ошибка при обработке webhook:', error)
    return new Response('Ошибка при обработке запроса', { status: 500 })
  }
} 