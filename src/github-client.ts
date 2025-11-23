import { Octokit } from '@octokit/rest';
import { subDays } from 'date-fns';
import { Config, Commit, PullRequest, Review } from './types.js';

export class GitHubClient {
  private octokit: Octokit;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.githubToken,
    });
  }

  async getRepositories(): Promise<string[]> {
    if (this.config.repos.length > 0) {
      return this.config.repos;
    }

    try {
      const { data } = await this.octokit.repos.listForOrg({
        org: this.config.owner,
        per_page: 100,
      });
      return data.map(repo => repo.name);
    } catch {
      // If not an org, try listing user repos
      const { data } = await this.octokit.repos.listForUser({
        username: this.config.owner,
        per_page: 100,
      });
      return data.map(repo => repo.name);
    }
  }

  async getCommits(repo: string): Promise<Commit[]> {
    const since = subDays(new Date(), this.config.trackingDays).toISOString();
    const commits: Commit[] = [];

    try {
      const { data } = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo,
        since,
        per_page: 100,
      });

      for (const commit of data) {
        if (commit.author?.login) {
          commits.push({
            sha: commit.sha,
            author: commit.author.login,
            date: new Date(commit.commit.author?.date || ''),
            message: commit.commit.message,
            repo,
          });
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch commits for ${repo}:`, (error as Error).message);
    }

    return commits;
  }

  async getPullRequests(repo: string): Promise<PullRequest[]> {
    const since = subDays(new Date(), this.config.trackingDays);
    const pullRequests: PullRequest[] = [];

    try {
      // Get closed/merged PRs
      const { data: closedPRs } = await this.octokit.pulls.list({
        owner: this.config.owner,
        repo,
        state: 'closed',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      });

      // Get open PRs
      const { data: openPRs } = await this.octokit.pulls.list({
        owner: this.config.owner,
        repo,
        state: 'open',
        sort: 'created',
        direction: 'desc',
        per_page: 100,
      });

      const allPRs = [...openPRs, ...closedPRs];

      for (const pr of allPRs) {
        const createdAt = new Date(pr.created_at);

        // Only include PRs created within the tracking period
        if (createdAt < since) continue;

        const reviews = await this.getPRReviews(repo, pr.number);
        const isMerged = pr.merged_at !== null;

        pullRequests.push({
          number: pr.number,
          title: pr.title,
          author: pr.user?.login || 'unknown',
          state: isMerged ? 'merged' : pr.state as 'open' | 'closed',
          createdAt,
          closedAt: pr.closed_at ? new Date(pr.closed_at) : undefined,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : undefined,
          repo,
          reviews,
          comments: 0, // Could be fetched separately if needed
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch pull requests for ${repo}:`, (error as Error).message);
    }

    return pullRequests;
  }

  async getPRReviews(repo: string, prNumber: number): Promise<Review[]> {
    try {
      const { data } = await this.octokit.pulls.listReviews({
        owner: this.config.owner,
        repo,
        pull_number: prNumber,
      });

      return data.map(review => ({
        reviewer: review.user?.login || 'unknown',
        submittedAt: new Date(review.submitted_at || ''),
        state: review.state,
      }));
    } catch {
      return [];
    }
  }

  async getUserInfo(username: string): Promise<any> {
    try {
      const { data } = await this.octokit.users.getByUsername({
        username,
      });
      return data;
    } catch {
      return null;
    }
  }

  async getTeamMembers(): Promise<string[]> {
    if (this.config.teamMembers.length > 0) {
      return this.config.teamMembers;
    }

    // Try to get org members
    try {
      const { data } = await this.octokit.orgs.listMembers({
        org: this.config.owner,
        per_page: 100,
      });
      return data.map(member => member.login);
    } catch {
      console.warn('Could not fetch org members. Please set TEAM_MEMBERS in .env file.');
      return [];
    }
  }
}
