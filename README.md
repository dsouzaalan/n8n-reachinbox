![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-starter

This repo contains example nodes to help you get started building your own custom integrations for [n8n](https://n8n.io). It includes the node linter and other dependencies.

To make your custom node available to the community, you must create it as an npm package, and [submit it to the npm registry](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry).

If you would like your node to be available on n8n cloud you can also [submit your node for verification](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/).

---

## Prerequisites

You need the following installed on your development machine:

* [git](https://git-scm.com/downloads)

* Node.js and npm (Minimum version: Node 20).
  Install with [nvm](https://github.com/nvm-sh/nvm) for Linux, Mac, and WSL. For Windows, follow [Microsoft's guide](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows).

* Install n8n globally:

  ```bash
  npm install n8n -g
  ```

* Recommended: [Set up your development environment](https://docs.n8n.io/integrations/creating-nodes/build/node-development-environment/).

---

## Using this Starter

These are the basic steps to start building your own n8n node:

1. [Generate a new repository](https://github.com/n8n-io/n8n-nodes-starter/generate) from this template.
2. Clone your repo:

   ```bash
   git clone https://github.com/<your-org>/<your-repo-name>.git
   ```
3. Navigate into the project and install dependencies:

   ```bash
   cd <your-repo-name>
   npm install
   ```
4. Open the project in your code editor.
5. Modify or replace the sample nodes in `/nodes` and `/credentials`.
6. Update `package.json` with your own package details.
7. Lint your code:

   ```bash
   npm run lint       # Check for issues
   npm run lintfix    # Fix what can be auto-corrected
   ```
8. Build your package:

   ```bash
   npm run build
   ```

---

## Testing Your Node Locally

To test your node in a local n8n installation:

1. **Publish your node locally:**

   ```bash
   npm link
   ```

2. **Link it to your local n8n instance:**

   Navigate to your n8n custom nodes directory. This is typically:

   ```
   ~/.n8n/custom/
   ```
   
   If it doesn't exist, create it and initialize a package:

   ```bash
   mkdir -p ~/.n8n/custom
   cd ~/.n8n/custom
   npm init
   ```

3. **Link your custom node:**

   ```bash
   npm link <your-node-package-name>
   ```

4. **Start n8n:**

   ```bash
   n8n
   ```

5. **Open n8n in your browser** and search for your node in the node panel.

---

## Troubleshooting

* **No `custom/` directory in `~/.n8n`?**
  You need to create it manually:

  ```bash
  mkdir ~/.n8n/custom
  cd ~/.n8n/custom
  npm init
  ```
