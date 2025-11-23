import { differenceInHours } from 'date-fns';
import {
  Commit,
  PullRequest,
  DeveloperMetrics,
  TeamMetrics,
  KPIReport,
  RepositoryMetrics,
} from './types.js';

export class MetricsCalculator {
  calculateDeveloperMetrics(
    username: string,
    commits: Commit[],
    prs: PullRequest[]
  ): DeveloperMetrics {
    const userCommits = commits.filter(c => c.author === username);
    const userPRsOpened = prs.filter(pr => pr.author === username);
    const userPRsMerged = userPRsOpened.filter(pr => pr.state === 'merged');
    const userPRsClosed = userPRsOpened.filter(pr => pr.state === 'closed');

    // Count reviews given by this user
    const reviewsGiven = prs.reduce((count, pr) => {
      return count + pr.reviews.filter(r => r.reviewer === username).length;
    }, 0);

    // Count comments (approximation based on PRs they reviewed)
    const commentsGiven = prs
      .filter(pr => pr.reviews.some(r => r.reviewer === username))
      .reduce((sum, pr) => sum + pr.comments, 0);

    // Calculate average PR size (using commits as proxy)
    const avgPRSize = userPRsOpened.length > 0
      ? userCommits.length / userPRsOpened.length
      : 0;

    // Calculate average review time for PRs this user reviewed
    const reviewTimes: number[] = [];
    prs.forEach(pr => {
      const userReview = pr.reviews.find(r => r.reviewer === username);
      if (userReview) {
        const reviewTime = differenceInHours(userReview.submittedAt, pr.createdAt);
        if (reviewTime > 0) reviewTimes.push(reviewTime);
      }
    });

    const averageReviewTime = reviewTimes.length > 0
      ? reviewTimes.reduce((sum, time) => sum + time, 0) / reviewTimes.length
      : 0;

    return {
      username,
      commits: userCommits.length,
      prsOpened: userPRsOpened.length,
      prsMerged: userPRsMerged.length,
      prsClosed: userPRsClosed.length,
      reviewsGiven,
      commentsGiven,
      linesAdded: 0, // Would need additional API calls to get this
      linesDeleted: 0, // Would need additional API calls to get this
      averagePRSize: Math.round(avgPRSize * 10) / 10,
      averageReviewTime: Math.round(averageReviewTime * 10) / 10,
    };
  }

  calculateTeamMetrics(prs: PullRequest[], commits: Commit[]): TeamMetrics {
    const totalPRsOpened = prs.length;
    const mergedPRs = prs.filter(pr => pr.state === 'merged');
    const closedPRs = prs.filter(pr => pr.state === 'closed');
    const openPRs = prs.filter(pr => pr.state === 'open');

    // Calculate average PR cycle time (time from open to merge)
    const cycleTimes: number[] = [];
    mergedPRs.forEach(pr => {
      if (pr.mergedAt) {
        const cycleTime = differenceInHours(pr.mergedAt, pr.createdAt);
        if (cycleTime > 0) cycleTimes.push(cycleTime);
      }
    });

    const averagePRCycleTime = cycleTimes.length > 0
      ? cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length
      : 0;

    // Calculate average review response time (time from PR open to first review)
    const reviewResponseTimes: number[] = [];
    prs.forEach(pr => {
      if (pr.reviews.length > 0) {
        const firstReview = pr.reviews.sort((a, b) =>
          a.submittedAt.getTime() - b.submittedAt.getTime()
        )[0];
        const responseTime = differenceInHours(firstReview.submittedAt, pr.createdAt);
        if (responseTime > 0) reviewResponseTimes.push(responseTime);
      }
    });

    const averageReviewResponseTime = reviewResponseTimes.length > 0
      ? reviewResponseTimes.reduce((sum, time) => sum + time, 0) / reviewResponseTimes.length
      : 0;

    // Count total reviews
    const totalReviews = prs.reduce((sum, pr) => sum + pr.reviews.length, 0);

    // Calculate merge rate
    const mergeRate = totalPRsOpened > 0
      ? (mergedPRs.length / totalPRsOpened) * 100
      : 0;

    // Count active contributors
    const contributors = new Set([
      ...commits.map(c => c.author),
      ...prs.map(pr => pr.author),
    ]);

    return {
      totalCommits: commits.length,
      totalPRsOpened,
      totalPRsMerged: mergedPRs.length,
      totalPRsClosed: closedPRs.length,
      totalReviews,
      averagePRCycleTime: Math.round(averagePRCycleTime * 10) / 10,
      averageReviewResponseTime: Math.round(averageReviewResponseTime * 10) / 10,
      openPRs: openPRs.length,
      mergeRate: Math.round(mergeRate * 10) / 10,
      activeContributors: contributors.size,
    };
  }

  calculateRepositoryMetrics(
    repoName: string,
    commits: Commit[],
    prs: PullRequest[]
  ): RepositoryMetrics {
    const repoCommits = commits.filter(c => c.repo === repoName);
    const repoPRs = prs.filter(pr => pr.repo === repoName);
    const mergedPRs = repoPRs.filter(pr => pr.state === 'merged');

    const contributors = new Set([
      ...repoCommits.map(c => c.author),
      ...repoPRs.map(pr => pr.author),
    ]);

    const avgPRSize = mergedPRs.length > 0
      ? repoCommits.length / mergedPRs.length
      : 0;

    return {
      name: repoName,
      commits: repoCommits.length,
      prsOpened: repoPRs.length,
      prsMerged: mergedPRs.length,
      contributors: contributors.size,
      averagePRSize: Math.round(avgPRSize * 10) / 10,
    };
  }

  generateKPIReport(
    commits: Commit[],
    prs: PullRequest[],
    teamMembers: string[],
    repositories: string[],
    trackingDays: number
  ): KPIReport {
    const developerMetrics = teamMembers.map(member =>
      this.calculateDeveloperMetrics(member, commits, prs)
    );

    const teamMetrics = this.calculateTeamMetrics(prs, commits);

    const repositoryMetrics = repositories.map(repo =>
      this.calculateRepositoryMetrics(repo, commits, prs)
    );

    // Find top performers
    const mostCommits = developerMetrics.reduce((prev, current) =>
      current.commits > prev.commits ? current : prev
    );

    const mostPRs = developerMetrics.reduce((prev, current) =>
      current.prsOpened > prev.prsOpened ? current : prev
    );

    const mostReviews = developerMetrics.reduce((prev, current) =>
      current.reviewsGiven > prev.reviewsGiven ? current : prev
    );

    const fastestReviewer = developerMetrics
      .filter(m => m.averageReviewTime > 0)
      .reduce((prev, current) =>
        current.averageReviewTime < prev.averageReviewTime ? current : prev,
        developerMetrics[0]
      );

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - trackingDays);

    return {
      period: {
        start,
        end,
        days: trackingDays,
      },
      teamMetrics,
      developerMetrics,
      topPerformers: {
        mostCommits,
        mostPRs,
        mostReviews,
        fastestReviewer,
      },
      repositories: repositoryMetrics,
    };
  }
}
