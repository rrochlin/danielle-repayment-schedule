# Medical School Loan Repayment Calculator

An interactive visualization tool built with React and MUI to help medical students understand their loan repayment timeline and explore different payment scenarios.

## Features

- **Loan Accumulation Visualization**: See how your loan balance grows during the 2-year medical school period
- **Interactive Payment Slider**: Adjust monthly payment amounts to see how they affect your payoff timeline
- **Real-time Calculations**: Instant updates showing total balance at graduation and time to payoff
- **MUI X Charts**: Professional, interactive charting with Material-UI design
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices

## Loan Parameters

- **Annual Tuition**: $96,000
- **Interest Rate**: 8.0% annually (compounded monthly)
- **School Duration**: 2 years (6 quarters)
- **Disbursement Schedule**: $32,000 per quarter (3 quarters per year)

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be running at `http://localhost:5173`

### Build for Production

```bash
# Build the application
pnpm build

# Preview the production build
pnpm preview
```

## Deploying to GitHub Pages

### Method 1: Automated Deployment (Recommended)

This project is configured to deploy automatically using `gh-pages`:

```bash
# Build and deploy to GitHub Pages
pnpm run deploy
```

This will:
1. Build the production bundle
2. Create/update a `gh-pages` branch
3. Push the built files to that branch
4. GitHub Pages will automatically serve your site

### Method 2: Manual Setup

1. **Build the project**:
   ```bash
   pnpm build
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add loan repayment calculator"
   git push origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select `gh-pages` branch
   - Click **Save**

4. **Access your site**:
   - Your site will be available at: `https://[username].github.io/danielle-repayment-schedule`

### Updating the Deployment

After making changes:

```bash
git add .
git commit -m "Update calculator"
git push origin main
pnpm run deploy
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI) v5** - UI component library
- **MUI X Charts** - Professional charting library
- **Emotion** - CSS-in-JS styling

## Project Structure

```
danielle-repayment-schedule/
├── src/
│   ├── App.jsx          # Main React component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

## Customization

### Modifying Loan Parameters

Edit the constants in `src/App.jsx`:

```javascript
const ANNUAL_TUITION = 96000
const QUARTERS_PER_YEAR = 3
const SCHOOL_YEARS = 2
const ANNUAL_INTEREST_RATE = 0.08
```

### Changing the Color Theme

The app uses Material-UI theming. Modify the theme in `src/App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // Change primary color
    },
    secondary: {
      main: '#388e3c',  // Change secondary color
    },
  },
})
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm deploy` - Deploy to GitHub Pages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is provided as-is for personal use.
