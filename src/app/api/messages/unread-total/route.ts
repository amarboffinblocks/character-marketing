import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ count: 0 })
    }

    // This query finds messages that the user hasn't read yet
    // 1. Participant in the thread
    // 2. Not the sender of the message
    // 3. Message created after the user's last_read_at for that thread
    const { data, error } = await supabase.rpc('get_unread_message_count', {
      p_user_id: user.id
    })

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: threads } = await supabase
        .from('conversation_threads')
        .select('id')
        .or(`creator_id.eq.${user.id},buyer_id.eq.${user.id}`)

      if (!threads || threads.length === 0) {
        return NextResponse.json({ count: 0 })
      }

      const threadIds = threads.map(t => t.id)
      
      const { data: unreadMessages } = await supabase
        .from('conversation_messages')
        .select('id, thread_id, created_at')
        .in('thread_id', threadIds)
        .neq('sender_id', user.id)

      if (!unreadMessages) return NextResponse.json({ count: 0 })

      const { data: reads } = await supabase
        .from('conversation_reads')
        .select('thread_id, last_read_at')
        .eq('user_id', user.id)
        .in('thread_id', threadIds)

      const readsMap = new Map(reads?.map(r => [r.thread_id, r.last_read_at]) || [])
      
      const totalUnread = unreadMessages.filter(m => {
        const lastReadAt = readsMap.get(m.thread_id)
        return !lastReadAt || new Date(m.created_at) > new Date(lastReadAt)
      }).length

      return NextResponse.json({ count: totalUnread })
    }

    return NextResponse.json({ count: data || 0 })
  } catch (error) {
    console.error("[UNREAD_COUNT_ERROR]", error)
    return NextResponse.json({ count: 0 })
  }
}
