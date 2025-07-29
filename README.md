# Reps.Watch Website Project

This guide explains the project structure and how to edit and view the website.

---

## Project Structure

This project uses a simple build process to automatically convert your Markdown articles into viewable HTML pages. Here is a breakdown of the key files and folders:

- **/guide/**: This is where all your Markdown (`.md`) article files live. You should edit and add your articles here.

- **/assets/** & **/data/**: These folders contain your images and CSV data files.

- **HTML/CSS/JS Files (Root Folder):** Your main pages (`index.html`, `dealers.html`, `guides.html`), stylesheets (`style.css`), and scripts (`script.js`) are in the main directory. This is where you edit the core layout and functionality of the site.

- **`build-guides.js`**: This is the script that performs the magic. It takes all your content and builds the final, viewable website.

- **/dist/**: **This is the most important folder.** It contains the **final, generated website**. You should **always** view the website from this folder. It is automatically cleaned and rebuilt every time you run the build script.

- **/node_modules/**: This folder contains the tools (like the Markdown converter) that the build script needs to work. You can safely ignore it.

---

## Your New Workflow: How to Edit and View the Site

This project is now set up with a professional workflow that makes editing and viewing your site simple.

### Step 1: Start the Development Server

Open your terminal in the project's root directory and run this single command:

```bash
npm start
```

This command will automatically:
1.  Build the most recent version of your website.
2.  Start a local web server.
3.  Open the website in your default browser.

### Step 2: Make Your Edits

With the server running, you can now edit any file in the `/src` directory. 

- **To edit an article:** Open and change a `.md` file in `/src/guide/`.
- **To edit a page:** Open and change an `.html` file in `/src/`.
- **To change styles:** Edit the `.css` files in `/src/`.

When you save a file, the browser will **automatically refresh** to show your changes.

### Step 3: Stop the Server

When you are finished working, go back to your terminal and press `Ctrl+C` to stop the server.
