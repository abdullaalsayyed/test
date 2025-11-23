export interface Config {
  githubToken: string;
  owner: string;
  repos: string[];
  teamMembers: string[];
  trackingDays: number;
  reportFormat: 'json' | 'table' | 'html';
  outputDir: string;
}

export interface Commit {
  sha: string;
  author: string;
  date: Date;
  message: string;
  repo: string;
}

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  state: 'open' | 'closed' | 'merged';
  createdAt: Date;
  closedAt?: Date;
  mergedAt?: Date;
  repo: string;
  reviews: Review[];
  comments: number;
}

export interface Review {
  reviewer: string;
  submittedAt: Date;
  state: string;
}

export interface DeveloperMetrics {
  username: string;
  commits: number;
  prsOpened: number;
  prsMerged: number;
  prsClosed: number;
  reviewsGiven: number;
  commentsGiven: number;
  linesAdded: number;
  linesDeleted: number;
  averagePRSize: number;
  averageReviewTime: number; // hours
}

export interface TeamMetrics {
  totalCommits: number;
  totalPRsOpened: number;
  totalPRsMerged: number;
  totalPRsClosed: number;
  totalReviews: number;
  averagePRCycleTime: number; // hours
  averageReviewResponseTime: number; // hours
  openPRs: number;
  mergeRate: number; // percentage
  activeContributors: number;
}

export interface KPIReport {
  period: {
    start: Date;
    end: Date;
    days: number;
  };
  teamMetrics: TeamMetrics;
  developerMetrics: DeveloperMetrics[];
  topPerformers: {
    mostCommits: DeveloperMetrics;
    mostPRs: DeveloperMetrics;
    mostReviews: DeveloperMetrics;
    fastestReviewer: DeveloperMetrics;
  };
  repositories: RepositoryMetrics[];
}

export interface RepositoryMetrics {
  name: string;
  commits: number;
  prsOpened: number;
  prsMerged: number;
  contributors: number;
  averagePRSize: number;
}
