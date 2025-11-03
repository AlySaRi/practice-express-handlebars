import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import { readFileSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Leer datos de los archivos JSON
const blogData = JSON.parse(readFileSync('./blog-data.json', 'utf-8'));
const aboutData = JSON.parse(readFileSync('./sobre-mi.json', 'utf-8'));

// Configurar Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Servir archivos estáticos
app.use(express.static('public'));

// Aquí irán tus rutas...

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//Ruta página principal
app.get('/', (req, res) => {
  res.render('home', {
    pageTitle: 'Inicio',
    blogTitle: blogData.blogTitle,
    blogDescription: blogData.blogDescription,
    posts: blogData.posts
  });
});

//Ruta con parametro dinámico
app.get('/post/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = blogData.posts.find(p => p.id === postId);

  if (!post) {
    return res.status(404).send('Post no encontrado');
  }

  res.render('post', {
    pageTitle: post.title,
    post: post
  });
});

//Página Sobre Mi
app.get('/about', (req, res) => {
  res.render('about', {
    pageTitle: 'Sobre Mí',
    ...aboutData  // Spread operator para pasar todos los datos
  });
});

//Post por categorias
app.get('/category/:categoryName', (req, res) => {
  const category = req.params.categoryName;
  const filteredPosts = blogData.posts.filter(p =>
    p.category.toLowerCase() === category.toLowerCase()
  );

  res.render('home', {
    pageTitle: `Categoría: ${category}`,
    blogTitle: `Posts de ${category}`,
    blogDescription: `Todos los artículos sobre ${category}`,
    posts: filteredPosts
  });
});