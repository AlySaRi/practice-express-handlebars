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

// Extraer categorías únicas
const categories = [];
for (let i = 0; i < blogData.posts.length; i++) {
  const cat = blogData.posts[i].category;
  if (!categories.includes(cat)) {
    categories.push(cat);
  }
}

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
    posts: blogData.posts,
    categories: categories
  });
});

//Ruta con parametro dinámico
app.get('/post/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = blogData.posts.find(p => p.id === postId);

  if (!post) {
    return res.status(404).send('Post no encontrado');
  }

  //Aquí añadimos el código del reto 2, Filtramos 3 posts de la misma categoría (excluyendo el actual)
  const relatedPosts = blogData.posts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  res.render('post', {
    pageTitle: post.title,
    post: post,
    relatedPosts: relatedPosts,
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
    posts: filteredPosts,
    categories: categories
  });
});

app.use((req, res) => {
  res.status(404).render('404', {
    pageTitle: 'Página no encontrada'
  });
});