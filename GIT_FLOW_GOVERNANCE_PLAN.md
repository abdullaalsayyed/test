# Git Flow & Governance Plan for Development Team

**Team Size:** 10 Developers
**Tech Stack:** Laravel (Legacy) + Angular (Modern)
**Date:** 2025-11-08

---

## 1. Git Flow Strategy

### Branching Model

We'll use a **modified Git Flow** that balances structure with flexibility:

```
main (production)
├── develop (integration)
│   ├── feature/* (new features)
│   ├── bugfix/* (bug fixes)
│   └── hotfix/* (emergency production fixes)
└── release/* (release candidates)
```

#### Branch Purposes

- **`main`**: Production-ready code, always deployable
- **`develop`**: Integration branch for next release
- **`feature/*`**: New features (e.g., `feature/user-authentication`)
- **`bugfix/*`**: Non-critical bug fixes (e.g., `bugfix/login-validation`)
- **`hotfix/*`**: Critical production fixes (e.g., `hotfix/security-patch`)
- **`release/*`**: Release preparation (e.g., `release/v1.2.0`)

#### Branch Naming Convention

```
feature/TICKET-ID-short-description
bugfix/TICKET-ID-short-description
hotfix/TICKET-ID-short-description
release/vX.Y.Z
```

Example: `feature/JIRA-123-add-user-dashboard`

---

## 2. Project-Specific Strategies

### Laravel Projects (Legacy)

**Challenges:**
- Existing technical debt
- Older codebase with issues
- May lack comprehensive tests
- Potential for breaking changes

**Strategy:**
```
Incremental Improvement + Pragmatic Quality Gates
```

**Approach:**
1. **Gradual Linting**: Don't enforce strict linting on entire codebase
   - Only lint **changed files** in PRs
   - Use progressive enhancement (warnings → errors over time)
2. **Test Coverage**: Require tests for **new code only**
   - Existing code: optional but encouraged
   - New features: mandatory test coverage
3. **Code Review Focus**:
   - Security vulnerabilities (critical)
   - Business logic correctness
   - Don't block PRs for legacy code style issues
4. **Technical Debt Tracking**: Tag and track tech debt for future sprints

### Angular Projects (Modern)

**Advantages:**
- Clean slate
- Modern tooling
- Opportunity to set high standards

**Strategy:**
```
Strict Quality Gates + Modern Best Practices
```

**Approach:**
1. **Strict Linting**: Enforce ESLint + Prettier
   - Zero tolerance for linting errors
   - Automatic formatting on commit
2. **Test Coverage**: Minimum 80% coverage
   - Unit tests required for all components/services
   - Integration tests for critical flows
3. **Type Safety**: Strict TypeScript configuration
   - No `any` types allowed
   - Strict null checks enabled
4. **Code Review Focus**:
   - Architecture patterns
   - Performance optimization
   - Accessibility (a11y)
   - Security best practices

---

## 3. GitHub Automation Strategy

### A. Pull Request Workflow

```yaml
PR Opened
  ↓
├─ Auto-assign reviewers (based on CODEOWNERS)
├─ Auto-label (based on files changed)
├─ Run CI/CD pipeline
│  ├─ Linting
│  ├─ Unit tests
│  ├─ Integration tests
│  ├─ Security scanning
│  └─ Build verification
├─ Check PR template compliance
└─ Size validation (flag large PRs)
```

### B. Required GitHub Actions

#### For Laravel Projects

1. **`laravel-ci.yml`**: Continuous Integration
   - PHP version matrix (8.1, 8.2, 8.3)
   - Composer dependency installation
   - PHPUnit tests
   - Laravel Pint (code style)
   - PHPStan (static analysis - warnings only)
   - Security audit (Composer audit)

2. **`laravel-lint-changed.yml`**: Incremental Linting
   - Only check files modified in PR
   - Report issues as PR comments
   - Don't block merge on legacy code issues

3. **`laravel-deploy.yml`**: Deployment
   - Triggered on merge to `main`
   - Run migrations
   - Clear caches
   - Deploy to staging/production

#### For Angular Projects

1. **`angular-ci.yml`**: Continuous Integration
   - Node version matrix (18.x, 20.x)
   - npm/yarn install
   - ESLint + Prettier check
   - Karma/Jest unit tests
   - e2e tests (Cypress/Playwright)
   - Build production bundle
   - Bundle size check

2. **`angular-quality.yml`**: Quality Checks
   - TypeScript strict mode validation
   - Test coverage report (fail if < 80%)
   - Lighthouse CI (performance)
   - Accessibility audit

3. **`angular-deploy.yml`**: Deployment
   - Build optimized production bundle
   - Deploy to CDN/hosting
   - Invalidate cache

#### Cross-Project Actions

1. **`security-scan.yml`**: Security
   - Dependency vulnerability scanning (npm audit, composer audit)
   - SAST (Static Application Security Testing)
   - Secret scanning
   - License compliance check

2. **`pr-validation.yml`**: PR Governance
   - PR title convention check
   - PR description completeness
   - Branch naming validation
   - Commit message linting (conventional commits)

3. **`auto-label.yml`**: Automation
   - Auto-label based on changed files
   - Auto-assign reviewers
   - Auto-add to project board

---

## 4. Branch Protection Rules

### `main` Branch

**Required:**
- ✅ Require pull request before merging
- ✅ Require 2 approvals (at least 1 from tech lead)
- ✅ Dismiss stale reviews when new commits pushed
- ✅ Require status checks to pass:
  - All CI tests
  - Security scan
  - Build verification
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ✅ Require signed commits (optional but recommended)
- ✅ Include administrators (lead by example)
- ❌ Allow force pushes: NO
- ❌ Allow deletions: NO

### `develop` Branch

**Required:**
- ✅ Require pull request before merging
- ✅ Require 1 approval (any team member)
- ✅ Require status checks to pass:
  - All CI tests
  - Linting
- ✅ Require conversation resolution
- ❌ Allow force pushes: NO
- ❌ Allow deletions: NO

### `feature/*`, `bugfix/*`, `hotfix/*` Branches

**Required:**
- ✅ Allow force pushes (for rebasing/cleanup)
- ✅ Auto-delete after merge
- No strict protection (developer freedom)

---

## 5. Code Review Process

### Review Guidelines

#### Mandatory Review Checklist

**Functionality:**
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate

**Quality:**
- [ ] Code is readable and maintainable
- [ ] No obvious bugs or logic errors
- [ ] Follows project conventions

**Security:**
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Sensitive data is protected
- [ ] Input validation is present

**Testing:**
- [ ] Tests cover new functionality
- [ ] Tests are meaningful (not just for coverage)
- [ ] All tests pass

**Documentation:**
- [ ] Complex logic is commented
- [ ] Public APIs are documented
- [ ] README updated if needed

### Review Assignment Strategy

**Option 1: Round-robin**
- Distribute reviews evenly among team
- Automated via GitHub Actions

**Option 2: CODEOWNERS**
- Assign based on expertise
- Example:
  ```
  # Laravel Backend
  /app/Http/Controllers/  @senior-laravel-dev @tech-lead
  /database/              @database-specialist @tech-lead

  # Angular Frontend
  /src/app/components/    @senior-angular-dev @tech-lead
  /src/app/services/      @senior-angular-dev @tech-lead
  ```

**Option 3: Hybrid**
- Auto-assign by CODEOWNERS + 1 round-robin reviewer
- Ensures knowledge sharing

### Review SLA (Service Level Agreement)

- **First response**: Within 4 business hours
- **Complete review**: Within 24 business hours
- **Urgent/hotfix**: Within 2 hours

---

## 6. Pull Request Templates

### Standard PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Ticket
JIRA-XXX or #issue-number

## Changes Made
- Change 1
- Change 2

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Tested on multiple browsers (if frontend)

## Screenshots (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Hotfix PR Template

```markdown
## HOTFIX - URGENT

## Issue
Critical bug description

## Root Cause

## Solution

## Testing
- [ ] Tested in production-like environment
- [ ] Verified fix resolves the issue
- [ ] No side effects identified

## Rollback Plan

## Post-Deployment Verification Steps
```

---

## 7. Commit Message Convention

Use **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Adding/updating tests
- `chore`: Build process, dependencies
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```
feat(auth): add two-factor authentication

Implement 2FA using TOTP algorithm. Users can now enable
2FA in their account settings.

Closes JIRA-456
```

```
fix(api): prevent SQL injection in user search

Added prepared statements to user search endpoint.

BREAKING CHANGE: Search API now requires exact parameter names
```

---

## 8. Quality Gates & Metrics

### Automated Quality Gates

**Laravel Projects:**
```yaml
Gates:
  - PHPUnit tests pass: REQUIRED
  - Laravel Pint (style): WARNING (report only)
  - PHPStan level 5: WARNING (report only)
  - Security audit: REQUIRED (block on high/critical)
  - New code coverage: RECOMMENDED (>70%)
```

**Angular Projects:**
```yaml
Gates:
  - ESLint: REQUIRED (0 errors)
  - Prettier: REQUIRED (auto-format)
  - Unit tests: REQUIRED (pass)
  - Coverage: REQUIRED (>80% for new code)
  - TypeScript strict: REQUIRED
  - Build success: REQUIRED
  - Bundle size: WARNING (if >10% increase)
```

### Metrics to Track

**Team Metrics:**
- Pull request cycle time (time from open → merge)
- Code review response time
- Deployment frequency
- Mean time to recovery (MTTR)
- Change failure rate

**Code Quality Metrics:**
- Test coverage trend
- Bug escape rate (bugs found in production)
- Technical debt ratio
- Code churn (files changed repeatedly)

---

## 9. Governance & Policies

### 1. Merge Requirements

**Feature/Bugfix → Develop:**
- 1 peer approval
- All automated checks pass
- Conflicts resolved

**Develop → Release:**
- Tech lead approval
- All tests pass
- QA sign-off

**Release → Main:**
- 2 approvals (including tech lead)
- All checks pass
- Release notes prepared
- Deployment plan documented

**Hotfix → Main:**
- Tech lead approval (can be async)
- Critical checks pass
- Post-deployment verification plan

### 2. Deployment Windows

**Development Environment:**
- Continuous deployment from `develop`
- Automatic on merge

**Staging Environment:**
- Daily deployments from `develop` (2 PM)
- On-demand for testing

**Production Environment:**
- Scheduled: Tuesday/Thursday (after daily standup)
- Hotfixes: Anytime with approval

### 3. Rollback Policy

**Criteria for Rollback:**
- Critical bugs affecting >10% of users
- Security vulnerabilities
- Data integrity issues
- Performance degradation >50%

**Rollback Process:**
1. Tech lead authorization
2. Execute rollback script/revert commit
3. Post incident review within 24h
4. Document lessons learned

### 4. Access Control

**Repository Permissions:**
- **Admin**: Tech Lead
- **Maintain**: Senior Developers (2-3)
- **Write**: All developers
- **Read**: QA, Stakeholders

**Protected Branch Bypass:**
- Only tech lead (use sparingly, log all occurrences)

---

## 10. Developer Workflow

### Daily Workflow

```bash
# 1. Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/JIRA-123-description

# 2. Work on feature (commit often)
git add .
git commit -m "feat(module): add feature X"

# 3. Keep updated with develop
git fetch origin develop
git rebase origin/develop

# 4. Push and create PR
git push -u origin feature/JIRA-123-description
# Create PR via GitHub UI

# 5. Address review feedback
# Make changes...
git add .
git commit -m "fix: address review comments"
git push

# 6. After approval and merge
git checkout develop
git pull origin develop
git branch -d feature/JIRA-123-description
```

### Release Workflow

```bash
# 1. Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Update version numbers, changelogs
# Make final adjustments

# 3. Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# 4. Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# 5. Delete release branch
git branch -d release/v1.2.0
```

### Hotfix Workflow

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 2. Fix the issue
# Make changes...
git commit -m "fix: resolve critical production bug"

# 3. Merge to main
git checkout main
git merge --no-ff hotfix/critical-bug-fix
git tag -a v1.2.1 -m "Hotfix version 1.2.1"
git push origin main --tags

# 4. Merge to develop
git checkout develop
git merge --no-ff hotfix/critical-bug-fix
git push origin develop

# 5. Delete hotfix branch
git branch -d hotfix/critical-bug-fix
```

---

## 11. Tooling & Integrations

### Recommended Tools

**Code Quality:**
- **Laravel**: Laravel Pint, PHPStan, Larastan, PHP_CodeSniffer
- **Angular**: ESLint, Prettier, TSLint (deprecated), SonarQube
- **Both**: SonarQube/SonarCloud for comprehensive analysis

**Testing:**
- **Laravel**: PHPUnit, Pest, Laravel Dusk (browser tests)
- **Angular**: Jasmine/Jest, Karma, Cypress/Playwright

**Security:**
- **Laravel**: Composer audit, Snyk, RIPS
- **Angular**: npm audit, Snyk, OWASP Dependency-Check
- **Both**: GitHub Dependabot, GitGuardian (secret scanning)

**CI/CD:**
- **Primary**: GitHub Actions (integrated)
- **Alternatives**: Jenkins, GitLab CI, CircleCI

**Project Management Integration:**
- Link commits/PRs to JIRA/Linear/GitHub Issues
- Automated status updates
- Release notes generation

**Monitoring:**
- **Performance**: New Relic, Datadog, Sentry
- **Errors**: Sentry, Rollbar, Bugsnag
- **Logs**: ELK Stack, Splunk, CloudWatch

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goals:** Establish basic structure and governance

- [ ] Set up branch protection rules
- [ ] Create PR templates
- [ ] Define commit message conventions
- [ ] Document git flow process
- [ ] Train team on new workflow

### Phase 2: Laravel Automation (Week 3-4)

**Goals:** Implement CI/CD for Laravel projects

- [ ] Create GitHub Actions for CI
- [ ] Set up incremental linting workflow
- [ ] Configure PHPUnit in CI
- [ ] Add security scanning
- [ ] Set up deployment pipeline

### Phase 3: Angular Automation (Week 5-6)

**Goals:** Implement strict quality gates for Angular

- [ ] Create GitHub Actions for CI
- [ ] Configure ESLint + Prettier
- [ ] Set up test coverage enforcement
- [ ] Add bundle size monitoring
- [ ] Set up deployment pipeline

### Phase 4: Advanced Governance (Week 7-8)

**Goals:** Fine-tune and optimize

- [ ] Implement CODEOWNERS
- [ ] Set up automated PR assignment
- [ ] Configure auto-labeling
- [ ] Add commit message linting
- [ ] Set up metrics dashboard

### Phase 5: Monitoring & Iteration (Week 9+)

**Goals:** Monitor and improve

- [ ] Review metrics weekly
- [ ] Gather team feedback
- [ ] Adjust policies as needed
- [ ] Document lessons learned
- [ ] Plan technical debt sprints

---

## 13. Team Onboarding & Documentation

### Onboarding Checklist for New Developers

- [ ] Read git flow documentation
- [ ] Set up local development environment
- [ ] Configure Git with commit template
- [ ] Install required linters/formatters
- [ ] Understand branch naming conventions
- [ ] Practice creating a PR with checklist
- [ ] Shadow a code review
- [ ] Complete first small PR

### Documentation to Create

1. **`CONTRIBUTING.md`**: How to contribute to the project
2. **`GIT_WORKFLOW.md`**: Detailed git flow guide
3. **`CODE_REVIEW_GUIDE.md`**: Review standards and checklist
4. **`DEPLOYMENT.md`**: Deployment procedures
5. **`TROUBLESHOOTING.md`**: Common issues and solutions

---

## 14. Risk Mitigation

### Potential Challenges & Solutions

**Challenge 1: Resistance to change**
- **Solution**: Gradual rollout, gather feedback, demonstrate value
- **Mitigation**: Start with less strict rules, tighten over time

**Challenge 2: Legacy code blocking progress**
- **Solution**: Apply rules only to new/changed code
- **Mitigation**: Create tech debt backlog for incremental improvement

**Challenge 3: Too many approvals slow down delivery**
- **Solution**: Differentiate critical vs non-critical changes
- **Mitigation**: Trust senior developers with expedited reviews

**Challenge 4: CI/CD failures frustrate developers**
- **Solution**: Make failures actionable and clear
- **Mitigation**: Provide quick feedback loops, easy local testing

**Challenge 5: Process becomes bureaucratic**
- **Solution**: Regular retrospectives to simplify
- **Mitigation**: Automate everything possible, minimize manual steps

---

## 15. Success Criteria

### After 3 Months, Success Looks Like:

**Quantitative:**
- 95% of PRs follow template
- <24h average PR review time
- 80% test coverage on Angular projects
- 50% reduction in production bugs
- Zero security vulnerabilities in dependencies

**Qualitative:**
- Team feels confident in code quality
- Fewer production incidents
- Smoother deployments
- Better code review discussions
- Reduced time spent on code style debates

---

## Next Steps

1. **Review this plan** with the team and gather feedback
2. **Prioritize** which elements are most critical for your context
3. **Customize** the specifics (coverage thresholds, approval numbers, etc.)
4. **Start implementation** following the roadmap
5. **Iterate** based on what works and what doesn't

---

## Questions to Consider

Before implementing, discuss with your team:

1. What's the right balance between quality and velocity for us?
2. Should we have different rules for different project criticality?
3. How do we handle exceptions to the process?
4. What's our risk tolerance for the legacy Laravel projects?
5. How do we measure if this is working?

---

**Document Owner:** Tech Lead
**Last Updated:** 2025-11-08
**Next Review:** After Phase 1 completion
