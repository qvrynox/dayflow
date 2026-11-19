"""Data import, migration, all-dates and cross-route responsive tests."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def init(page,existing=None):
 await page.set_content((ROOT/'index.html').read_text());await page.add_style_tag(content=(ROOT/'style.css').read_text())
 await page.evaluate('''state=>{const store=state||{};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]}});window.__store=store;}''',existing)
 await page.add_script_tag(content=(ROOT/'app.js').read_text());await page.wait_for_timeout(60)
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1440,'height':900});page.set_default_timeout(6000)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await init(page)
  original=await page.evaluate("JSON.parse(window.__store['dayflow.v5.state'])")
  await page.locator('#sidebarNav [data-route="tasks"]').click()
  await page.locator('[data-action="all-dates"]').click()
  assert await page.locator('.task-entry').count()==9
  print('PASS All-dates filter')
  for route in ['dashboard','tasks','timeline','calendar','habits','stats','settings']:
   await page.locator(f'#sidebarNav [data-route="{route}"]').click()
   for width in [320,390,768,1440]:
    await page.set_viewport_size({'width':width,'height':820})
    overflow=await page.evaluate('document.documentElement.scrollWidth - innerWidth')
    assert overflow<=1,(route,width,overflow)
   await page.set_viewport_size({'width':1440,'height':900})
   print('PASS Responsive route',route)
  # Simulate restoration after all data removed
  await page.locator('[data-action="clear-data"]').click()
  await page.get_by_role('button',name='Барлығын өшіру').click()
  assert len(json.loads(await page.evaluate("window.__store['dayflow.v5.state']"))['tasks'])==0
  await page.locator('#importInput').set_input_files(files={'name':'restore.json','mimeType':'application/json','buffer':json.dumps(original).encode()})
  await page.wait_for_timeout(200)
  print('IMPORT MESSAGE',await page.locator('.toast').all_text_contents())
  restored=json.loads(await page.evaluate("window.__store['dayflow.v5.state']"))
  assert len(restored['tasks'])==9 and len(restored['habits'])==5
  print('PASS Valid JSON import restores state')
  await page.close()
  # old version simulated
  old={
   'settings':{'name':'Ескі қолданушы','theme':'light','notifications':False},
   'tasks':[{'id':'old-1','title':'Ояну','description':'','date':'2026-10-29','start':'07:00','end':'07:20','category':'personal','priority':'low','completed':True}],
   'habits':[{'id':'old-h','name':'Су ішу','emoji':'💧','history':{'2026-10-29':True}}]
  }
  p2=await browser.new_page();await init(p2,{'dayflow.v4.state':json.dumps(old)})
  st=json.loads(await p2.evaluate("window.__store['dayflow.v5.state']"))
  assert st['settings']['name']=='Ескі қолданушы'
  assert st['tasks'][0]['repeat']=='daily' and st['tasks'][0]['doneDates'].get('2026-10-29') is True
  assert st['habits'][0]['history']['2026-10-29'] is True
  print('PASS Migration from DayFlow v4 preserves recurring completion and habits')
  assert not errors,errors
  print('PASS No runtime errors')
  await browser.close()
if __name__=='__main__':asyncio.run(run())
