# Quick Start Guide

Get up and running with GitHub Team Tracker in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Your GitHub Token

1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "Team Tracker"
4. Select scopes:
   - ✅ `repo`
   - ✅ `read:org`
   - ✅ `read:user`
5. Click "Generate token"
6. Copy the token (you won't see it again!)

## Step 3: Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit the file
nano .env  # or use your favorite editor
```

Add your configuration:
```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-org-name
TEAM_MEMBERS=alice,bob,charlie,diana,eve
TRACKING_DAYS=7
```

## Step 4: Run Your First Report

```bash
npm run track
```

That's it! You should see a beautiful table with your team's metrics.

## Step 5: Generate HTML Report

```bash
npm run track -- --html
```

Open `reports/team-metrics-*.html` in your browser to see a stunning dashboard!

## Common Use Cases

### Daily Standup Metrics
```bash
npm run track -- --days 1
```

### Weekly Team Review
```bash
npm run track -- --days 7 --html
```

### Sprint Retrospective (2 weeks)
```bash
npm run track -- --days 14 --html
```

### Monthly Report
```bash
npm run track -- --days 30 --html
```

## What's Next?

- 📖 Read the full [README.md](./README.md) for detailed documentation
- 🔧 Check out the [Git Flow & Governance Plan](./GIT_FLOW_GOVERNANCE_PLAN.md)
- 🤖 Set up automated tracking with GitHub Actions (see `.github/workflows/team-tracker.yml`)
- 📊 Customize metrics and reports for your team

## Need Help?

- Check the Troubleshooting section in [README.md](./README.md)
- Open an issue on GitHub
- Review your `.env` configuration

Happy tracking! 🚀
