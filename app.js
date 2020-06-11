const express = require('express')
const bodyParser = require('body-parser')
const localtunnel = require('localtunnel');
const { program } = require('commander');

program
  .option('-s, --saas  <value>', '自动化系统后台').parse(process.argv);

let app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// process.on('unhandledRejection',async (reason, p) => {
//     console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
// });
process.on('uncaughtException',async function (err) {
    console.log('发生错误','请更换网络环境后重启程序。');
});

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

let req = require('request')
const postbackUrl = 'http://' + `${program.saas}` + '/api/localBrowser'

async function login(page, { username, password }) {
    let isLogin = await checkLoginStatus(page)
    await page.goto('https://www.facebook.com/login/device-based/regular/login');
    await page.evaluate( () => document.getElementById("email").value = "")
    await page.click('input#email')
    await page.keyboard.type(username);
    await page.click('input#pass')
    await page.keyboard.type(password)
    await page.click('#loginbutton')
    await page.waitForNavigation({ waitUtil: 'networkidle0' })
    await page.waitFor(1 * 1000)
    let searchInput = await page.$('[data-testid="search_input"]');
    if(!searchInput) {
      let pageUrl = await page.url()
      throw `wrong url: ${pageUrl}`
    }
}

async function checkLoginStatus(page) {
  await page.goto('https://www.facebook.com/login/device-based/regular/login', {
     waitUtil: 'networkidle0'
    })
  let pageUrl = await page.url()
  await page.waitFor(1 * 1000)
  let searchInput = await page.$('[data-testid="search_input"]');
  let status = 0
  if(searchInput) {
    status = 0
  } else {
    if(pageUrl === 'https://www.facebook.com/login/device-based/regular/login') {
      status = 1
    } else {
      throw `wrong url: ${pageUrl}`
      
    }
  }
  return { status, pageUrl }
}

function post(url,form) {
    return new Promise((resolve, reject) => {
        req.post({
            url,
            form
        }, function(err, res, body){
            if(err) {
                reject(err)
            } else {
                resolve(body)
            }
        })
    })
}


function sendTunnelUrl(data) {
    return post(postbackUrl, data)
}

app.post('/openBrowser', async (req, res) => {
    res.send({status: 'ok'})
    let {
        auth: { username, password, cookies },
        params: { url },
        headers,
        launch,
        proxy
    } = req.body
    try {
        const browser = await puppeteer.launch(launch || {});
        const page = await browser.newPage()

        await page.setExtraHTTPHeaders(headers || []);
        await page.setBypassCSP(true);
        await page.setJavaScriptEnabled(true);
        //这里对 Page 进行设置
        if ((proxy && proxy.username) || false) {
            await page.authenticate({
                username: proxy.username,
                password: proxy.password
            });
        }
        try {
            let { status } = await checkLoginStatus(page)
            // status 0，已登录，1：未登录
            if (status === 1) {
                try{
                    let cookies_arr = JSON.parse(cookies);
                    await page.setCookie(...cookies_arr)
                    let { status } = await checkLoginStatus(page)
                }catch(e)
                {
                    console.log(e);
                }
              
                if (status === 1) {
                    await login(page, { username, password })
                }
            }
        } catch(e){
           // console.log(e)
        }

        try {
            if(url !== '') {
                await page.goto(url)
            }
        } catch (e) {
        }
    } catch (error) {
        //console.log(error)
        if(browser) {
             browser.close()
        }
    }
})

app.listen(3000, function () {
    console.log('本地浏览器服务已启动，请不要关闭本窗口。如果发生链接失败情况，请重启本程序。');

    async function connect_tunnel() {
        const tunnel = await localtunnel({ port: 3000, host:'http://browser.facebug.net' });
        sendTunnelUrl({ url: tunnel.url })
        .then((data) => {
        }).catch((e) => {
        })
        tunnel.on('close', () => {
            setTimeout(function(){
                connect_tunnel()
            }, 30 * 1000)
        });
    }
    connect_tunnel();
})
