import { createClient } from 'jsr:@supabase/supabase-js@2.116.0'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization,content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
})
const service = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)

async function requireAdmin(req: Request) {
  const client = service()
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '')
  const { data: { user } } = await client.auth.getUser(token)
  if (!user) throw new Error('AUTH')
  const { data: admin } = await client.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!admin) throw new Error('AUTH')
  return client
}

const text = (value: unknown, max: number) => String(value || '').trim().slice(0, max)
const validPath = (value: unknown, id: string) => {
  const path = text(value, 700)
  return path && path.startsWith(`${id}/`) ? path : null
}
const token = () => `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`

async function decorate(client: ReturnType<typeof service>, row: Record<string, any>) {
  let image_url: string | null = null
  if (row.image_path) {
    const { data } = await client.storage.from('private-link-assets').createSignedUrl(row.image_path, 3600)
    image_url = data?.signedUrl || null
  }
  const [views, clicks] = await Promise.all([
    client.from('private_product_link_events').select('id', { count: 'exact', head: true }).eq('link_id', row.id).eq('event_type', 'view'),
    client.from('private_product_link_events').select('id', { count: 'exact', head: true }).eq('link_id', row.id).eq('event_type', 'click'),
  ])
  return { ...row, image_url, views: views.count || 0, clicks: clicks.count || 0 }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const client = await requireAdmin(req)
    if (req.method === 'GET') {
      const { data, error } = await client.from('private_product_links').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return json({ links: await Promise.all((data || []).map((row) => decorate(client, row))) })
    }

    const body = await req.json()
    if (body.action === 'delete') {
      const id = text(body.id, 80)
      const { data: old } = await client.from('private_product_links').select('image_path,target_file_path').eq('id', id).maybeSingle()
      if (!old) return json({ error: 'Link não encontrado.' }, 404)
      const files = [old.image_path, old.target_file_path].filter(Boolean)
      if (files.length) await client.storage.from('private-link-assets').remove(files)
      const { error } = await client.from('private_product_links').delete().eq('id', id)
      if (error) throw error
      return json({ ok: true })
    }

    if (body.action !== 'save') return json({ error: 'Ação inválida.' }, 400)
    const id = text(body.id, 80) || crypto.randomUUID()
    const admin_name = text(body.admin_name, 120)
    const page_title = text(body.page_title, 160)
    const description = text(body.description, 5000)
    const action_type = body.action_type === 'download' ? 'download' : body.action_type === 'access' ? 'access' : ''
    if (!admin_name || !page_title || !description || !action_type) {
      return json({ error: 'Preencha o nome do link, o nome da página, a descrição e o tipo do botão.' }, 400)
    }

    const { data: old } = await client.from('private_product_links').select('*').eq('id', id).maybeSingle()
    const image_path = validPath(body.image_path, id) || old?.image_path || null
    const target_file_path = action_type === 'download' ? (validPath(body.target_file_path, id) || old?.target_file_path || null) : null
    let target_url: string | null = null
    if (action_type === 'access') {
      const raw = text(body.target_url, 2000)
      try {
        const parsed = new URL(raw)
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('URL')
        target_url = parsed.toString()
      } catch {
        return json({ error: 'Informe um endereço válido começando com http:// ou https://.' }, 400)
      }
    }
    if (action_type === 'download' && !target_file_path) return json({ error: 'Envie o arquivo que será baixado.' }, 400)

    const row = {
      id,
      share_token: old?.share_token || token(),
      admin_name,
      page_title,
      description,
      image_path,
      action_type,
      target_url,
      target_file_path,
      original_file_name: action_type === 'download' ? text(body.original_file_name, 255) || old?.original_file_name || 'arquivo' : null,
      active: body.active !== false,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await client.from('private_product_links').upsert(row).select().single()
    if (error) throw error

    const replaced = [
      old?.image_path && old.image_path !== data.image_path ? old.image_path : null,
      old?.target_file_path && old.target_file_path !== data.target_file_path ? old.target_file_path : null,
    ].filter(Boolean)
    if (replaced.length) await client.storage.from('private-link-assets').remove(replaced)
    return json({ link: await decorate(client, data) })
  } catch (error) {
    const unauthorized = String((error as Error)?.message) === 'AUTH'
    console.error(error)
    return json({ error: unauthorized ? 'Acesso não autorizado.' : 'Não foi possível administrar os links.' }, unauthorized ? 401 : 500)
  }
})
