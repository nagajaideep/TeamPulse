// Enhanced GitHub Integration Features

// 1. Repository Statistics Display
const GitHubStats = ({ githubRepo }) => {
  const [repoStats, setRepoStats] = useState(null);
  
  useEffect(() => {
    fetchGitHubStats();
  }, [githubRepo]);

  const fetchGitHubStats = async () => {
    try {
      // Using GitHub API (requires API token for private repos)
      const response = await fetch(`https://api.github.com/repos/${githubRepo}`);
      const data = await response.json();
      
      setRepoStats({
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        lastCommit: data.pushed_at,
        language: data.language
      });
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium mb-2">Repository Status</h4>
      {repoStats && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>⭐ {repoStats.stars} stars</div>
          <div>🍴 {repoStats.forks} forks</div>
          <div>🐛 {repoStats.openIssues} issues</div>
          <div>💻 {repoStats.language}</div>
        </div>
      )}
    </div>
  );
};

// 2. Commit Activity Timeline
const CommitActivity = ({ githubRepo }) => {
  const [commits, setCommits] = useState([]);
  
  const fetchCommits = async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${githubRepo}/commits?per_page=5`);
      const data = await response.json();
      setCommits(data);
    } catch (error) {
      console.error('Error fetching commits:', error);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Recent Commits</h4>
      {commits.map(commit => (
        <div key={commit.sha} className="border-l-2 border-green-500 pl-3 py-1">
          <p className="text-sm font-medium">{commit.commit.message}</p>
          <p className="text-xs text-gray-500">
            by {commit.commit.author.name} • {new Date(commit.commit.author.date).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

// 3. GitHub Issues Integration
const GitHubIssues = ({ githubRepo }) => {
  const [issues, setIssues] = useState([]);
  
  const createIssueFromTeamPulse = async (teamPulseIssue) => {
    try {
      // Create GitHub issue from TeamPulse issue
      const response = await fetch(`https://api.github.com/repos/${githubRepo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: teamPulseIssue.title,
          body: teamPulseIssue.description,
          labels: [teamPulseIssue.severity]
        })
      });
      
      const githubIssue = await response.json();
      
      // Update TeamPulse issue with GitHub issue URL
      await updateTeamPulseIssue(teamPulseIssue._id, {
        githubIssueUrl: githubIssue.html_url,
        githubIssueNumber: githubIssue.number
      });
      
    } catch (error) {
      console.error('Error creating GitHub issue:', error);
    }
  };

  return (
    <div>
      <button 
        onClick={() => createIssueFromTeamPulse(currentIssue)}
        className="px-3 py-1 bg-gray-900 text-white rounded text-sm"
      >
        Create GitHub Issue
      </button>
    </div>
  );
};
