# Build Commands

## Uploading this starter pack to GitHub

From your local machine:

```bash
git clone https://github.com/NucleusHQAI/Signal.git
cd Signal

# Copy the starter pack files into this folder, then:
git add .
git commit -m "Initialise SIGNAL product foundation"
git push origin main
```

## Recommended first app setup later

Only do this once the product scope is agreed.

```bash
npm create vite@latest signal-app -- --template react-ts
cd signal-app
npm install
npm run dev
```

Possible packages later:

```bash
npm install recharts lucide-react
```

Do not start with integrations until the local prototype, data model and rules engine are working.
