import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.116.0'

const C = window.DOMINAEL_CONFIG || {}
const client = createClient(C.supabaseUrl, C.supabasePublishableKey)
const $ = (selector) => document.querySelector(selector)
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])

let products = []
let creators = []
let settings = {}
let editingCreator = null

async function accessToken() {
  const { data } = await client.auth.getSession()
  return data.session?.access_token || ''
}

async function adminProducts(options = {}) {
  const response = await fetch(`${C.functionsBase}/admin-products`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await accessToken()}`,
    },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Não foi possível carregar as informações.')
  return data
}

async function loadData() {
  const data = await adminProducts()
  products = data.products || []
  creators = data.creators || []
  settings = data.settings || {}
  return data
}

function wrapField(id, label, placeholder = '') {
  const input = $(id)
  if (!input) return null
  let field = input.closest('.field')
  if (!field) {
    field = document.createElement('div')
    field.className = 'field'
    input.parentNode.insertBefore(field, input)
    field.appendChild(input)
  }
  if (!field.querySelector('label')) {
    const labelElement = document.createElement('label')
    labelElement.htmlFor = input.id
    labelElement.textContent = label
    field.insertBefore(labelElement, input)
  }
  if (placeholder && !input.placeholder) input.placeholder = placeholder
  return field
}

function roleLabel(role) {
  if (role === 'both') return 'Autor e idealizador'
  if (role === 'idealizer') return 'Idealizador'
  return 'Autor'
}

function prepareCreatorPanel() {
  wrapField('#creatorName', 'Nome do autor / idealizador')
  wrapField('#creatorRole', 'Função')
  wrapField('#creatorPhoto', 'Foto do perfil')
  const productsBox = $('#creatorProducts')
  if (productsBox && !productsBox.previousElementSibling?.matches('[data-creator-products-label]')) {
    const label = document.createElement('h3')
    label.dataset.creatorProductsLabel = '1'
    label.textContent = 'Produtos vinculados'
    productsBox.before(label)
  }
}

function renderCreatorProducts(selectedIds = []) {
  const box = $('#creatorProducts')
  if (!box) return
  const selected = new Set(selectedIds)
  box.innerHTML = products.length
    ? products.map((product) => `<label><input type="checkbox" value="${esc(product.id)}" ${selected.has(product.id) ? 'checked' : ''}> ${esc(product.name)}</label>`).join('')
    : '<div class="mini">Nenhum produto cadastrado.</div>'
}

function renderCreators() {
  const rows = $('#creatorRows')
  if (!rows) return
  rows.innerHTML = creators.length
    ? creators.map((creator) => `<tr>
        <td><b>${esc(creator.name)}</b><br><small>${esc(roleLabel(creator.role))}</small></td>
        <td>${(creator.product_ids || []).length} produto(s)</td>
        <td>${creator.active === false ? 'Inativo' : 'Ativo'}</td>
        <td><button class="btn btn-light" type="button" data-edit-creator="${esc(creator.id)}">Editar</button></td>
      </tr>`).join('')
    : '<tr><td colspan="4">Nenhum autor ou idealizador cadastrado.</td></tr>'
  document.querySelectorAll('[data-edit-creator]').forEach((button) => {
    button.addEventListener('click', () => openCreator(creators.find((creator) => creator.id === button.dataset.editCreator)))
  })
}

function resetCreator() {
  editingCreator = null
  $('#creatorForm')?.reset()
  if ($('#creatorId')) $('#creatorId').value = ''
  if ($('#creatorActive')) $('#creatorActive').checked = true
  if ($('#creatorPhotoInfo')) $('#creatorPhotoInfo').textContent = ''
  renderCreatorProducts()
  $('#cancelCreator')?.classList.add('hidden')
}

function openCreator(creator) {
  if (!creator) return
  editingCreator = creator
  $('#creatorId').value = creator.id
  $('#creatorName').value = creator.name || ''
  $('#creatorRole').value = creator.role || 'author'
  $('#creatorDescription').value = creator.short_description || ''
  $('#creatorActive').checked = creator.active !== false
  $('#creatorPhotoInfo').textContent = creator.photo_path
    ? 'A foto atual será mantida. Escolha outra somente se quiser trocar.'
    : 'Nenhuma foto cadastrada.'
  renderCreatorProducts(creator.product_ids || [])
  $('#cancelCreator')?.classList.remove('hidden')
  $('#creatorForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function uploadCreatorPhoto(file, id) {
  if (!file) return null
  const extension = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').slice(0, 12) || 'jpg'
  const path = `creators/${id}/photo-${Date.now()}.${extension}`
  const { error } = await client.storage.from('product-media').upload(path, file, {
    contentType: file.type || 'image/jpeg',
  })
  if (error) throw error
  return path
}

async function saveCreator(event) {
  event.preventDefault()
  const form = $('#creatorForm')
  const button = form?.querySelector('button[type="submit"], button:not([type])')
  const message = $('#creatorMsg')
  if (button) {
    button.disabled = true
    button.textContent = 'Salvando...'
  }
  try {
    const id = $('#creatorId').value || crypto.randomUUID()
    const previous = editingCreator || {}
    const newPhoto = $('#creatorPhoto').files[0]
    const photoPath = newPhoto ? await uploadCreatorPhoto(newPhoto, id) : previous.photo_path || null
    const productIds = [...$('#creatorProducts').querySelectorAll('input:checked')].map((input) => input.value)
    await adminProducts({
      method: 'POST',
      body: JSON.stringify({
        resource: 'creator',
        id,
        name: $('#creatorName').value.trim(),
        role: $('#creatorRole').value,
        short_description: $('#creatorDescription').value.trim(),
        photo_path: photoPath,
        active: $('#creatorActive').checked,
        product_ids: productIds,
        website_url: previous.website_url || null,
        website_label: previous.website_label || 'Site',
        instagram_url: previous.instagram_url || null,
        instagram_username: previous.instagram_username || '',
        youtube_url: previous.youtube_url || null,
        youtube_username: previous.youtube_username || '',
        tiktok_url: previous.tiktok_url || null,
        tiktok_username: previous.tiktok_username || '',
      }),
    })
    await loadData()
    renderCreators()
    resetCreator()
    if (message) message.innerHTML = '<div class="notice success">Autor / idealizador salvo com sucesso.</div>'
  } catch (error) {
    if (message) message.innerHTML = `<div class="notice error">${esc(error.message)}</div>`
  } finally {
    if (button) {
      button.disabled = false
      button.textContent = 'Salvar perfil'
    }
  }
}

async function loadCreatorsPanel() {
  const rows = $('#creatorRows')
  if (rows) rows.innerHTML = '<tr><td>Carregando autores e idealizadores...</td></tr>'
  try {
    await loadData()
    renderCreators()
    if (!editingCreator) renderCreatorProducts()
  } catch (error) {
    if (rows) rows.innerHTML = `<tr><td><div class="notice error">${esc(error.message)}</div></td></tr>`
  }
}

function prepareHomePanel() {
  wrapField('#homePhraseInput', 'Frase da página inicial', 'Frase opcional exibida abaixo do texto principal')
  wrapField('#whatsappChannelUrl', 'Link do canal do WhatsApp', 'https://whatsapp.com/channel/...')
  wrapField('#supportWhatsapp', 'WhatsApp do suporte', 'Ex.: 5521999999999')
  wrapField('#footerTextInput', 'Texto do rodapé', 'Texto exibido no final da página')
  if (!$('#homeSettingsMsg')) {
    const message = document.createElement('div')
    message.id = 'homeSettingsMsg'
    $('#settingsForm')?.appendChild(message)
  }
}

function renderHomeSettings() {
  $('#homePhraseInput').value = settings.home_phrase || ''
  $('#whatsappChannelUrl').value = settings.whatsapp_channel_url || ''
  $('#supportWhatsapp').value = settings.support_whatsapp || ''
  $('#footerTextInput').value = settings.footer_text || ''
  $('#showCreatorsMenu').checked = settings.show_creators_menu !== false
  $('#showWhatsappInvite').checked = settings.show_whatsapp_invite === true
  $('#showSupport').checked = settings.show_support !== false
  const featured = $('#featuredProduct')
  if (featured) {
    featured.innerHTML = '<option value="">Nenhum</option>' + products.map((product) => `<option value="${esc(product.id)}">${esc(product.name)}</option>`).join('')
    featured.value = settings.featured_product_id || ''
  }
}

async function loadHomePanel() {
  const message = $('#homeSettingsMsg')
  if (message) message.innerHTML = '<div class="notice">Carregando configurações...</div>'
  try {
    await loadData()
    renderHomeSettings()
    if (message) message.innerHTML = ''
  } catch (error) {
    if (message) message.innerHTML = `<div class="notice error">${esc(error.message)}</div>`
  }
}

async function saveHome(event) {
  event.preventDefault()
  const form = $('#settingsForm')
  const button = form?.querySelector('button[type="submit"], button:not([type])')
  const message = $('#homeSettingsMsg')
  if (button) {
    button.disabled = true
    button.textContent = 'Salvando...'
  }
  try {
    const data = await adminProducts({
      method: 'POST',
      body: JSON.stringify({
        resource: 'settings',
        home_phrase: $('#homePhraseInput').value,
        featured_product_id: settings.featured_product_id || null,
        footer_text: $('#footerTextInput').value,
        show_creators_menu: $('#showCreatorsMenu').checked,
        whatsapp_channel_url: $('#whatsappChannelUrl').value,
        show_whatsapp_invite: $('#showWhatsappInvite').checked,
        support_whatsapp: $('#supportWhatsapp').value,
        show_support: $('#showSupport').checked,
      }),
    })
    settings = data.settings || settings
    renderHomeSettings()
    if (message) message.innerHTML = '<div class="notice success">Configurações da página inicial salvas.</div>'
  } catch (error) {
    if (message) message.innerHTML = `<div class="notice error">${esc(error.message)}</div>`
  } finally {
    if (button) {
      button.disabled = false
      button.textContent = 'Salvar página inicial'
    }
  }
}

function init() {
  prepareCreatorPanel()
  prepareHomePanel()
  $('#creatorForm')?.addEventListener('submit', saveCreator)
  $('#cancelCreator')?.addEventListener('click', resetCreator)
  $('#settingsForm')?.addEventListener('submit', saveHome)
  document.querySelector('[data-tab="creatorsPanel"]')?.addEventListener('click', () => setTimeout(loadCreatorsPanel, 40))
  document.querySelector('[data-tab="homePanel"]')?.addEventListener('click', () => setTimeout(loadHomePanel, 40))
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
else init()
