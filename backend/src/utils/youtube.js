/**
 * Lesson videos are not uploaded — the teacher pastes a YouTube link.
 * We accept every shape YouTube hands out (watch, youtu.be, /embed,
 * /shorts, /live, with or without extra query params) and normalise it
 * down to a canonical watch URL + the bare 11-character video id.
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

function httpError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * @returns {{ videoId: string, videoUrl: string, embedUrl: string } | null}
 */
function parseYouTubeUrl(input) {
  if (typeof input !== 'string') return null;

  const raw = input.trim();
  if (!raw) return null;

  // Bare id pasted on its own
  if (VIDEO_ID.test(raw)) return build(raw);

  let url;
  try {
    url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');
  const segments = url.pathname.split('/').filter(Boolean);

  let id = null;

  if (host === 'youtu.be') {
    id = segments[0] || null;
  } else if (
    host === 'youtube.com' ||
    host === 'youtube-nocookie.com' ||
    host === 'music.youtube.com'
  ) {
    if (segments[0] === 'watch') {
      id = url.searchParams.get('v');
    } else if (['embed', 'shorts', 'live', 'v'].includes(segments[0])) {
      id = segments[1] || null;
    } else if (!segments.length) {
      id = url.searchParams.get('v');
    }
  }

  if (!id || !VIDEO_ID.test(id)) return null;
  return build(id);
}

function build(videoId) {
  return {
    videoId,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
  };
}

/**
 * Same as parseYouTubeUrl but throws a 400 instead of returning null.
 * Use in controllers so a bad paste gives the teacher a clear message.
 */
function requireYouTubeUrl(input) {
  const parsed = parseYouTubeUrl(input);
  if (!parsed) {
    throw httpError(
      'Please paste a valid YouTube link (e.g. https://www.youtube.com/watch?v=...).',
      400
    );
  }
  return parsed;
}

module.exports = { parseYouTubeUrl, requireYouTubeUrl };
