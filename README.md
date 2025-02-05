<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<p align="center">
<img src="https://unifygiving.com/wp-content/uploads/2024/04/logo.svg" />
</p>
<a name="readme-top"></a>

<h2 align="center">Unify Giving Backend API (Staging and Development)</h2>

<p align="center">
This backend app handles requests from a React Native mobile app and a React admin dashboard web app.
</p>
<br/>

<!-- TABLE OF CONTENTS -->

<p>Table of Contents</p>
<ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#git-flow-for-collaborators">Git Flow for Collaborators</a></li>
    <li><a href="#folders-and-files">Folders and Files</a></li>
</ol>
<br/>

<!-- ABOUT THE PROJECT -->

## About The Project

### Built With

- Digital Ocean
  - App Platform
  - PostgreSQL database
  - Spaces
- Node.js / Express.js
- Prisma ORM

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- git
- npm
- Node.js
- A local PostgreSQL database
  <br/>

### Installation & Setup

1. Clone the repo
   ```sh
   git clone https://github.com/unifygiving/UG-Backend-Stage.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a database called `dev_db` in your local PostgreSQL.
4. Run `npx prisma generate` for recreating connection.
5. Run `npm run prisma db push` to push on db
6. Create a .env file at the root of the project, and add the following variables to it:

   ```sh
   NODE_ENV="development"
   JWT_SECRET="make_up_a_secret_for_development"
   DATABASE_URL="your_local_db_connection_string_here"
   API_BASE_URL="http://localhost:3000"

   ZOHO_EMAIL_FROM_NAME="Sharon at Unify Giving"
   ZOHO_EMAIL_ADDRESS="contact@unifygiving.com"
   ZOHO_APP_PASSWORD="ask_project_owner_for_this_password"
   ```

7. Contact the owner of the project for additional environment variables, if needed.
8. This app uses Prisma ORM. Check the Prisma docs for how to use it https://www.prisma.io/.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

### Connecting to Staging and Development Databases Directly
- Hostname/address: dpg-cu9sq23qf0us73c4n5gg-a.frankfurt-postgres.render.com
- Port: 5432
- Maintenance Database: unify_test_db_c9eq
- Username: unify_test_db_c9eq_user
- Password: sPne2ZkrcECVFbSfLbHD8GNpdTgDDLTy

### ENV Variables for Staging and Development Databases
To connect to the staging database the DATABASE_URL variable within the env should look like this.
```sh
#Staging Database
DATABASE_URL="postgresql://unify_test_db_c9eq_user:sPne2ZkrcECVFbSfLbHD8GNpdTgDDLTy@dpg-cu9sq23qf0us73c4n5gg-a.frankfurt-postgres.render.com/Staging"
```

To connect to the development database the DATABASE_URL variable within the env should look like this. 
```sh 
#Development Database
DATABASE_URL="postgresql://unify_test_db_c9eq_user:sPne2ZkrcECVFbSfLbHD8GNpdTgDDLTy@dpg-cu9sq23qf0us73c4n5gg-a.frankfurt-postgres.render.com/Development"
```

```sh
#API URL
API_BASE_URL="https://ug-backend-58bx.onrender.com"
```

*Contact @DanWSDev (Slack - Daniel Stannard) if any issues with connecting*  

## Usage

1. Start the project (the dev script uses `nodemon` to auto restart the server on file save)
   ```sh
   npm run dev
   ```
2. Visit the url to check that it works: http://localhost:3000
3. Visit the API docs by adding `/api-docs` to the url like so: http://localhost:3000/api-docs

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Git Flow for Collaborators

- Start by going to GitHub:
  1. Go to the `Issues` tab, and select the issue you want to work on.
  2. Add a comment to the issue (something simple like, "I'll work on this.")
  3. Assign yourself to that issue.
  4. Go back to the main code page and open the branch dropdown menu.
  5. In the dropdown enter the name of a new branch for you to work on (prefix the issue number to the name, like `12-get-address-endpoint`), and then click on `Create branch:...` in the dropdown.
     <br/>
- Now go back to your machine:
  1. `git checkout main` To switch to the main branch.
  2. `git pull` To pull in the latest code from the GitHub repo.
  3. `git checkout <name of the branch you created>`
  4. `git status` To check that you are on your branch and not main.
  5. Write code and make changes for the issue you are working on. When you are all done making changes, make sure you are still on your branch, then continue to the next steps.
  6. `git stash` To stash your local changes. (This strategy reduces merge conflicts)
  7. `git pull origin main` This fetches commits from the main branch of the origin remote (into the local origin/main branch), and then it merges origin/main into the branch you currently have checked out.
  8. `git stash apply` To merge your local changes (you will likely see a notice that you need to add and commit)
  9. `git add .` To add all changed files to the staging area
  10. `git commit -m "Issue #12. Your message here."` To commit the changes
  11. `git push` To push the changes to the GitHub repo
      <br/>
- Go back to GitHub:
  1. There should be a notice towards the top. Click on `Compare and pull request`.
  2. Type a comment and click `Create pull request`.
  3. In the right side menu, select a reviewer by clicking `Request` next to a suggested reviewer, or click on `Reviewers` to select someone.
  4. Wait for the reviewer to review your code. If everything looks fine, the reviewer will merge the pull request on GitHub, and delete your branch on GitHub. Then on your machine, you can switch back to your main branch, and delete the branch you were working on, since it has been accepted and merged.
  5. If the reviewer wants you to make changes to your pull request, watch this short video for an example of how to do code reviews on GitHub https://www.youtube.com/watch?v=UpBpb0j7IKA.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Folders and Files

- This app was initially scaffolded out with `express-generator`, with the `--no-view` option. See [Express application generator](https://expressjs.com/en/starter/generator.html) for more details.
- The `bin` folder contains scripts. In this folder is a file named `www` (no file extension). The `www` file is the script that starts the app as a web server. The `bin` folder can also contain scripts for testing or other stuff.
- The `docs` folder contains documents that describe this backend service.
- The `middleware` folder contains files with middleware functions.
- The `prisma` folder contains the prisma schema and the database migration files.
- The `public` folder contains static files to be served by the express server.
- The `routes` folder contains the route files for defining the API endpoints. The API is further separated into versions. In the future, if there are significant changes that need to be made, then create a `v2` folder for the new version.
- The `utils` folder contains files with utility functions.
- The `app.js` file is where the route files are imported and registered for use by the app, along with other services and middleware.
- The `db_create.sql` file contains the SQL statements to create the database tables, functions, triggers, etc..
- The `db_share.js` file is where the prisma client is instantiated and exported. This way we only create one prisma client and share it with the rest of the app.
- The `swagger-generate.js` file contains the code that generates the `swagger-ouput.json` file. The swagger generator is run every time you start the server with `npm run dev`, and it overwrites the swagger output file. The swagger output file is used by swagger to create the web page for the API docs. Once the server is running, you can view the docs at http://localhost:3000/api-docs .
