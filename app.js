// crawler.js
const { chromium } = require('playwright');
const open = require('open');
const fs = require('fs/promises');
const path = require("path")
const {login} = require("./src/login")
const {fire} = require("./src/fire")
const altfs = require('node:fs'); // ✅ 原生 fs，包含 readFileSync


global.homePath = process.cwd()
global.assertPath = path.join(homePath,'assert')
let jsonPath = "./config.json"
global.appConfig = JSON.parse(altfs.readFileSync(jsonPath,'utf-8'))

// const browser = chromium.launch({
//     headless:true,
//     args: ['--no-sandbox', '--disable-setuid-sandbox']
// })
class PageManager {
    constructor() {
        this.browser = null;
        this.Pages = [];
        this.currentPage = 0;
        this.loginButton = null;
    }

    // 初始化浏览器（必须 await 调用）
    async init() {
        // this.browser = await chromium.launch({
        //     headless: true,
        //     args: ['--no-sandbox', 
        //         '--disable-setuid-sandbox',
        //         '--js-flags=--max-old-space-size=512',  // 限制渲染进程内存
        //     ]
        // });
        this.browser = await chromium.launchPersistentContext('./douyin-user-data', {
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-dev-shm-usage'
        ],
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
        });
        // if (context.pages().length === 0) {
        // page = await context.newPage();
        // } else {
        // page = context.pages()[0];
        // }

        // page.on('crash', () => console.error('❌ Page crashed'));
        // page.on('close', () => console.error('❌ Page closed'));
        await this.addPage();
    }

    async getLoginStatus() {
        const page = this.getPage();
        if (!page) return false;

        try {
            const loginBtn = page.getByText('登录');
            const count = await loginBtn.count();
            return count === 0;
        } catch (e) {
            console.warn('getLoginStatus error:', e.message);
            return false;
        }
    }

    async close(){
        this.browser.close()
    }

    async addPage() {
        const page = await this.browser.newPage();
        page.on('crash', () => console.error('❌ Page crashed'));
        page.on('close', () => console.error('❌ Page closed'));
        this.Pages.push(page);
        return page;
    }

    getPage() {
        return this.Pages[this.currentPage];
    }

    setCurrentPage(number) {
        this.currentPage = number;
    }

    getCountPages() {
        return this.Pages.length;
    }

    async startScreenshot() {
        if (this.getCountPages() === 0) {
            await this.addPage();
        }

        if(global.appConfig.startScreenshot!=true)
        {
            return
        }

        // 确保截图目录存在
        const dir = './assert';
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
        console.log('开启截图');
        setInterval(async () => {
            const page = this.getPage();
            if (page) {
                await page.screenshot({ path: './assert/current.png' });
                // if (gc) gc();  // 手动回收
            }
            else{
                console.log("截图失败")
            }
        }, 2000);
    }
}
(async ()=>{
    global.globalPages = new PageManager()
    await global.globalPages.init()  //初始化浏览器
    await global.globalPages.startScreenshot()
    // global.globalPages.addPage()
    console.log("根路径"+assertPath)

    try{
        await login()
    }
    catch(exact)
    {
        console.log("跳过登陆"+exact)
    }

    await global.globalPages.getPage().waitForSelector('text=登录', {
        state: 'hidden',
        timeout: 60 * 60 * 1000
    });

    console.log("登录成功")

    try{
        await fire()
    }
    catch{
        console.log("续火花失败")
    }

})();
