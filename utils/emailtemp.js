function getEmailTemp(code,i18n) {
    let html = `<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Kiripedia 验证码</title>
                        <style>
                            *{
                                margin: 0;
                                padding: 0;
                            }
                        </style>
                    </head>
                    <body>
                        <div style="text-align: center;margin: 10px;">
                            <b>Kiripedia 验证码</b>
                        </div>
                        <div style="text-align: center;padding: 25px;background-color: #2b28e3;color: white;font-size: 32px;">
                            <b>您的验证码是：${code}</b>
                        </div>
                        <div style="text-align: center;font-size: 10px;color: #262222;">
                            本邮件仅供验证使用，请不要把验证码告诉他人
                        </div>
                    </body>
                </html>`;
    return html;
}

module.exports = {
    getEmailTemp
}