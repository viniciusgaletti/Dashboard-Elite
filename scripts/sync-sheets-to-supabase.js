// ============================================================
// Dashboard-Elite — Google Apps Script
// Sincroniza dados do Google Sheets → Supabase (tabela live_sessions)
//
// SETUP (faça isso uma vez por planilha):
// 1. Abra a planilha do Google Sheets
// 2. Extensions → Apps Script → cole este arquivo
// 3. Configure as propriedades do script:
//    File → Project Settings → Script Properties → Add property
//    - SUPABASE_URL  → https://hoserfqluptplddkwxsn.supabase.co
//    - SUPABASE_ANON_KEY → (anon key do seu projeto Supabase)
// 4. Ajuste DASHBOARD_KEY abaixo ('onboarding' ou 'leads')
// 5. Salve e execute syncToSupabase() manualmente para testar
// 6. Adicione um trigger: Triggers → Add Trigger → syncToSupabase
//    → Time-driven → Minutes timer → Every 5 minutes
// ============================================================

// ── Configuração ──────────────────────────────────────────────────────────
var SUPABASE_URL = PropertiesService.getScriptProperties().getProperty('SUPABASE_URL')
var SUPABASE_ANON_KEY = PropertiesService.getScriptProperties().getProperty('SUPABASE_ANON_KEY')

// Altere conforme a planilha: 'onboarding' ou 'leads'
var DASHBOARD_KEY = 'onboarding'

// Aliases das colunas — devem bater com os nomes na planilha (sem acento, minúsculas)
var COLUMN_ALIASES = {
  date:       ['data'],
  views:      ['pico', 'pico de pessoas', 'audiencia', 'max'],
  leads:      ['leads', 'cadastros'],
  conversion: ['conversao', 'tx conversao', 'taxa de conversao'],
  revenue:    ['receita', 'faturamento', 'valor', 'faturamento total'],
  sales:      ['vendas', 'qtdvendas', 'qtd vendas', 'quantidade', 'numero de vendas'],
  presenter:  ['apresentador', 'host', 'nome'],
  retention:  ['retencao', 'tx retencao', 'taxa de retencao'],
}

// ── Utilitários (mesma lógica do React) ───────────────────────────────────
function normalizeKey(key) {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function cleanNumeric(val) {
  if (typeof val !== 'string') val = String(val)
  if (val.includes('#')) return '0'
  var clean = val.replace(/R\$\s?/g, '').replace('%', '').trim()
  if (clean.includes('.') && clean.includes(',')) {
    clean =
      clean.lastIndexOf(',') > clean.lastIndexOf('.')
        ? clean.replace(/\./g, '').replace(',', '.')
        : clean.replace(/,/g, '')
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.')
  }
  return clean.replace(/[^\d.-]/g, '')
}

function parseNumber(val) {
  var num = Number(cleanNumeric(val))
  return isNaN(num) ? 0 : num
}

function getVal(rowObj, aliases) {
  for (var i = 0; i < aliases.length; i++) {
    if (rowObj[aliases[i]] !== undefined) return rowObj[aliases[i]]
  }
  return ''
}

// ── Função principal ───────────────────────────────────────────────────────
function syncToSupabase() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]

  // getDisplayValues() retorna os valores exatamente como aparecem na tela:
  // porcentagens como "2,5%", datas como "03/01/2025", moedas como "R$ 1.234,56"
  // Isso garante que cleanNumeric() parse corretamente, igual ao fluxo CSV.
  var values = sheet.getDataRange().getDisplayValues()

  if (values.length < 2) {
    Logger.log('Planilha vazia ou sem dados suficientes.')
    return
  }

  var headers = values[0].map(function(h) { return normalizeKey(String(h)) })

  var rows = []
  for (var i = 1; i < values.length; i++) {
    var rowObj = {}
    headers.forEach(function(h, idx) {
      rowObj[h] = values[i][idx] !== undefined ? String(values[i][idx]).trim() : ''
    })

    var date       = getVal(rowObj, COLUMN_ALIASES.date)
    var presenter  = getVal(rowObj, COLUMN_ALIASES.presenter) || 'Desconhecido'
    var views      = parseNumber(getVal(rowObj, COLUMN_ALIASES.views))
    var leads      = parseNumber(getVal(rowObj, COLUMN_ALIASES.leads))
    var conversion = parseNumber(getVal(rowObj, COLUMN_ALIASES.conversion))
    var revenue    = parseNumber(getVal(rowObj, COLUMN_ALIASES.revenue))
    var sales      = parseNumber(getVal(rowObj, COLUMN_ALIASES.sales))
    var retention  = parseNumber(getVal(rowObj, COLUMN_ALIASES.retention))

    if (views === 0 && leads === 0 && revenue === 0 && sales === 0) continue
    if (!date) continue

    rows.push({
      dashboard_key: DASHBOARD_KEY,
      date: date,
      presenter: presenter,
      views: views,
      leads: leads,
      conversion: conversion,
      revenue: revenue,
      sales: sales,
      retention: retention,
      synced_at: new Date().toISOString(),
    })
  }

  if (rows.length === 0) {
    Logger.log('Nenhuma linha válida para sincronizar.')
    return
  }

  // Deduplica por (date, presenter) — planilha pode ter linhas repetidas
  var seen = {}
  for (var j = 0; j < rows.length; j++) {
    var key = rows[j].date + '__' + rows[j].presenter
    seen[key] = rows[j]
  }
  var uniqueRows = Object.values(seen)

  // POST para Supabase com upsert — on_conflict aponta para a constraint unique_session
  var endpoint = SUPABASE_URL + '/rest/v1/live_sessions?on_conflict=dashboard_key,date,presenter'
  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'resolution=merge-duplicates',
    },
    payload: JSON.stringify(uniqueRows),
    muteHttpExceptions: true,
  }

  var response = UrlFetchApp.fetch(endpoint, options)
  var status = response.getResponseCode()

  if (status >= 200 && status < 300) {
    Logger.log('Sincronizado: ' + uniqueRows.length + ' registros | Status: ' + status)
  } else {
    Logger.log('Erro: Status ' + status + ' | ' + response.getContentText())
  }
}

// ── Teste de uma linha (rode antes de ativar o trigger) ───────────────────
function testSingleRow() {
  var testRow = {
    dashboard_key: DASHBOARD_KEY,
    date: '01/01/2099',
    presenter: 'Teste Automatico',
    views: 1,
    leads: 1,
    conversion: 1,
    revenue: 1,
    sales: 1,
    retention: 1,
    synced_at: new Date().toISOString(),
  }

  var endpoint = SUPABASE_URL + '/rest/v1/live_sessions'
  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'resolution=merge-duplicates',
    },
    payload: JSON.stringify([testRow]),
    muteHttpExceptions: true,
  }

  var response = UrlFetchApp.fetch(endpoint, options)
  Logger.log('Status: ' + response.getResponseCode() + ' | ' + response.getContentText())
  Logger.log('Se Status 201 = insercao OK. Se Status 200 = upsert OK (linha ja existia).')
}
