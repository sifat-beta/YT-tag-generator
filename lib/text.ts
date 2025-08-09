export const STOP = new Set([
  'the','a','an','and','or','but','with','without','of','for','to','in','on','at','by','from','as','is','are','be','how','what','why','when','where','your','my','our','you','we','i','it','this','that','these','those','vs','&','-','—','–','sometimes','included'
]);
export function tokens(s: string){ return s.toLowerCase().replace(/[\p{P}\p{S}]+/gu,' ').split(/\s+/).filter(Boolean); }
export function bigrams(words: string[]){ const out:string[]=[]; for(let i=0;i<words.length-1;i++) out.push(`${words[i]} ${words[i+1]}`); return out; }
export function normalize(t:string){ return t.toLowerCase().trim().replace(/\s+/g,' '); }
