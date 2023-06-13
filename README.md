<div align='center' style="text-align: center;">

<img src="./images/logo.png" width="200"/>

<h1 style="border:0;margin:1rem">RAZ Furniture Shop</h1>

Rest API for RAZ Furniture Shop

[Demo](https://raz-be.vercel.app) · [Suggestion](#suggestion)

<hr>
<br>

</div>


## Table of Contents

- [Table of Contents](#table-of-contents)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Postman Collection](#postman-collection)
- [Resources](#resources)
- [Contributors](#contributors)
- [Related Projects](#related-projects)
- [License](#license)
- [Suggestion](#suggestion)


## Technologies Used

[![My Skills](https://skillicons.dev/icons?i=js,express,mongodb,postgresql,supabase)](https://skillicons.dev)

- Express.js
- JSON Web Token
- pg (postgresql)
- mongoose (MongoDB)
- nodemailer
- Cloudinary
- etc.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://postgresql.org/)
- [MongoDB](https://cloud.mongodb.com/)
- [SMTP Account](https://nodemailer.com/about/)
- [Cloudinary Account](https://cloudinary.com/)

### Installation

1. Clone this repo

    ```bash
    git clone https://github.com/digi-squad/raz-be.git
    ```

2. Enter the directory

    ```bash
    cd raz-be
    ```

3. Install all dependencies

    ```bash
    npm install
    ```

4. Create .env file

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
        
    NODEMAILER_HOST = [YOUR SMTP HOST]
    NODEMAILER_PORT = [YOUR SMTP PORT]
    NODEMAILER_USER = [YOUR SMTP EMAIL/USER]
    NODEMAILER_PASS = [YOUR SMTP PASSWORD]
    ```

5. Start the local server

    ```bash
    node index.js
    ```

    or (if you want auto start if any change in code)

    ```bash
    npm run dev
    ```

## Postman Collection

You can see in [here](https://www.postman.com/digital-squad-fw14/workspace/raz-shop/collection/26209677-ec41282f-6ed0-43f6-95c6-25c1d0385ad6). You can fork/duplicate to your workspace

## Resources

Special thanks to:

- [Vercel](https://vercel.com) - deploying code
- [rKalways](https://codepen.io/rKalways) - Reset password email template

## Contributors

- [M. Pria Admaja](https://github.com/PriaAdmaja) - Project Manager & Fullstack Developer
- [Raihan Irvana](https://github.com/PriaAdmaja) - Back-end Developer
- [Farhan Brillan W](https://github.com/PriaAdmaja) - Back-end Developer
- [Akmal Susetio](https://github.com/wyakaga) - Front-end Developer
- [Damar Anggoro](https://github.com/PriaAdmaja) - Front-end Developer

## Related Projects

- [raz-fe](https://github.com/digi-squad/raz-fe) - Frontend

## License

This project is licensed under the ISC License

## Suggestion

If you find bugs / find better ways / suggestions you can pull request.
