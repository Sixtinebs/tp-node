import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';
//Port a utiliser
const port = process.env.PORT || 8081;
const date = Date().toString().slice(0, 25);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const routers =
{
  "/": '/index',
  '/about': '/about',
  '/test': '/page1',
  '/contact': '/page2',
  '/pagenotfound' : '/pagenotfound'
}
//recupère les données en post, enregistre dans un fichier JSON et redirige vers la page home
const onRequest = (request, response) => {
  if (request.method == 'POST') {
    let requestBody = '';
    request.on('data', (data) => {
      requestBody += data
    });
    request.on('end', () => {
      // params est un objet contenant chaque champ du formulaire
      const params = new URLSearchParams(requestBody);
      // exemple: pour récupérer l'email envoyé depuis le formulaire...
      console.log(chalk.magentaBright(params.get('name')));
      console.log(chalk.magentaBright(params.get('lastName')));
      console.log(chalk.magentaBright(params.get('email')));
      console.log(chalk.magentaBright(params.get('message')));
      writeFile(params, 'user.json');

    });

    try {
      response.writeHead(302, { 'location': '/' });
      /*
      *Le message ne s'affiche pas mais sans le message, la redirection ne marche pas pourquoi ?
      */
      response.write("All is ok !");

    } catch (error) {
      console.log(error)

    }
  }
}

function renderPages(url, result) {
  let currentURL = url.pathname;
  const name = url.searchParams.get('name');

  const namePage = findRouter(currentURL)
  try {
    result.writeHead(200, { 'Content-type': 'text/html' });
    let pageContent = fs.readFileSync(`./pages${namePage}.html`, { encoding: "utf-8" });

    pageContent = replaceText(pageContent, '${NAME}', name, 'Inconu');
    pageContent = replaceText(pageContent, '${DATE}', date, 'Today');

    result.write(pageContent);

    try {
      const nav = createNav();
      console.log('nav'+ nav);
      result.write(nav)
    } catch (error) {
      console.log(console.error())
    }

  } catch (error) {
    console.log(error)
    result.writeHead(404, { 'Content-type': 'text/html' });
    let pageNotFound = fs.readFileSync('./pages/pagenotfound.html', { encoding: "utf-8" })
    result.write(pageNotFound);
  }

}

function replaceText(page, oldName, newName, genericName) {
  const replaceName = page.replace(oldName, newName ? newName : genericName);
  return replaceName;
}
// Creation d'un server
const server = http.createServer(function (req, res) {
  onRequest(req, res)
  const currentPage = req.url;
  const url = new URL(currentPage, `http://localhost:${port}/`);
  renderPages(url, res);
  //readFile('user.json');

  if (req) {
    chalkTest(req.method, date, url.href);
  }
  res.end();
});

server.on('listening', () => {
  console.log(chalk.blue('Server is running on ') + chalk.underline.bgMagenta(`http://localhost:${port}/`));

})

server.listen(port);

function readFile(json) {
  fs.readFileSync(json, function (erreur, file) {
    let user = JSON.parse(file)
    return user;
  })
}

function writeFile(params, json) {
  let newUser = {
    "name": params.get('name'),
    "lastName": params.get('lastName'),
    "email": params.get('email'),
    "message": params.get('message')
  };
  // Pourquoi il me souligne un crochet dans le fichier json ? 
  // Peut-on changer la mise en forme du JSON ?
  let data = JSON.stringify(newUser);
  if (fs.existsSync(json)) {
    fs.appendFileSync(json, data);
  }
}
// PACKAGES CHALK
function chalkTest(method, date, url) {
  //Type de requete
  console.log(chalk.blue('La méthode utilisée : ') + chalk.green(method));
  //heure 
  console.log(chalk.blue('La requète effectué le : ') + chalk.bold.yellowBright(date));
  //URL
  console.log(chalk.blue('Url complète : ') + chalk.underline.bgMagenta(url));
}
/**
 * Ne Marche pas pour le moment
 */
function createNav() {
  // trouver les pages
  const dirPath = path.join(__dirname, 'pages');
  let links = "";
  let files = fs.readdirSync(dirPath);
  // creation des liens;
  files.forEach(file => {
    let filepath = file;
    filepath = "/" + file.replace('.html', ' ');
    //console.log(file +' ' + nameFile);
    findPath(filepath);
    // console.log('path : '+path);
    // const link = `<a href='.${route}'>${nameFile}</a>`;
    //   console.log(link)
    //   links += link;
  })

}

function findPath(nameFile ){
  let path = null;
  for (const route in routers) {
    console.log('1'+routers[route])
    console.log('2'+nameFile)
    if (routers[route] === nameFile) {
     path = routers[route]

    }
  }
  return path;
}



function findRouter(url){
  let namePage = null;
  // Trouver le nom de la page en fonction de l'url
  for (const route in routers) {
    if (route === url) {
      namePage = routers[route];
    }
  }
  return namePage;
}