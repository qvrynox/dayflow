async def open_workspace(page):
    """Use the app's storage interface without requiring a Firebase project."""
    await page.evaluate("""() => {
        const save = state => localStorage.setItem('dayflow.v5.state', state);
        const backup = window.dayFlow.readLocalBackup();
        const serialized = backup ? JSON.stringify(backup) : null;
        if (serialized !== null) save(serialized);
        window.dayFlow.start(serialized, save);
        document.querySelector('#accountScreen').hidden = true;
        for (const id of ['appLayout', 'mobileNav']) {
            const element = document.getElementById(id);
            element.hidden = false;
            element.inert = false;
        }
    }""")
