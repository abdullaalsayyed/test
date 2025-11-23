#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, validateConfig } from './config.js';
import { GitHubClient } from './github-client.js';
import { MetricsCalculator } from './metrics-calculator.js';
import { ReportGenerator } from './report-generator.js';
import { Commit, PullRequest } from './types.js';

const program = new Command();

program
  .name('github-team-tracker')
  .description('GitHub team activity tracking and KPI monitoring tool')
  .version('1.0.0')
  .option('-d, --days <number>', 'Number of days to track (default: 7)', '7')
  .option('-f, --format <type>', 'Report format: table, json, html (default: table)', 'table')
  .option('-o, --output <dir>', 'Output directory for reports (default: ./reports)', './reports')
  .option('--dashboard', 'Display interactive dashboard')
  .option('--json', 'Output JSON format')
  .option('--html', 'Output HTML format')
  .parse(process.argv);

const options = program.opts();

async function main() {
  try {
    console.log(chalk.bold.cyan('\n🚀 GitHub Team Tracker\n'));

    // Load configuration
    console.log(chalk.gray('Loading configuration...'));
    const config = loadConfig();

    // Override config with CLI options
    if (options.days) config.trackingDays = parseInt(options.days, 10);
    if (options.format) config.reportFormat = options.format;
    if (options.output) config.outputDir = options.output;
    if (options.json) config.reportFormat = 'json';
    if (options.html) config.reportFormat = 'html';

    validateConfig(config);

    // Initialize clients
    const githubClient = new GitHubClient(config);
    const metricsCalculator = new MetricsCalculator();
    const reportGenerator = new ReportGenerator();

    // Get repositories
    console.log(chalk.gray('Fetching repositories...'));
    const repositories = await githubClient.getRepositories();

    if (repositories.length === 0) {
      console.log(chalk.yellow('⚠️  No repositories found. Please check your configuration.'));
      return;
    }

    console.log(chalk.green(`✓ Found ${repositories.length} repositories`));

    // Get team members
    console.log(chalk.gray('Fetching team members...'));
    const teamMembers = await githubClient.getTeamMembers();

    if (teamMembers.length === 0) {
      console.log(chalk.yellow('⚠️  No team members found. Please set TEAM_MEMBERS in .env file.'));
      return;
    }

    console.log(chalk.green(`✓ Found ${teamMembers.length} team members`));

    // Fetch data
    console.log(chalk.gray(`Fetching data for the last ${config.trackingDays} days...`));

    const allCommits: Commit[] = [];
    const allPRs: PullRequest[] = [];

    for (const repo of repositories) {
      console.log(chalk.gray(`  - Processing ${repo}...`));

      const commits = await githubClient.getCommits(repo);
      const prs = await githubClient.getPullRequests(repo);

      allCommits.push(...commits);
      allPRs.push(...prs);
    }

    console.log(chalk.green(`✓ Fetched ${allCommits.length} commits and ${allPRs.length} pull requests`));

    // Calculate metrics
    console.log(chalk.gray('Calculating metrics...'));
    const report = metricsCalculator.generateKPIReport(
      allCommits,
      allPRs,
      teamMembers,
      repositories,
      config.trackingDays
    );

    console.log(chalk.green('✓ Metrics calculated'));

    // Generate report
    console.log(chalk.gray('Generating report...\n'));

    if (config.reportFormat === 'json' || options.json) {
      const filepath = reportGenerator.generateJSONReport(report, config.outputDir);
      console.log(chalk.green(`✓ JSON report saved to: ${filepath}`));

      // Also show table if not explicitly JSON only
      if (!options.json) {
        reportGenerator.generateTableReport(report);
      }
    } else if (config.reportFormat === 'html' || options.html) {
      const filepath = reportGenerator.generateHTMLReport(report, config.outputDir);
      console.log(chalk.green(`✓ HTML report saved to: ${filepath}`));

      // Also show table
      reportGenerator.generateTableReport(report);
    } else {
      // Table format (default)
      reportGenerator.generateTableReport(report);

      // Save JSON and HTML for reference
      const jsonPath = reportGenerator.generateJSONReport(report, config.outputDir);
      const htmlPath = reportGenerator.generateHTMLReport(report, config.outputDir);

      console.log(chalk.gray(`\nReports also saved to:`));
      console.log(chalk.gray(`  JSON: ${jsonPath}`));
      console.log(chalk.gray(`  HTML: ${htmlPath}`));
    }

    console.log(chalk.bold.green('\n✅ Done!\n'));

  } catch (error) {
    console.error(chalk.bold.red('\n❌ Error:'), (error as Error).message);

    if ((error as Error).message.includes('GITHUB_TOKEN')) {
      console.log(chalk.yellow('\nSetup instructions:'));
      console.log(chalk.gray('1. Copy .env.example to .env'));
      console.log(chalk.gray('2. Create a GitHub personal access token at:'));
      console.log(chalk.blue('   https://github.com/settings/tokens'));
      console.log(chalk.gray('3. Add the token to your .env file'));
      console.log(chalk.gray('4. Set GITHUB_OWNER and TEAM_MEMBERS in .env'));
    }

    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  console.error(chalk.red('Unhandled error:'), error.message);
  process.exit(1);
});

main();
