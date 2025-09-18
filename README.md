# uenrvote
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

To run this application on your local machine, you'll need to open two terminal windows.

**Terminal 1: Start the Web Application**

In the first terminal, run the following command to start the Next.js development server:

```bash
npm run dev
```

This will start the web application, usually available at `http://localhost:9002`.

**Terminal 2: Start the AI Flows**

In the second terminal, run this command to start the Genkit AI development server:

```bash
npm run genkit:dev
```

This makes the AI functionality (like the candidate info and image generators) available to the web application.

Both of these servers need to be running at the same time for the entire application to work correctly.
