const { time, count } = require('console');
const { chromium } = require('playwright');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let loginButton = null;

async function login(){
    current = global.globalPages.getPage()
    await current.goto('https://www.douyin.com/jingxuan', { waitUntil: 'domcontentloaded' })
    loginButton = await current.getByText("登录",{exact:true})

    if(await loginButton.count()===0)
        return;

    await saveBase64Image(
        current,
        'img[aria-label="二维码"]',
        path.join(global.assertPath, 'qrcode.png')
    );

    try{
        await startServer()
    }
    catch(e){
        console.log(e+"服务器开启失败")
    }

    // let answer = await ask("输入验证方式序号:")
    // // rl.question("输入验证方式序号:",(answer)=>{
    //     if(answer==1){
    //         click(current,"接收短信验证码");
    //         rl.question("请输入验证码",(num)=>{
    //             // current.locator('#douyin_login_comp_button_input_id input[name="button-input"]').fill(num);
    //             current.locator('input#button-input').nth(1).fill(num);
    //             console.log("输入完成")
    //             current.getByText('验证', { exact: true }).click()
    //         })
    //     }
    //     else if(answer==2){
    //         click(current,"手机刷脸验证")
    //     }
    //     else if(answer==3){
    //         click(current,"验证登录密码")
    //     }
    //     else if(answer==4){
    //         click(current,"发送短信验证")
    //     }
    // })

    try{
        await current.getByText("保存",{ exact: true }).click({ timeout: 1000000 })
    }
    catch{
        console.log("当前没有保存按钮")
    }
    // while(!isLogin()){
        
    // }
    // console.log("登陆成功")
    // click(current,"接收短信验证码")
}

async function isLogin(){
    try{
        let tloginButton = await current.getByText("登录",{exact:true})
        return ! await tloginButton.count()>0
    }
    catch(ex){
        return false
    }
}

async function saveBase64Image(page, selector, outputPath) {
    try{
        const imgSrc = await page.locator(selector).getAttribute('src');
        const base64Data = imgSrc.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
        console.log('图片已保存:', outputPath);
    }
  catch(ex){
    console.log("保存超时")
    if(await isLogin()===true){
        console.log("一登陆")
    }
    else{
        console.log("未登录"+ex)
    }
  }
}

async function startServer(){
    const mime = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.webp': 'image/webp',
    '.txt':  'text/plain',
    };
    const server = await http.createServer((req, res) => {
    const filePath = path.join(global.assertPath, req.url);
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404).end('Not Found'); return; }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
        res.end(data);
    });
    })
    server.listen(8787, '0.0.0.0', () => {
        
            // console.log('公网 IP:', ip);
        console.log('共享服务启动: http://'+getLocalIP()+':8787'+'/qrcode.png');
        selectMedth()
    });

    const setI = setInterval(()=>{
        if(loginButton.count()===0){
            server.close(()=>{
                console.log("登陆成功，服务已停止")
                clearInterval(setI);
            })
            return;
        }
    },1000)
}

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.values(nets)) {
    for (const net of name) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

function ask(question){
    return new Promise(resolve => {
        rl.question(question, resolve);
    })
}

function selectMedth(){
    // let answer = ask("输入验证方式序号:")
    rl.question("输入验证方式序号:",(answer)=>{
    // rl.question("输入验证方式序号:",(answer)=>{
    if(answer==1){
        try{
            click(current,"接收短信验证码");
            rl.question("请输入验证码",(num)=>{
                // current.locator('#douyin_login_comp_button_input_id input[name="button-input"]').fill(num);
                current.locator('input#button-input').nth(1).fill(num);
                console.log("输入完成")
                current.getByText('验证', { exact: true }).click()
            })
        }
        catch(ex){
            console.log("验证码超时")
        }
    }
    else if(answer==2){
        click(current,"手机刷脸验证")
    }
    else if(answer==3){
        click(current,"验证登录密码")
    }
    else if(answer==4){
        click(current,"发送短信验证")
    }
    })
}

// async function adjustelement(current){
//     while(true){
//         const count = current.getByText('接收短信验证码').count();
//         if(count>0)
//             return count > 0;
//     }
// }


function click(current,message){  //current为page类型，message是字符串
    try{
        var m = current.getByText(message)
        m.click()
    }
    catch(ex){
        console.log("点击失败")
    }
}
module.exports = {login}