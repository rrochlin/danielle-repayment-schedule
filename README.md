# Medical School Loan Repayment Calculator

An interactive visualization tool to help medical students understand their loan repayment timeline and explore different payment scenarios.

## Features

- **Loan Accumulation Visualization**: See how your loan balance grows during the 2-year medical school period
- **Interactive Payment Slider**: Adjust monthly payment amounts to see how they affect your payoff timeline
- **Real-time Calculations**: Instant updates showing total balance at graduation and time to payoff
- **Visual Timeline**: Clear graph showing the transition from school phase to repayment phase

## Loan Parameters

- **Annual Tuition**: $96,000
- **Interest Rate**: 8.0% annually (compounded monthly)
- **School Duration**: 2 years (6 quarters)
- **Disbursement Schedule**: $32,000 per quarter (3 quarters per year)

## How to Use

1. Open the application in your web browser
2. View your projected loan balance at graduation in the summary cards
3. Use the slider to adjust your monthly payment amount ($500 - $10,000)
4. Watch the graph update in real-time to show your complete repayment timeline
5. See how different payment amounts affect your time to payoff

## Deploying to GitHub Pages

### Option 1: Using GitHub UI

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Add loan repayment calculator"
   git push origin main
   ```

2. Go to your repository on GitHub
3. Click on **Settings**
4. Scroll down to **Pages** in the left sidebar
5. Under **Source**, select **main** branch
6. Click **Save**
7. Your site will be published at `https://[username].github.io/[repository-name]`

### Option 2: Using GitHub CLI

```bash
# Commit and push your changes
git add .
git commit -m "Add loan repayment calculator"
git push origin main

# Enable GitHub Pages (requires gh CLI)
gh repo edit --enable-pages --pages-branch main
```

### Updating the Application

After making any changes:

```bash
git add .
git commit -m "Update calculator"
git push origin main
```

GitHub Pages will automatically rebuild and deploy your changes within a few minutes.

## Local Development

To test locally, simply open `index.html` in your web browser:

```bash
open index.html
```

Or use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Then open http://localhost:8000 in your browser
```

## Technical Details

- **No Build Process Required**: The application uses CDN-hosted libraries and runs entirely in the browser
- **Chart.js**: Used for interactive loan balance visualization
- **Vanilla JavaScript**: No framework dependencies, just HTML, CSS, and JS
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Files

- `index.html` - Main HTML structure
- `app.js` - Loan calculation logic and chart rendering
- `styles.css` - Styling and responsive design
- `README.md` - This file

## Customization

To modify the loan parameters, edit the constants in `app.js`:

```javascript
const ANNUAL_TUITION = 96000;
const QUARTERS_PER_YEAR = 3;
const SCHOOL_YEARS = 2;
const ANNUAL_INTEREST_RATE = 0.08;
```

## License

This project is provided as-is for personal use.
