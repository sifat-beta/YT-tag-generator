import { STOP, tokens, bigrams, normalize } from './text'

async function getSuggest(q: string, hl='en', gl='US') {
  const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}`, { cache: 'no-store' });
  const data = await res.json() as { suggestions: string[] };
  return data.suggestions ?? [];
}

async function getVideoCandidates(q: string, hl='en', gl='US') {
  const res = await fetch(`/api/videos?q=${encodeURIComponent(q)}&hl=${hl}&gl=${gl}`, { cache: 'no-store' });
  const data = await res.json() as { candidates?: { term:string, score:number }[] };
  return data.candidates ?? [];
}

export async function generateTags({ title, count = 18, hl='en', gl='US' }:{title:string,count?:number,hl?:string,gl?:string}) {
  const baseTokens = tokens(title).filter(t => !STOP.has(t));
  const topBigrams = bigrams(baseTokens).slice(0, 4);

  const [suggMain, suggBi, mined] = await Promise.all([
    getSuggest(title, hl, gl),
    Promise.all(topBigrams.map(b => getSuggest(b, hl, gl))).then(arr => arr.flat()),
    getVideoCandidates(title, hl, gl)
  ]);

  const scores = new Map<string, number>();
  const bump = (t:string, s:number) => {
    const x = normalize(t);
    if (!x || x.split(' ').length>3) return;
    scores.set(x, (scores.get(x)||0) + s);
  };

  baseTokens.forEach(t => bump(t, 0.3)); // downweight title words
  suggMain.forEach(s => bump(s, 3.0));
  suggBi.forEach(s => bump(s, 2.2));
  mined.forEach(({term, score}) => bump(term, score));

  const ranked = Array.from(scores.entries())
    .filter(([t]) => t.length>=2 && t !== normalize(title))
    .sort((a,b)=> b[1]-a[1])
    .map(([t])=>t);

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const t of ranked) {
    if (unique.length>=count) break;
    if (!seen.has(t)) { seen.add(t); unique.push(t); }
  }
  return unique;
}
