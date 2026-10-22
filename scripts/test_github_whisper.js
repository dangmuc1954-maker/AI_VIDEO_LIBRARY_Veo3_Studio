async function testGithub() {
  try {
    const res = await fetch('https://api.github.com/repos/ggerganov/whisper.cpp/releases/latest', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log('GitHub API status:', res.status);
    const data = await res.json();
    console.log('Latest tag:', data.tag_name);
    const assets = (data.assets || []).map(a => ({ name: a.name, url: a.browser_download_url, size: a.size }));
    console.log('Assets:', assets.filter(a => a.name.includes('bin-x64') || a.name.includes('win')));
  } catch (e) {
    console.error('Error fetching github:', e.message);
  }
}
testGithub();
