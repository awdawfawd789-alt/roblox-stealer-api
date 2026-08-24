// Redirect endpoint: Discord won't render roblox:// as a clickable link,
// but it WILL render https:// links. This endpoint takes placeId + jobId
// and issues a 302 redirect to the roblox:// deep link protocol,
// which the OS/browser hands off to the Roblox client launcher.
export default function handler(req, res) {
  const { placeId, jobId } = req.query;

  if (!placeId || !jobId) {
    return res.status(400).send('Missing placeId or jobId');
  }

  const robloxDeepLink = `roblox://experiences/start?placeId=${placeId}&gameInstanceId=${jobId}`;
  res.redirect(302, robloxDeepLink);
}
