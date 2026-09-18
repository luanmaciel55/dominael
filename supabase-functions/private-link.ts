import { createClient } from 'jsr:@supabase/supabase-js@2.116.0'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
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
const cleanToken = (value: unknown) => String(value || '').trim().replace(/[^a-f0-9]/gi, '').slice(0, 80)

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const client = service()
    const url = new URL(req.url)
    let shareToken = cleanToken(url.searchParams.get('token'))
    let action = 'view'
    if (req.method === 'POST') {
      const body = await req.json()
      shareToken = cleanToken(body.token)
      action = body.action === 'click' ? 'click' : ''
    }
    if (!shareToken || (req.method === 'POST' && action !== 'click')) return json({ error: 'Link inválido.' }, 400)

    const { data: link, error } = await client.from('private_product_links')
      .select('id,page_title,description,image_path,action_type,target_url,target_file_path,original_file_name')
      .eq('share_token', shareToken).eq('active', true).maybeSingle()
    if (error) throw error
    if (!link) return json({ error: 'Este link não existe ou foi desativado.' }, 404)

    await client.from('private_product_link_events').insert({ link_id: link.id, event_type: action })
    if (action === 'click') {
      if (link.action_type === 'access' && link.target_url) return json({ kind: 'access', href: link.target_url })
      if (link.action_type === 'download' && link.target_file_path) {
        const { data, error: signedError } = await client.storage.from('private-link-assets').createSignedUrl(link.target_file_path, 300, { download: true })
        if (signedError || !data?.signedUrl) throw signedError || new Error('FILE')
        return json({ kind: 'download', href: data.signedUrl, file_name: link.original_file_name || 'arquivo' })
      }
      return json({ error: 'O destino deste link não está disponível.' }, 404)
    }

    let image_url: string | null = null
    if (link.image_path) {
      const { data } = await client.storage.from('private-link-assets').createSignedUrl(link.image_path, 3600)
      image_url = data?.signedUrl || null
    }
    return json({
      link: {
        title: link.page_title,
        description: link.description,
        image_url,
        button_label: link.action_type === 'download' ? 'Baixe aqui' : 'Acesse aqui',
      },
    })
  } catch (error) {
    console.error(error)
    return json({ error: 'Não foi possível abrir este link agora.' }, 500)
  }
})
