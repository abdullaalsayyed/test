# GitHub Team Tracker

A powerful GitHub team activity tracking and KPI monitoring tool that helps you track team members' performance, commits, pull requests, code reviews, and other important metrics.

## Features

- **Team Activity Tracking**: Monitor commits, PRs opened/merged/closed, and code reviews
- **Developer KPIs**: Track individual developer performance and contributions
- **Multiple Report Formats**: Generate reports in table (CLI), JSON, or beautiful HTML format
- **Comprehensive Metrics**:
  - Total commits, PRs, and reviews
  - PR cycle time (time from open to merge)
  - Review response time (time from PR open to first review)
  - Merge rate percentage
  - Active contributor count
  - Top performers identification
- **Repository Analytics**: Per-repository metrics and insights
- **Flexible Configuration**: Customize tracking period, repositories, and team members

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd github-team-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment:
```bash
cp .env.example .env
```

4. Edit `.env` and configure:
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `GITHUB_OWNER`: Your GitHub organization or username
   - `TEAM_MEMBERS`: Comma-separated list of GitHub usernames to track
   - `GITHUB_REPOS`: (Optional) Specific repositories to track
   - `TRACKING_DAYS`: Number of days to analyze (default: 7)

## Getting Your GitHub Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
   - `read:user` (Read user profile data)
4. Generate and copy the token
5. Add it to your `.env` file

## Usage

### Quick Start

Run the tracker with default settings (7 days, table format):
```bash
npm run track
```

Or using npm start:
```bash
npm start
```

### Development Mode

Run in development mode with hot reload:
```bash
npm run dev
```

### Build the Project

Compile TypeScript to JavaScript:
```bash
npm run build
```

### CLI Options

```bash
# Track last 14 days
npm run track -- --days 14

# Generate JSON report
npm run track -- --json

# Generate HTML report
npm run track -- --html

# Specify custom output directory
npm run track -- --output ./my-reports

# Combine options
npm run track -- --days 30 --html --output ./monthly-reports
```

## Report Formats

### 1. Table Format (Default)

Beautiful CLI table output with color-coded metrics displayed directly in your terminal.

```bash
npm run track
```

### 2. JSON Format

Machine-readable JSON for integration with other tools or dashboards.

```bash
npm run track -- --json
```

Output saved to: `./reports/team-metrics-YYYY-MM-DD_HH-mm-ss.json`

### 3. HTML Format

Stunning, interactive HTML dashboard with visualizations.

```bash
npm run track -- --html
```

Output saved to: `./reports/team-metrics-YYYY-MM-DD_HH-mm-ss.html`

## Metrics Explained

### Team Metrics

- **Total Commits**: All commits made by team members in the tracking period
- **Total PRs Opened**: Number of pull requests opened
- **Total PRs Merged**: Number of pull requests successfully merged
- **Total PRs Closed**: Number of pull requests closed without merging
- **Open PRs**: Currently open pull requests
- **Merge Rate**: Percentage of opened PRs that were merged
- **Total Reviews**: All code reviews conducted
- **Avg PR Cycle Time**: Average time from PR open to merge (in hours)
- **Avg Review Response Time**: Average time from PR open to first review (in hours)
- **Active Contributors**: Number of unique contributors

### Developer Metrics

For each team member:
- **Commits**: Total commits authored
- **PRs Opened**: Pull requests created
- **PRs Merged**: Pull requests successfully merged
- **Reviews Given**: Code reviews conducted
- **Avg Review Time**: Average time to review PRs (in hours)

### Repository Metrics

For each repository:
- **Commits**: Total commits
- **PRs Opened/Merged**: Pull request statistics
- **Contributors**: Number of unique contributors

## Configuration Examples

### Track Specific Repositories

```env
GITHUB_OWNER=my-org
GITHUB_REPOS=frontend-app,backend-api,mobile-app
TEAM_MEMBERS=alice,bob,charlie,david
```

### Track All Org Repositories

```env
GITHUB_OWNER=my-org
GITHUB_REPOS=
TEAM_MEMBERS=alice,bob,charlie,david
```

The tool will automatically fetch all repositories from the organization.

### Track Last 30 Days

```env
TRACKING_DAYS=30
```

## Use Cases

### 1. Daily Standup Metrics

```bash
npm run track -- --days 1
```

Quick overview of yesterday's activity for standup meetings.

### 2. Weekly Team Review

```bash
npm run track -- --days 7 --html
```

Comprehensive weekly report for team retrospectives.

### 3. Monthly Performance Review

```bash
npm run track -- --days 30 --html
```

Detailed monthly metrics for performance evaluations.

### 4. Sprint Analysis

```bash
npm run track -- --days 14
```

Two-week sprint metrics for agile teams.

## Integration with Git Flow & Governance

This tool complements the [Git Flow & Governance Plan](./GIT_FLOW_GOVERNANCE_PLAN.md) by tracking:

- **PR Cycle Time**: Measures from Section 8 (Quality Gates & Metrics)
- **Review Response Time**: SLA compliance from Section 5
- **Merge Rate**: Quality gate effectiveness
- **Team Performance**: Individual developer metrics
- **Repository Activity**: Cross-project insights

## Automated Tracking with GitHub Actions

You can set up automated daily/weekly tracking with GitHub Actions:

Create `.github/workflows/team-tracker.yml`:

```yaml
name: Team Metrics Tracker

on:
  schedule:
    # Run daily at 9 AM UTC
    - cron: '0 9 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  track:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run tracker
        env:
          GITHUB_TOKEN: ${{ secrets.METRICS_GITHUB_TOKEN }}
          GITHUB_OWNER: ${{ github.repository_owner }}
          TEAM_MEMBERS: alice,bob,charlie,david
          TRACKING_DAYS: 7
        run: npm run track -- --html

      - name: Upload reports
        uses: actions/upload-artifact@v3
        with:
          name: team-metrics
          path: reports/
```

## Troubleshooting

### Error: "GITHUB_TOKEN environment variable is required"

Make sure you've:
1. Created a `.env` file (copy from `.env.example`)
2. Added your GitHub personal access token
3. Token has correct scopes (repo, read:org, read:user)

### Error: "Could not fetch org members"

Either:
1. Add `TEAM_MEMBERS` explicitly in `.env`
2. Or ensure your token has `read:org` scope

### No data showing

Check:
1. Team members have actually made commits/PRs in the tracking period
2. Repository names are correct
3. Token has access to the repositories

### Rate limiting

GitHub API has rate limits:
- Authenticated: 5,000 requests/hour
- For large orgs, consider increasing `TRACKING_DAYS` less frequently

## Development

### Project Structure

```
github-team-tracker/
├── src/
│   ├── index.ts              # Main entry point
│   ├── types.ts              # TypeScript type definitions
│   ├── config.ts             # Configuration management
│   ├── github-client.ts      # GitHub API client
│   ├── metrics-calculator.ts # KPI calculation logic
│   └── report-generator.ts   # Report generation (table/JSON/HTML)
├── reports/                  # Generated reports (git-ignored)
├── .env                      # Environment configuration (git-ignored)
├── .env.example              # Example configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

Future enhancements:
- [ ] Interactive CLI dashboard with charts
- [ ] Slack/Discord integration for automated reports
- [ ] Trend analysis (compare periods)
- [ ] Custom KPI definitions
- [ ] Team velocity tracking
- [ ] Code quality metrics integration
- [ ] Burndown charts for sprints
- [ ] Export to CSV/Excel
- [ ] Web-based dashboard
- [ ] Historical data storage and trending

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for development teams tracking their GitHub activity and KPIs**
