import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:5174
        await page.goto("http://localhost:5174", wait_until="commit", timeout=10000)
        
        # -> Search the page for the text 'Categories' (fall back to 'Kategori' if not found), then click the first featured category tile (the first category button, index 69).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/div[3]/main/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the first visible featured category tile (button index 807) to open the product listing for that category, then verify the product listing view renders.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div/div[3]/main/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        # Wait briefly for any navigation/rendering after the click
        await page.wait_for_timeout(1000)
        # Assert the categories control ("Semua 6") is visible
        cat_ctrl = frame.locator('xpath=/html/body/div[1]/div[1]/div/div[3]/main/div[2]/div[2]/button[1]')
        assert await cat_ctrl.is_visible(), 'Categories control (Semua 6) is not visible'
        # Assert the product listing header/text (contains "Produk") is visible
        prod_header = frame.locator('xpath=/html/body/div[1]/div[1]/div/div[3]/main/div[4]/a[1]')
        assert await prod_header.is_visible(), 'Products text (product listing header) is not visible'
        # Assert a product card is visible in the listing
        prod_card = frame.locator('xpath=/html/body/div[1]/div[1]/div/div[3]/main/div[4]/a[2]')
        assert await prod_card.is_visible(), 'Product card is not visible'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    