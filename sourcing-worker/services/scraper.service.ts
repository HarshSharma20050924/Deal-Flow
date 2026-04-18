import puppeteer, { Browser } from 'puppeteer';

export interface MapsResult {
  name: string;
  phone?: string;
  website?: string;
  address?: string;
  email?: string;
}

export class ScraperService {
  private browser: Browser | null = null;

  private async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,1000']
      });
    }
    return this.browser;
  }

  async scrapeMaps(query: string): Promise<MapsResult[]> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1000 });
    
    try {
      console.log(`[Maps] Hunting for: ${query}`);
      await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
      
      // Auto-scroll the sidebar to load results
      await page.evaluate(async () => {
        const sidebar = document.querySelector('div[role="feed"]');
        if (sidebar) {
          for (let i = 0; i < 3; i++) {
            sidebar.scrollBy(0, 1000);
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      });

      const results: MapsResult[] = [];
      const items = await page.$$('a.hfpxzc');
      console.log(`[Maps] Found ${items.length} items to investigate.`);

      for (const item of items.slice(0, 5)) {
        try {
          const name = await page.evaluate(el => el.getAttribute('aria-label') || "", item);
          await item.click();
          await new Promise(r => setTimeout(r, 2000));

          const details = await page.evaluate(() => {
            const phone = document.querySelector('button[data-item-id^="phone:tel:"]')?.getAttribute('data-item-id')?.replace('phone:tel:', '') || "";
            const website = document.querySelector('a[data-item-id="authority"]')?.getAttribute('href') || "";
            return { phone, website };
          });

          results.push({ name, ...details });
          console.log(`[Maps] DISCOVERED: ${name} | PHONE: ${details.phone || 'N/A'} | WEBSITE: ${details.website || 'N/A'}`);
        } catch (e) {
          console.error("Error on item", e);
        }
      }

      return results;
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape a business website for email addresses.
   * Visits the homepage and common contact pages looking for mailto: links and email patterns.
   */
  async scrapeEmailFromWebsite(websiteUrl: string): Promise<string | null> {
    if (!websiteUrl) return null;
    
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    // Block images/css/fonts to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    try {
      // 1. Visit main page
      await page.goto(websiteUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      let email = await this.extractEmailFromPage(page);
      if (email) return email;

      // 2. Try common contact page paths
      const contactPaths = ['/contact', '/contact-us', '/about', '/about-us', '/contactus'];
      const baseUrl = new URL(websiteUrl).origin;

      for (const path of contactPaths) {
        try {
          await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded', timeout: 8000 });
          email = await this.extractEmailFromPage(page);
          if (email) return email;
        } catch {
          // Page doesn't exist, skip
          continue;
        }
      }

      // 3. Try clicking any "Contact" link on the main page
      try {
        await page.goto(websiteUrl, { waitUntil: 'domcontentloaded', timeout: 8000 });
        const contactLink = await page.$('a[href*="contact"]');
        if (contactLink) {
          await contactLink.click();
          await new Promise(r => setTimeout(r, 2000));
          email = await this.extractEmailFromPage(page);
          if (email) return email;
        }
      } catch { /* skip */ }

      return null;
    } catch (err) {
      return null;
    } finally {
      await page.close();
    }
  }

  /**
   * Extract the first valid email from a page's content.
   * Checks mailto: links first, then scans visible text.
   */
  private async extractEmailFromPage(page: any): Promise<string | null> {
    return page.evaluate(() => {
      // 1. Check mailto: links first (most reliable)
      const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
      for (const link of mailtoLinks) {
        const href = (link as HTMLAnchorElement).href;
        const email = href.replace('mailto:', '').split('?')[0].trim().toLowerCase();
        if (email && email.includes('@') && !email.includes('example.com')) {
          return email;
        }
      }

      // 2. Scan page text for email patterns
      const text = document.body.innerText || '';
      const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
      const matches = text.match(emailRegex);
      if (matches) {
        // Filter out common junk emails
        const junk = ['example.com', 'email.com', 'domain.com', 'yoursite.com', 'test.com'];
        for (const m of matches) {
          const lower = m.toLowerCase();
          if (!junk.some(j => lower.includes(j))) {
            return lower;
          }
        }
      }

      return null;
    });
  }

  async search(query: string): Promise<string[]> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.goto(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });
      const links = await page.evaluate(() => {
        const res: string[] = [];
        document.querySelectorAll('a.result__a').forEach(a => res.push((a as HTMLAnchorElement).href));
        return res;
      });
      return links.slice(0, 5);
    } finally {
      await page.close();
    }
  }

  async scrapePublicData(url: string): Promise<string> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      return await page.evaluate(() => document.body.innerText);
    } catch (e) {
      return "";
    } finally {
      await page.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
