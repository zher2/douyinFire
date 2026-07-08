async function fire(){
    current = global.globalPages.getPage()
    await current.goto('https://www.douyin.com/chat',{ waitUntil: 'domcontentloaded' });

    // ✅ 等待私信列表 / 输入框出现（登录态有效）
    await current.waitForSelector(
    '[class*="conversationConversationItemtitle"], [data-apm-action="editor"]',
    { timeout: 15000 }
    );

    console.log('✅ 私信页加载完成');

    const conversationItems = await current.locator('.conversationConversationItemtitle').all()

    console.log("获取到的数量"+conversationItems.length)

    D = new Date().getDate()
    
    setInterval(async ()=>{
        console.log("定时器检查")
        if(D === new Date().getDate())
            return
        else{
            D = new Date().getDate()
        }
        
        for(var item of conversationItems){
            console.log(item)
            item.scrollIntoViewIfNeeded()
            await item.click()
            const editor = current.locator('[data-apm-action="editor"] [contenteditable="true"]');
            await editor.waitFor({ state: 'visible', timeout: 15000 });
            console.log('✅ 输入框已加载');
            await editor.click()
            await current.keyboard.type('续火花', {delay:40});
            await current.keyboard.press('Enter')
        }
    },60000);

    
}

module.exports =  {fire}