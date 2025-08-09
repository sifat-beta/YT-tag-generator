import { NextResponse } from 'next/server'

function norm(t: string) {
  return t.toLowerCase().trim().replace(/\s+/g, ' ');
}
const STOP = new Set([
  'the','a','an','and','or','but','with','without','of','for','to','in','on','at','by','from','as','is','are','be',
  'how','what','why','when','where','your','my','our','you','we','i','it','this','that','these','those','vs','&','-','—','–',
  'sometimes','included','official','video','new'
]);

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const hl = searchParams.get('hl') || 'en';
  const gl = searchParams.get('gl') || 'US';

  if (!process.env.YT_API_KEY || !q) {
    return NextResponse.json({ candidates: [] }, { status: 200 });
  }

  try {
    const publishedAfter = new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString();
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('q', q);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('order', 'relevance');
    searchUrl.searchParams.set('maxResults', '25');
    searchUrl.searchParams.set('relevanceLanguage', hl);
    searchUrl.searchParams.set('publishedAfter', publishedAfter);
    searchUrl.searchParams.set('key', process.env.YT_API_KEY!);
    if (gl) searchUrl.searchParams.set('regionCode', gl);

    const sres = await fetch(searchUrl.toString());
    if (!sres.ok) return NextResponse.json({ candidates: [] });
    const sjson = await sres.json() as any;
    const ids: string[] = (sjson.items || []).map((it: any) => it.id?.videoId).filter(Boolean);
    if (!ids.length) return NextResponse.json({ candidates: [] });

    const vidsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    vidsUrl.searchParams.set('part', 'snippet,statistics');
    vidsUrl.searchParams.set('id', ids.slice(0, 25).join(','));
    vidsUrl.searchParams.set('key', process.env.YT_API_KEY!);

    const vres = await fetch(vidsUrl.toString());
    if (!vres.ok) return NextResponse.json({ candidates: [] });
    const vjson = await vres.json() as any;

    const bucket = new Map<string, number>();
    const bump = (t: string, s: number) => {
      const x = norm(t);
      const wc = x.split(' ').length;
      if (!x || wc > 3) return;
      bucket.set(x, (bucket.get(x) || 0) + s);
    };
    const addWeighted = (term: string, views: number, base: number) => {
      const weight = base * Math.log10((views || 1) + 9);
      bump(term, weight);
    };

    for (const it of vjson.items || []) {
      const sn = it.snippet;
      const st = it.statistics || {};
      const views = Number(st.viewCount || 0);

      (sn?.tags ?? []).forEach((t: string) => addWeighted(t, views, 3.0));

      const text = `${sn?.title || ''} ${(sn?.description || '')}`
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]+/gu, ' ');
      const words = text.split(/\s+/).filter(Boolean).filter((w: string) => !STOP.has(w));

      words.forEach((w: string) => addWeighted(w, views, 0.9));
      for (let i = 0; i < words.length - 1; i++) {
        addWeighted(`${words[i]} ${words[i + 1]}`, views, 1.4);
      }
      for (let i = 0; i < words.length - 2; i++) {
        addWeighted(`${words[i]} ${words[i + 1]} ${words[i + 2]}`, views, 1.6);
      }
    }

    const candidates = Array.from(bucket.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 120)
      .map(([term, score]) => ({ term, score }));

    return NextResponse.json({ candidates });
  } catch {
    return NextResponse.json({ candidates: [] }, { status: 200 });
  }
}
