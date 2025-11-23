import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import Table from 'cli-table3';
import chalk from 'chalk';
import { format } from 'date-fns';
import { KPIReport } from './types.js';

export class ReportGenerator {
  generateTableReport(report: KPIReport): void {
    console.log('\n' + chalk.bold.cyan('='.repeat(80)));
    console.log(chalk.bold.cyan('GitHub Team Activity & KPI Report'));
    console.log(chalk.bold.cyan('='.repeat(80)) + '\n');

    // Period
    console.log(chalk.bold('Report Period:'));
    console.log(`  ${format(report.period.start, 'MMM dd, yyyy')} - ${format(report.period.end, 'MMM dd, yyyy')} (${report.period.days} days)\n`);

    // Team Metrics
    console.log(chalk.bold.yellow('Team Metrics:'));
    const teamTable = new Table({
      head: [chalk.cyan('Metric'), chalk.cyan('Value')],
      colWidths: [40, 20],
    });

    teamTable.push(
      ['Total Commits', chalk.green(report.teamMetrics.totalCommits.toString())],
      ['Total PRs Opened', chalk.blue(report.teamMetrics.totalPRsOpened.toString())],
      ['Total PRs Merged', chalk.green(report.teamMetrics.totalPRsMerged.toString())],
      ['Total PRs Closed (not merged)', chalk.red(report.teamMetrics.totalPRsClosed.toString())],
      ['Open PRs', chalk.yellow(report.teamMetrics.openPRs.toString())],
      ['Merge Rate', chalk.green(`${report.teamMetrics.mergeRate}%`)],
      ['Total Reviews', chalk.blue(report.teamMetrics.totalReviews.toString())],
      ['Avg PR Cycle Time', chalk.cyan(`${report.teamMetrics.averagePRCycleTime} hours`)],
      ['Avg Review Response Time', chalk.cyan(`${report.teamMetrics.averageReviewResponseTime} hours`)],
      ['Active Contributors', chalk.green(report.teamMetrics.activeContributors.toString())],
    );

    console.log(teamTable.toString() + '\n');

    // Developer Metrics
    console.log(chalk.bold.yellow('Developer Metrics:'));
    const devTable = new Table({
      head: [
        chalk.cyan('Developer'),
        chalk.cyan('Commits'),
        chalk.cyan('PRs Opened'),
        chalk.cyan('PRs Merged'),
        chalk.cyan('Reviews'),
        chalk.cyan('Avg Review Time (h)'),
      ],
      colWidths: [20, 10, 12, 12, 10, 20],
    });

    report.developerMetrics
      .sort((a, b) => b.commits - a.commits)
      .forEach(dev => {
        devTable.push([
          dev.username,
          chalk.green(dev.commits.toString()),
          chalk.blue(dev.prsOpened.toString()),
          chalk.green(dev.prsMerged.toString()),
          chalk.yellow(dev.reviewsGiven.toString()),
          chalk.cyan(dev.averageReviewTime > 0 ? dev.averageReviewTime.toString() : 'N/A'),
        ]);
      });

    console.log(devTable.toString() + '\n');

    // Top Performers
    console.log(chalk.bold.yellow('Top Performers:'));
    const topTable = new Table({
      head: [chalk.cyan('Category'), chalk.cyan('Developer'), chalk.cyan('Value')],
      colWidths: [25, 20, 15],
    });

    topTable.push(
      ['Most Commits', chalk.green(report.topPerformers.mostCommits.username), chalk.green(report.topPerformers.mostCommits.commits.toString())],
      ['Most PRs', chalk.blue(report.topPerformers.mostPRs.username), chalk.blue(report.topPerformers.mostPRs.prsOpened.toString())],
      ['Most Reviews', chalk.yellow(report.topPerformers.mostReviews.username), chalk.yellow(report.topPerformers.mostReviews.reviewsGiven.toString())],
      ['Fastest Reviewer', chalk.cyan(report.topPerformers.fastestReviewer.username), chalk.cyan(`${report.topPerformers.fastestReviewer.averageReviewTime}h`)],
    );

    console.log(topTable.toString() + '\n');

    // Repository Metrics
    if (report.repositories.length > 0) {
      console.log(chalk.bold.yellow('Repository Metrics:'));
      const repoTable = new Table({
        head: [
          chalk.cyan('Repository'),
          chalk.cyan('Commits'),
          chalk.cyan('PRs Opened'),
          chalk.cyan('PRs Merged'),
          chalk.cyan('Contributors'),
        ],
        colWidths: [30, 10, 12, 12, 15],
      });

      report.repositories
        .sort((a, b) => b.commits - a.commits)
        .forEach(repo => {
          repoTable.push([
            repo.name,
            chalk.green(repo.commits.toString()),
            chalk.blue(repo.prsOpened.toString()),
            chalk.green(repo.prsMerged.toString()),
            chalk.yellow(repo.contributors.toString()),
          ]);
        });

      console.log(repoTable.toString() + '\n');
    }

    console.log(chalk.bold.cyan('='.repeat(80)) + '\n');
  }

  generateJSONReport(report: KPIReport, outputDir: string): string {
    try {
      mkdirSync(outputDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const filename = `team-metrics-${timestamp}.json`;
    const filepath = join(outputDir, filename);

    const jsonReport = JSON.stringify(report, null, 2);
    writeFileSync(filepath, jsonReport, 'utf-8');

    return filepath;
  }

  generateHTMLReport(report: KPIReport, outputDir: string): string {
    try {
      mkdirSync(outputDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const filename = `team-metrics-${timestamp}.html`;
    const filepath = join(outputDir, filename);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Team Activity Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2em; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1em; }
        .content { padding: 30px; }
        .section {
            margin-bottom: 40px;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        }
        .metric-card:hover { transform: translateY(-2px); }
        .metric-label {
            font-size: 0.85em;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        thead {
            background: #667eea;
            color: white;
        }
        th, td {
            padding: 15px;
            text-align: left;
        }
        tbody tr:nth-child(even) { background: #f8f9fa; }
        tbody tr:hover { background: #e9ecef; }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .badge-green { background: #d4edda; color: #155724; }
        .badge-blue { background: #cce5ff; color: #004085; }
        .badge-yellow { background: #fff3cd; color: #856404; }
        .badge-purple { background: #e2d9f3; color: #5a2a82; }
        .top-performers {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .performer-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            text-align: center;
        }
        .performer-card h3 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .performer-name {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .performer-value {
            font-size: 1.8em;
            color: #667eea;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 GitHub Team Activity & KPI Report</h1>
            <p>${format(report.period.start, 'MMM dd, yyyy')} - ${format(report.period.end, 'MMM dd, yyyy')} (${report.period.days} days)</p>
        </div>

        <div class="content">
            <!-- Team Metrics -->
            <div class="section">
                <h2>📊 Team Metrics</h2>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-label">Total Commits</div>
                        <div class="metric-value">${report.teamMetrics.totalCommits}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">PRs Opened</div>
                        <div class="metric-value">${report.teamMetrics.totalPRsOpened}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">PRs Merged</div>
                        <div class="metric-value">${report.teamMetrics.totalPRsMerged}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Merge Rate</div>
                        <div class="metric-value">${report.teamMetrics.mergeRate}%</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Total Reviews</div>
                        <div class="metric-value">${report.teamMetrics.totalReviews}</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Avg PR Cycle Time</div>
                        <div class="metric-value">${report.teamMetrics.averagePRCycleTime}h</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Avg Review Time</div>
                        <div class="metric-value">${report.teamMetrics.averageReviewResponseTime}h</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-label">Active Contributors</div>
                        <div class="metric-value">${report.teamMetrics.activeContributors}</div>
                    </div>
                </div>
            </div>

            <!-- Top Performers -->
            <div class="section">
                <h2>🏆 Top Performers</h2>
                <div class="top-performers">
                    <div class="performer-card">
                        <h3>Most Commits</h3>
                        <div class="performer-name">${report.topPerformers.mostCommits.username}</div>
                        <div class="performer-value">${report.topPerformers.mostCommits.commits}</div>
                    </div>
                    <div class="performer-card">
                        <h3>Most PRs</h3>
                        <div class="performer-name">${report.topPerformers.mostPRs.username}</div>
                        <div class="performer-value">${report.topPerformers.mostPRs.prsOpened}</div>
                    </div>
                    <div class="performer-card">
                        <h3>Most Reviews</h3>
                        <div class="performer-name">${report.topPerformers.mostReviews.username}</div>
                        <div class="performer-value">${report.topPerformers.mostReviews.reviewsGiven}</div>
                    </div>
                    <div class="performer-card">
                        <h3>Fastest Reviewer</h3>
                        <div class="performer-name">${report.topPerformers.fastestReviewer.username}</div>
                        <div class="performer-value">${report.topPerformers.fastestReviewer.averageReviewTime}h</div>
                    </div>
                </div>
            </div>

            <!-- Developer Metrics -->
            <div class="section">
                <h2>👥 Developer Metrics</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Developer</th>
                            <th>Commits</th>
                            <th>PRs Opened</th>
                            <th>PRs Merged</th>
                            <th>Reviews</th>
                            <th>Avg Review Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.developerMetrics.sort((a, b) => b.commits - a.commits).map(dev => `
                        <tr>
                            <td><strong>${dev.username}</strong></td>
                            <td><span class="badge badge-green">${dev.commits}</span></td>
                            <td><span class="badge badge-blue">${dev.prsOpened}</span></td>
                            <td><span class="badge badge-green">${dev.prsMerged}</span></td>
                            <td><span class="badge badge-yellow">${dev.reviewsGiven}</span></td>
                            <td><span class="badge badge-purple">${dev.averageReviewTime > 0 ? dev.averageReviewTime + 'h' : 'N/A'}</span></td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Repository Metrics -->
            ${report.repositories.length > 0 ? `
            <div class="section">
                <h2>📦 Repository Metrics</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Repository</th>
                            <th>Commits</th>
                            <th>PRs Opened</th>
                            <th>PRs Merged</th>
                            <th>Contributors</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.repositories.sort((a, b) => b.commits - a.commits).map(repo => `
                        <tr>
                            <td><strong>${repo.name}</strong></td>
                            <td><span class="badge badge-green">${repo.commits}</span></td>
                            <td><span class="badge badge-blue">${repo.prsOpened}</span></td>
                            <td><span class="badge badge-green">${repo.prsMerged}</span></td>
                            <td><span class="badge badge-yellow">${repo.contributors}</span></td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            Generated on ${format(new Date(), 'MMMM dd, yyyy \'at\' HH:mm:ss')}
        </div>
    </div>
</body>
</html>
    `;

    writeFileSync(filepath, html, 'utf-8');
    return filepath;
  }
}
