// v15.9: the shared character rules. stats_rules.js is generated from /workspace/shared-rules/stats.json
// (node scripts/gen-stats-js.mjs) and is byte-for-byte the file the town games load. It is a classic script that
// sets a global, so it is run here from its source text (a bare side-effect import gets dropped/reordered in the build).
import src from "./stats_rules.js?raw";
const g: any = globalThis as any;
if (!g.STATS_RULES) new Function(src)();
export const RULES: any = g.STATS_RULES;
