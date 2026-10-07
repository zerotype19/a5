import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildPageOutline } from '../src/lib/authority/outline.ts';
test('article navigation skips empty blocks and retains rendered section IDs', () => {
 const page = { sections: [{type:'INTRO' as const,body:'Intro'}, {type:'RICH_TEXT' as const,heading:'Same heading',paragraphs:['First']}, {type:'SOURCE_LIST' as const}, {type:'RICH_TEXT' as const,heading:'Same heading',paragraphs:['Second']}, {type:'RELATED_CONTENT' as const}], sources: [], related_content: [] };
 assert.deepEqual(buildPageOutline(page), [{id:'section-2',label:'Same heading'}, {id:'section-4',label:'Same heading'}]);
});
