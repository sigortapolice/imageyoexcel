# Image to Excel Converter

This application uses AI to extract tabular data from an uploaded image. The extracted data is displayed in an editable spreadsheet, which can be downloaded as a CSV file.

This project is built with React, TypeScript, and Tailwind CSS, and it uses Google's Gemini API for data extraction.

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Local Development

To run the application on your local machine, you need to provide your Gemini API key.

1.  **Create an environment file:**
    Create a file named `.env.local` in the root of the project.

2.  **Add your API key:**
    Add the following line to your `.env.local` file, replacing `YOUR_API_KEY_HERE` with your actual key:
    ```
    API_KEY=YOUR_API_KEY_HERE
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, and you can view your application at `http://localhost:5173` (the port may vary).

## Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages when you push changes to the `main` branch.

### API Key Configuration for Deployment

For the deployed application to work, you must securely provide your Gemini API key to the build process.

1.  **Go to your repository settings:**
    Navigate to your repository on GitHub and click on the **Settings** tab.

2.  **Add a repository secret:**
    - In the left sidebar, under the "Security" section, go to **Secrets and variables** > **Actions**.
    - Click the **New repository secret** button.
    - Set the **Name** to `API_KEY`. The name must be exactly this to match the workflow configuration.
    - Paste your Google Gemini API key into the **Secret** field.
    - Click **Add secret**.

Once the secret is configured, any new push to the `main` branch will trigger the deployment workflow, building your application with the correct API key. You can view the deployment status in the **Actions** tab of your repository.
