"""Browser smoke tests using Playwright + system Chromium. HTML/CSS/JS injected
into a blank page because system Chromium restricts URL navigation in this runtime.
The actual static files are read as-is (no production code mocked). localStorage
is replaced by a test-only in-memory storage object.
"""
import asyncio
import json
import pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]

async def load(page):
    errors=[]
    page.on('pageerror', lambda err: errors.append(str(err)))
    await page.set_content((ROOT/'index.html').read_text(encoding='utf-8'))
    await page.add_style_tag(content=(ROOT/'style.css').read_text(encoding='utf-8'))
    await page.evaluate('''() => {
       const store = {};
       Object.defineProperty(window,'localStorage',{configurable:true,value:{
         getItem:key=>store[key]??null,setItem:(key,value)=>{store[key]=String(value)},
         removeItem:key=>delete store[key],clear:()=>Object.keys(store).forEach(k=>delete store[k])
       }});
       window.__testStore = store;
    }''')
    await page.add_script_tag(content=(ROOT/'app.js').read_text(encoding='utf-8'))
    await page.wait_for_timeout(70)
    return errors

async def run():
  result=[]
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=await browser.new_page(viewport={'width':1440,'height':900})
    page.set_default_timeout(6000)
    errors=await load(page)
    async def test(name, condition):
      if not condition: raise AssertionError(name)
      result.append(name)
      print('PASS',name)
    async def get_state():
      return await page.evaluate("JSON.parse(window.__testStore['dayflow.v5.state'])")

    await test('Dashboard loads without errors',await page.locator('h1').count()==1 and not errors)
    await test('Seven navigation sections',await page.locator('#sidebarNav .nav-btn').count()==7)
    st=await get_state()
    await test('9 initial tasks are daily recurring',len(st['tasks'])==9 and all(t['repeat']=='daily' for t in st['tasks']))
    await test('5 seeded habits',len(st['habits'])==5)
    await test('Dashboard content is visible',await page.locator('.hero-panel').is_visible())

    # Navigate all routes and look for content and absence of JS errors.
    for route in ['dashboard','tasks','timeline','calendar','habits','stats','settings']:
      await page.locator(f'#sidebarNav [data-route="{route}"]').click()
      await test('route '+route,await page.locator('#app h1').count()==1 and not errors)

    # Recurrence on future dates (use JS data and navigation as stable UI checks).
    today=await page.evaluate("new Date().toLocaleDateString('en-CA')")
    tomorrow=await page.evaluate("(()=>{const d=new Date();d.setDate(d.getDate()+1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})()")
    await page.locator('#sidebarNav [data-route="tasks"]').click()
    await page.locator('#tasksDate').fill(tomorrow)
    await page.locator('#tasksDate').dispatch_event('change')
    await test('Daily routines visible tomorrow',await page.locator('.task-entry').count()==9)

    # Add a one-time task (date chosen by user)
    await page.locator('.page-heading [data-action="new-task"]').click()
    form=page.locator('#taskForm')
    await form.locator('input[name="title"]').fill('Жаңа тапсырма үлгісі')
    await form.locator('textarea[name="description"]').fill('Толық тексерілген жазба')
    await form.locator('input[name="date"]').fill(tomorrow)
    await form.locator('input[name="start"]').fill('23:10')
    await form.locator('input[name="end"]').fill('23:40')
    await form.locator('button[type="submit"]').click()
    st=await get_state()
    await test('New task created and saved',len(st['tasks'])==10)
    await test('New task displayed alongside routine',await page.locator('.task-entry').count()==10)
    await test('New task title displayed',await page.get_by_text('Жаңа тапсырма үлгісі').count()>=1)

    # Duplicate submission protection
    await page.locator('.page-heading [data-action="new-task"]').click()
    form=page.locator('#taskForm')
    await form.locator('input[name="title"]').fill('Жаңа тапсырма үлгісі')
    await form.locator('input[name="date"]').fill(tomorrow)
    await form.locator('input[name="start"]').fill('23:10')
    await form.locator('input[name="end"]').fill('23:40')
    await form.locator('button[type="submit"]').click()
    await test('Duplicate task rejected', 'бұрыннан бар' in await form.locator('#taskError').inner_text())
    await page.locator('[data-action="close-modal"]').first.click()

    # Repeating task creation
    await page.locator('.page-heading [data-action="new-task"]').click()
    form=page.locator('#taskForm')
    await form.locator('input[name="title"]').fill('Күнде қайталанатын тест')
    await form.locator('input[name="date"]').fill(tomorrow)
    await form.locator('input[name="start"]').fill('23:40')
    await form.locator('input[name="end"]').fill('23:55')
    await form.locator('select[name="repeat"]').select_option('daily')
    await form.locator('button[type="submit"]').click()
    await test('Recurring task template added',len((await get_state())['tasks'])==11)
    await page.locator('[data-action="timeline-next"]').count() # no-op
    await page.locator('#tasksDate').fill(tomorrow)
    await page.locator('#tasksDate').dispatch_event('change')
    await test('Recurring task visible on first day',await page.get_by_text('Күнде қайталанатын тест').count()==1)
    # next day after tomorrow
    later=await page.evaluate("d => {const v=new Date(d+'T12:00:00');v.setDate(v.getDate()+1);return v.getFullYear()+'-'+String(v.getMonth()+1).padStart(2,'0')+'-'+String(v.getDate()).padStart(2,'0')}",tomorrow)
    await page.locator('#tasksDate').fill(later)
    await page.locator('#tasksDate').dispatch_event('change')
    await test('New recurring task visible on following day',await page.get_by_text('Күнде қайталанатын тест').count()==1)
    await test('One-time task absent following day',await page.get_by_text('Жаңа тапсырма үлгісі').count()==0)

    # Edit same task without duplication
    st=await get_state();target=next(t for t in st['tasks'] if t['title']=='Күнде қайталанатын тест')
    await page.locator(f'[data-action="edit-task"][data-id="{target["id"]}"]').click()
    await page.locator('#taskForm input[name="title"]').fill('Күнде жаңартылған тест')
    await page.locator('#taskForm button[type="submit"]').click()
    st=await get_state()
    await test('Edit updates same ID, no extra record',len(st['tasks'])==11 and any(t['id']==target['id'] and t['title']=='Күнде жаңартылған тест' for t in st['tasks']))

    # Toggle per-day completion on tomorrow, other day independent
    await page.locator('#tasksDate').fill(tomorrow)
    await page.locator('#tasksDate').dispatch_event('change')
    await page.locator(f'[data-action="toggle-task"][data-id="{target["id"]}"]').click()
    st=await get_state()
    await test('Completed day is recorded',st['tasks'][-1]['doneDates'].get(tomorrow)==True)
    await page.locator('#tasksDate').fill(later)
    await page.locator('#tasksDate').dispatch_event('change')
    await test('Recurrence on different day remains pending',await page.locator(f'.task-entry:has-text("Күнде жаңартылған тест") .check-btn.checked').count()==0)

    # Search and status filter
    await page.locator('#tasksSearch').fill('Күнде жаңартылған тест')
    await test('Search filters task list',await page.locator('.task-entry').count()==1)
    await page.locator('#tasksStatus').select_option('done')
    await test('Status filter excludes pending task',await page.locator('.task-entry').count()==0)
    await page.locator('[data-action="clear-filters"]').click()
    await page.locator('#tasksDate').fill(tomorrow)
    await page.locator('#tasksDate').dispatch_event('change')

    # Delete with confirmation
    await page.locator(f'[data-action="delete-task"][data-id="{target["id"]}"]').click()
    await test('Delete offers recurring series options',await page.get_by_text('Толығымен жою').count()==1)
    await page.get_by_text('Толығымен жою').click()
    await test('Delete removes task',len((await get_state())['tasks'])==10)

    # Habits history toggle, add/edit/delete
    await page.locator('#sidebarNav [data-route="habits"]').click()
    st=await get_state();habit_id=st['habits'][0]['id']
    await page.locator(f'[data-action="toggle-habit"][data-id="{habit_id}"]:not([disabled])').last.click()
    st=await get_state()
    await test('Habit checked with actual date',any(st['habits'][0]['history'].values()))
    await page.locator('[data-action="new-habit"]').click()
    await page.locator('#habitForm input[name="name"]').fill('Тест әдеті')
    await page.locator('#habitForm button[type="submit"]').click()
    await test('Habit created',len((await get_state())['habits'])==6)
    st=await get_state();new_habit=next(h for h in st['habits'] if h['name']=='Тест әдеті')
    await page.locator(f'[data-action="edit-habit"][data-id="{new_habit["id"]}"]').click()
    await page.locator('#habitForm input[name="name"]').fill('Өзгертілген әдет')
    await page.locator('#habitForm button[type="submit"]').click()
    await test('Habit edited',any(h['name']=='Өзгертілген әдет' for h in (await get_state())['habits']))
    await page.locator(f'[data-action="delete-habit"][data-id="{new_habit["id"]}"]').click()
    await page.get_by_role('button',name='Жою',exact=True).click()
    await test('Habit deleted',len((await get_state())['habits'])==5)

    # Calendar + Stats
    await page.locator('#sidebarNav [data-route="calendar"]').click()
    await test('Calendar has 42 day cells',await page.locator('.calendar-day').count()==42)
    await page.locator('[data-action="calendar-next"]').click()
    await test('Calendar next-month works',await page.locator('.calendar-day').count()==42)
    await page.locator('#sidebarNav [data-route="stats"]').click()
    await test('Statistics show charts',await page.locator('.chart-card').count()==4)

    # Dark theme persists
    await page.locator('[data-action="toggle-theme"]').click()
    await test('Dark mode toggled',await page.locator('html').get_attribute('data-theme')=='dark')
    await test('Dark mode persisted', (await get_state())['settings']['theme']=='dark')

    # Settings and invalid JSON must preserve old data
    await page.locator('#sidebarNav [data-route="settings"]').click()
    state_before=await get_state()
    await page.locator('#importInput').set_input_files(files={'name':'bad.json','mimeType':'application/json','buffer':b'{bad json'})
    await test('Invalid JSON preserves existing records',(await get_state())['tasks']==state_before['tasks'])
    await page.locator('[data-action="test-alert"]').click()
    await test('Test alert toast appears',await page.locator('.toast').count()>0)

    # check mobile widths
    for width in [320,375,390,768,1024,1440]:
      await page.set_viewport_size({'width':width,'height':800})
      overflow=await page.evaluate('document.documentElement.scrollWidth-innerWidth')
      await test(f'No horizontal overflow at {width}px',overflow<=1)
    await page.set_viewport_size({'width':390,'height':844})
    await page.locator('[data-action="mobile-menu"]').click()
    await test('Mobile menu is functional',await page.locator('.modal .nav-btn').count()==7)
    await page.locator('.modal [data-route="dashboard"]').click()
    await test('Mobile menu navigates',await page.locator('h1').count()==1)

    await test('No JavaScript errors',not errors)
    print('SUCCESS',len(result),'checks')
    await browser.close()

if __name__=='__main__':
    asyncio.run(run())
