# Wildfire Allergy Safety Checker

An internal web tool for restaurant managers to check allergy safety for menu items.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate menu data from CSV:
```bash
npm run generate-menu-data
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (typically `http://localhost:5173`)

## Usage

1. Select a dish from the dropdown (you can search by name, ticket code, or category)
2. Select one or more allergies using the checkboxes
3. Click "Check Safety" to see the results

The tool will show:
- ✅ Safe as-is
- ⚠️ Safe ONLY with modifications (and show those modifications)
- ⛔ NOT safe / should not be served

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Important Notes

- This tool is based on the ingredient book data
- For severe allergies, ALWAYS confirm with the chef/manager
- Follow full allergy protocol regardless of tool results



