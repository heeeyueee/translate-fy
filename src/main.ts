import * as https from "https";
import md5 = require("md5");
import * as querystring from "querystring";
import { appId, appSecret } from "./private";
type ErrorMap = {
    [k: string]: string
}
const errorMap: ErrorMap = {
    52003: "用户认证失败",
    54000: "必填参数为空",
    54003: "访问频率受限",
    58001: '译文语言方向不支持',
    unknown: "服务器繁忙"
}
export const translate = (word: string) => {
    const salt = Math.random();
    const sign = md5(appId + word + salt + appSecret)
    let from, to;
    if (/[a-zA-Z]/.test(word[0])) {
        from = 'en';
        to = "zh";
    } else {
        from = 'zh'
        to = "en"
    }

    const query = querystring.stringify({
        q: word,
        from,
        to,
        appid: appId,
        salt,
        sign

    })
    //q=apple&from=en&to=zh&appid=2015063000000001&salt=1435660288&sign=f89f9594663708c1605f3d736d01d2d4

    const options = {
        hostname: 'api.fanyi.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?' + query,
        method: 'GET'
    };

    const request = https.request(options, (response) => {
        let chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });
        response.on('end', () => {
            const string = Buffer.concat(chunks).toString()
            type BaiduResult = {
                error_code?: string;
                error_msg?: string;
                from: string;
                to: string;
                trans_result: {
                    src: string;
                    dst: string;
                }[]

            };
            const object: BaiduResult = JSON.parse(string);
            if (object.error_code) {
                if (object.error_code in errorMap) {
                    console.error(errorMap[object.error_code])
                } else {
                    console.error(object.error_msg);

                }
                process.exit(2)
            } else {
                console.log(object.trans_result[0].dst);
                process.exit(0)
            }



        })
    });
    request.on('error', (e) => {
        console.error(e);
    });
    request.end();

}