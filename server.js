const Koa = require('koa');
const getip = require('icanhazip').IPv4;
const url = require('url');
const fs = require('await-fs');
const shortid = require('shortid').generate;

const app = new Koa();

let user = {'1001': 'admin'};

let errorpage = 'Its an error';


async function init() {
  let header = await fs.readFile('style/header.html', 'utf8');
  let footer = await fs.readFile('style/footer.html', 'utf8');
  let errorpage = await fs.readFile('style/error.html','utf8');
  errorpage = header+errorpage+footer;
 
  let threadcreated = await fs.readFile('style/threadcreated.html', 'utf8');
  let madethread = header + threadcreated + footer;
}

let threadlist = 'List of threads';

let threads = [];

app.use(async ctx => {
  ctx.req.socket.setNoDelay(true);
  console.log('.');
  //console.log(ctx);

  let data = url.parse(ctx.url, true);

  switch (data.path) {
    case '/':
      ctx.body = threadlist;
      break;
    case '/newthread':
      let user = auth(data);
      if (user) makethread(ctx, data); 
      break;
    default:
      await error(ctx);
      break;
  }
});

function auth(data) {
  return authorized[data.query.session];
}

function clean(str, len) {
  return str.substr(0, len);
}

async function makethread(ctx, data) {
  let {subject, body} = data.query;
  subject = clean(subject, 100);
  body = clean(body, 1000);
  let id = shortid();
  threads.push({subject, id});
  await fs.writeFile(`threads/${id}.html`, body, 'utf8');
  threads = updateThreadHtml();
  ctx.body = madethread;
}

async function error(ctx) { ctx.body = errorpage; }

app.env = 'production';
app.listen(3000);

getip().then(ipaddr => {
  console.log(`Listening http://${ipaddr}:3000/`);
});
