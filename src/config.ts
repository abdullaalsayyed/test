import dotenv from 'dotenv';
import { Config } from './types.js';

dotenv.config();

export function loadConfig(): Config {
  const githubToken = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;

  if (!githubToken) {
    throw new Error('GITHUB_TOKEN environment variable is required. Please set it in .env file.');
  }

  if (!owner) {
    throw new Error('GITHUB_OWNER environment variable is required. Please set it in .env file.');
  }

  const reposEnv = process.env.GITHUB_REPOS || '';
  const repos = reposEnv ? reposEnv.split(',').map(r => r.trim()).filter(Boolean) : [];

  const teamMembersEnv = process.env.TEAM_MEMBERS || '';
  const teamMembers = teamMembersEnv ? teamMembersEnv.split(',').map(m => m.trim()).filter(Boolean) : [];

  const trackingDays = parseInt(process.env.TRACKING_DAYS || '7', 10);
  const reportFormat = (process.env.REPORT_FORMAT || 'table') as 'json' | 'table' | 'html';
  const outputDir = process.env.OUTPUT_DIR || './reports';

  return {
    githubToken,
    owner,
    repos,
    teamMembers,
    trackingDays,
    reportFormat,
    outputDir,
  };
}

export function validateConfig(config: Config): void {
  if (!config.githubToken || config.githubToken === 'your_github_token_here') {
    throw new Error('Please set a valid GITHUB_TOKEN in your .env file');
  }

  if (!config.owner || config.owner === 'your-org-or-username') {
    throw new Error('Please set a valid GITHUB_OWNER in your .env file');
  }

  if (config.trackingDays < 1 || config.trackingDays > 365) {
    throw new Error('TRACKING_DAYS must be between 1 and 365');
  }
}
