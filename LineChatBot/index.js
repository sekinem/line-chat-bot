const https = require('https');
const TOKEN = process.env.LINE_ACCESS_TOKEN;

exports.handler = async (event) => {
  const response = {
      statusCode: 200,
      body: event,
  };

  const eventBody = JSON.parse(event.body);

  if (eventBody.events.length === 0) {
    return JSON.stringify(response);
  }

  if (eventBody.events[0].type === 'message') {
    let replyText;
    if (eventBody.events[0].message.type === 'text') {
      replyText = `ID: ${eventBody.events[0].message.id}\nテキスト: ${eventBody.events[0].message.text}`;
    } else {
      replyText = 'メッセージタイプがテキストでない。';
    }

    const body = {
      replyToken: eventBody.events[0].replyToken,
      messages: [
        {
          'type': 'text',
          'text': replyText,
        },
      ]
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + TOKEN,
    };

    const webhookOptions = {
      'hostname': 'api.line.me',
      'path': '/v2/bot/message/reply',
      'method': 'POST',
      'headers': headers,
    };

    try {
      const result = await postRequest(body, webhookOptions);
      console.log('Result is: ', result);
    } catch (err) {
      console.log('Error is: ', err);
    }
  }

  return JSON.stringify(response);
};


function postRequest(body, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let rawData = '';

      res.on('data', chunk => {
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: rawData,
          });
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on('error', err => {
      reject(new Error(err));
    });

    req.write(JSON.stringify(body));
    req.end();
  });
}