import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = "HarshSharma20050924";
  const GITHUB_REPO = "Deal-Flow";
  const WORKFLOW_ID = "worker.yml";

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GITHUB_TOKEN not configured in environment' });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          ref: 'main', // or the default branch
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to trigger GitHub workflow', 
        details: errorData 
      });
    }

    return res.status(200).json({ 
      message: 'Workflow triggered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error triggering workflow:', error);
    return res.status(500).json({ error: error.message });
  }
}
