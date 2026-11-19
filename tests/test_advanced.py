"""Additional behavioral tests for alarm thresholds, error handling, routines and JSON recovery."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def prepare(page, stored=None, clock=None):
    if clock:
        await page.clock.install(time=clock)
    await page.set_content((ROOT/'index.html').read_text())
    await page.add_style_tag(content=(ROOT/'style.css').read_text())
    await page.evaluate('''value => {
      const data = value || {};
      Object.defineProperty(window, 'localStorage',{configurable:true,value:{getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=String(v),removeItem:k=>delete data[k]}});
      window.__data=data;
    }''',stored)
    await page.add_script_tag(content=(ROOT/'app.js').read_text())
    await page.wait_for_timeout(50)
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1280,'height':900})
  page.set_default_timeout(5000)
  js_errors=[];page.on('pageerror',lambda err:js_errors.append(str(err)))
  await prepare(page)
  async def data():return await page.evaluate("JSON.parse(window.__data['dayflow.v5.state'])")
  def pass_(msg):print('PASS',msg)
  # deadline overlap warning
  await page.locator('[data-action="new-task"]').first.click()
  await page.locator('#taskForm input[name="title"]').fill('Қабаттасқан іс')
  await page.locator('#taskForm input[name="start"]').fill('09:30')
  await page.locator('#taskForm input[name="end"]').fill('10:30')
  assert await page.locator('#taskOverlap').is_visible()
  pass_('Time overlap warning appears')
  await page.locator('#taskForm button[type="submit"]').click()
  assert len((await data())['tasks'])==10
  pass_('Overlap still allows saving')
  # XSS escaped
  await page.locator('[data-action="new-task"]').first.click()
  xss='<img src=x onerror=alert(1)>'
  await page.locator('#taskForm input[name="title"]').fill(xss)
  await page.locator('#taskForm input[name="start"]').fill('23:15')
  await page.locator('#taskForm input[name="end"]').fill('23:35')
  await page.locator('#taskForm button[type="submit"]').click()
  await page.locator('#sidebarNav [data-route="tasks"]').click()
  assert await page.get_by_text(xss).count()==1
  assert await page.locator('.task-entry img').count()==0
  pass_('User input is HTML escaped')
  # invalid task time
  await page.locator('.page-heading [data-action="new-task"]').click()
  await page.locator('#taskForm input[name="title"]').fill('Уақыт қатесі')
  await page.locator('#taskForm input[name="start"]').fill('15:00')
  await page.locator('#taskForm input[name="end"]').fill('14:00')
  await page.locator('#taskForm button[type="submit"]').click()
  assert 'кеш болуы керек' in await page.locator('#taskError').inner_text()
  pass_('End time must be later than start time')
  await page.locator('[data-action="close-modal"]').first.click()
  # clean data and reload from saved state (seed must not recur)
  await page.locator('#sidebarNav [data-route="settings"]').click()
  await page.locator('[data-action="clear-data"]').click()
  await page.get_by_role('button',name='Барлығын өшіру').click()
  stored=await page.evaluate('window.__data')
  assert len((await data())['tasks'])==0
  pass_('All data cleared')
  replacement=await browser.new_page()
  await prepare(replacement,stored)
  assert await replacement.get_by_text('Бүгінгі жоспар бос').count()>0
  pass_('Empty state remains empty after reload')
  await replacement.close()
  await page.close()

  # alarm thresholds: 07:00 started and deadline 07:10 for 07:20 task
  alarms=await browser.new_page(viewport={'width':1280,'height':900})
  await prepare(alarms,clock='2026-10-30T06:59:55')
  # Simulate after start without waiting real seconds
  await alarms.clock.fast_forward(10000)
  await alarms.wait_for_timeout(100)
  assert await alarms.get_by_text('Тапсырма басталды').count()>0
  pass_('Start alarm fires near start time')
  await alarms.clock.fast_forward(10*60*1000)
  await alarms.wait_for_timeout(100)
  assert await alarms.get_by_text('Дедлайн жақындап қалды').count()>0
  pass_('Deadline warning fires at lead time')
  # Focus session
  await alarms.locator('[data-action="focus-toggle"]').click()
  state=json.loads(await alarms.evaluate("window.__data['dayflow.v5.state']"))
  assert state['focus']['running'] is True
  pass_('Focus timer starts')
  await alarms.locator('[data-action="focus-toggle"]').click()
  state=json.loads(await alarms.evaluate("window.__data['dayflow.v5.state']"))
  assert state['focus']['running'] is False
  pass_('Focus timer pauses')
  assert not js_errors,js_errors
  pass_('No runtime exceptions')
  await browser.close()
if __name__=='__main__':asyncio.run(run())
