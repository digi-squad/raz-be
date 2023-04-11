<h1 id="title" align="center">RAZ-BE</h1>

<p align="center"><img src="https://socialify.git.ci/digi-squad/raz-be/image?description=1&amp;language=1&amp;name=1&amp;owner=1&amp;pattern=Charlie%20Brown&amp;theme=Dark" alt="project-image"></p>

<p id="description">The back-end part of the "RAZ" website. For the front-end part <a href="https://github.com/digi-squad/raz-fe">click here!</a></p>

<h2>🚀 Demo</h2>

[click here!](https://raz-be.vercel.app/)

<h2>🛠️ Installation Steps:</h2>

<p>1. Clone this repo</p>

```bash
git clone https://github.com/digi-squad/raz-be.git
```

<p>2. Enter the directory</p>

```bash
cd raz-be
```

<p>3. Install all dependencies</p>

```bash
npm install
```

<p>4. Setup your cloudinary account & mongodb account</p>

<p>MongoDB : <a href="https://cloud.mongodb.com/">Click Here</a><br>
Cloudinary : <a href="https://cloudinary.com/">Click Here</a><br>

</p>


<p>5. Create .env file</p>

```env
DB_HOST = [YOUR DATABASE HOST]
DB_NAME = [YOUR DATABASE NAME]
DB_PORT = [YOUR DATABASE PORT]
DB_USER = [YOUR DATABASE USERNAME]
DB_PASS = [YOUR DATABASE PASSWORD]

JWT_SECRET_KEY = [YOUR JWT SECRET KEY]

CLOUD_NAME = [YOUR CLOUDINARY NAME]
CLOUD_KEY = [YOUR CLOUDINARY API KEY]
CLOUD_SECRET = [YOUR CLOUDINARY API SECRET]

MONGODB_USER = [YOUR MONGODB USERNAME]
MONGODB_PASS = [YOUR MONGODB PASSWORD]
MONGODB_HOST = [YOUR MONGODB HOSTNAME]
MONGODB_NAME = [YOUR MONGODB DATABASE NAME]
```

<p>6. Start the local server</p>

```bash
node index.js
```
or (if you want auto start if any change in code)
```
npm run dev
```



<h2>💻 Built with</h2>

Technologies used in the project:

*   Express
*   JWT (JSON Web Token)
*   PostgreSQL
*   Cloudinary (For Upload)
*   MongoDB

<h2>🛡️ License:</h2>

This project is licensed under the ISC License

<h2>🐞 Suggestion</h2>

If you find bugs or find better ways/suggestions you can pull request.