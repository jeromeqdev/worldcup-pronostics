import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nzhuixcithdgmvqwrszh.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

async function run() {
  const { data: groups } = await supabase.from('groups').select('id, name');
  const { data: teams } = await supabase.from('teams').select('id, country_code');
  const { data: stadiums } = await supabase.from('stadiums').select('id, name');

  const g = Object.fromEntries(groups.map(x => [x.name, x.id]));
  const t = Object.fromEntries(teams.map(x => [x.country_code, x.id]));
  const s = Object.fromEntries(stadiums.map(x => [x.name, x.id]));

  const matches = [
    // GROUPE A
    {match_number:1,phase:'group',group_id:g['A'],home_team_id:t['mx'],away_team_id:t['za'],stadium_id:s['Stade de Mexico'],kickoff_time:'2026-06-11T21:00:00Z',status:'finished',home_score:2,away_score:0},
    {match_number:2,phase:'group',group_id:g['A'],home_team_id:t['kr'],away_team_id:t['cz'],stadium_id:s['Stade de Guadalajara'],kickoff_time:'2026-06-12T18:00:00Z',status:'finished',home_score:2,away_score:1},
    {match_number:22,phase:'group',group_id:g['A'],home_team_id:t['cz'],away_team_id:t['za'],stadium_id:s['Stade Atlanta'],kickoff_time:'2026-06-19T12:00:00Z',status:'upcoming'},
    {match_number:23,phase:'group',group_id:g['A'],home_team_id:t['mx'],away_team_id:t['kr'],stadium_id:s['Stade de Guadalajara'],kickoff_time:'2026-06-20T21:00:00Z',status:'upcoming'},
    {match_number:44,phase:'group',group_id:g['A'],home_team_id:t['cz'],away_team_id:t['mx'],stadium_id:s['Stade de Guadalajara'],kickoff_time:'2026-06-24T21:00:00Z',status:'upcoming'},
    {match_number:45,phase:'group',group_id:g['A'],home_team_id:t['za'],away_team_id:t['kr'],stadium_id:s['Stade de Guadalajara'],kickoff_time:'2026-06-24T21:00:00Z',status:'upcoming'},
    // GROUPE B
    {match_number:3,phase:'group',group_id:g['B'],home_team_id:t['ca'],away_team_id:t['ba'],stadium_id:s['Stade de Toronto'],kickoff_time:'2026-06-12T21:00:00Z',status:'finished',home_score:1,away_score:1},
    {match_number:4,phase:'group',group_id:g['B'],home_team_id:t['qa'],away_team_id:t['ch'],stadium_id:s['Stade de San Francisco'],kickoff_time:'2026-06-13T15:00:00Z',status:'finished',home_score:1,away_score:1},
    {match_number:24,phase:'group',group_id:g['B'],home_team_id:t['ch'],away_team_id:t['ba'],stadium_id:s['Stade de Los Angeles'],kickoff_time:'2026-06-19T15:00:00Z',status:'upcoming'},
    {match_number:25,phase:'group',group_id:g['B'],home_team_id:t['ca'],away_team_id:t['qa'],stadium_id:s['BC Place'],kickoff_time:'2026-06-19T18:00:00Z',status:'upcoming'},
    {match_number:46,phase:'group',group_id:g['B'],home_team_id:t['ch'],away_team_id:t['ca'],stadium_id:s['Stade de Toronto'],kickoff_time:'2026-06-25T21:00:00Z',status:'upcoming'},
    {match_number:47,phase:'group',group_id:g['B'],home_team_id:t['ba'],away_team_id:t['qa'],stadium_id:s['Stade de San Francisco'],kickoff_time:'2026-06-25T21:00:00Z',status:'upcoming'},
    // GROUPE C
    {match_number:5,phase:'group',group_id:g['C'],home_team_id:t['br'],away_team_id:t['ma'],stadium_id:s['Stade de New York'],kickoff_time:'2026-06-13T18:00:00Z',status:'upcoming'},
    {match_number:6,phase:'group',group_id:g['C'],home_team_id:t['ht'],away_team_id:t['gb-sct'],stadium_id:s['Stade de Boston'],kickoff_time:'2026-06-13T21:00:00Z',status:'upcoming'},
    {match_number:26,phase:'group',group_id:g['C'],home_team_id:t['ma'],away_team_id:t['gb-sct'],stadium_id:s['Stade de Boston'],kickoff_time:'2026-06-20T00:00:00Z',status:'upcoming'},
    {match_number:27,phase:'group',group_id:g['C'],home_team_id:t['br'],away_team_id:t['ht'],stadium_id:s['Stade de San Francisco'],kickoff_time:'2026-06-21T02:30:00Z',status:'upcoming'},
    {match_number:48,phase:'group',group_id:g['C'],home_team_id:t['gb-sct'],away_team_id:t['br'],stadium_id:s['Stade de New York'],kickoff_time:'2026-06-26T00:00:00Z',status:'upcoming'},
    {match_number:49,phase:'group',group_id:g['C'],home_team_id:t['ma'],away_team_id:t['ht'],stadium_id:s['Stade de New York'],kickoff_time:'2026-06-26T00:00:00Z',status:'upcoming'},
    // GROUPE D
    {match_number:7,phase:'group',group_id:g['D'],home_team_id:t['us'],away_team_id:t['py'],stadium_id:s['Stade de Los Angeles'],kickoff_time:'2026-06-13T21:00:00Z',status:'finished',home_score:4,away_score:1},
    {match_number:8,phase:'group',group_id:g['D'],home_team_id:t['au'],away_team_id:t['tr'],stadium_id:s['BC Place'],kickoff_time:'2026-06-14T00:00:00Z',status:'upcoming'},
    {match_number:28,phase:'group',group_id:g['D'],home_team_id:t['tr'],away_team_id:t['py'],stadium_id:s['Stade de Houston'],kickoff_time:'2026-06-21T05:00:00Z',status:'upcoming'},
    {match_number:29,phase:'group',group_id:g['D'],home_team_id:t['us'],away_team_id:t['au'],stadium_id:s['Stade de Los Angeles'],kickoff_time:'2026-06-22T00:00:00Z',status:'upcoming'},
    {match_number:50,phase:'group',group_id:g['D'],home_team_id:t['tr'],away_team_id:t['us'],stadium_id:s['Stade de Los Angeles'],kickoff_time:'2026-06-26T21:00:00Z',status:'upcoming'},
    {match_number:51,phase:'group',group_id:g['D'],home_team_id:t['py'],away_team_id:t['au'],stadium_id:s['Stade de Seattle'],kickoff_time:'2026-06-26T21:00:00Z',status:'upcoming'},
    // GROUPE E
    {match_number:9,phase:'group',group_id:g['E'],home_team_id:t['de'],away_team_id:t['cw'],stadium_id:s['Stade de Houston'],kickoff_time:'2026-06-14T13:00:00Z',status:'upcoming'},
    {match_number:10,phase:'group',group_id:g['E'],home_team_id:t['ci'],away_team_id:t['ec'],stadium_id:s['Stade de Philadelphie'],kickoff_time:'2026-06-14T19:00:00Z',status:'upcoming'},
    {match_number:30,phase:'group',group_id:g['E'],home_team_id:t['de'],away_team_id:t['ci'],stadium_id:s['Stade de Houston'],kickoff_time:'2026-06-22T22:00:00Z',status:'upcoming'},
    {match_number:31,phase:'group',group_id:g['E'],home_team_id:t['ec'],away_team_id:t['cw'],stadium_id:s['Stade de Philadelphie'],kickoff_time:'2026-06-23T02:00:00Z',status:'upcoming'},
    {match_number:52,phase:'group',group_id:g['E'],home_team_id:t['ec'],away_team_id:t['de'],stadium_id:s['Stade de Dallas'],kickoff_time:'2026-06-27T22:00:00Z',status:'upcoming'},
    {match_number:53,phase:'group',group_id:g['E'],home_team_id:t['cw'],away_team_id:t['ci'],stadium_id:s['Stade de Philadelphie'],kickoff_time:'2026-06-27T22:00:00Z',status:'upcoming'},
    // GROUPE F
    {match_number:11,phase:'group',group_id:g['F'],home_team_id:t['nl'],away_team_id:t['jp'],stadium_id:s['Stade de Dallas'],kickoff_time:'2026-06-14T16:00:00Z',status:'upcoming'},
    {match_number:12,phase:'group',group_id:g['F'],home_team_id:t['se'],away_team_id:t['tn'],stadium_id:s['Stade de Monterrey'],kickoff_time:'2026-06-14T22:00:00Z',status:'upcoming'},
    {match_number:32,phase:'group',group_id:g['F'],home_team_id:t['nl'],away_team_id:t['se'],stadium_id:s['Stade de Dallas'],kickoff_time:'2026-06-23T19:00:00Z',status:'upcoming'},
    {match_number:33,phase:'group',group_id:g['F'],home_team_id:t['jp'],away_team_id:t['tn'],stadium_id:s['Stade de Monterrey'],kickoff_time:'2026-06-23T22:00:00Z',status:'upcoming'},
    {match_number:54,phase:'group',group_id:g['F'],home_team_id:t['tn'],away_team_id:t['nl'],stadium_id:s['Stade de Dallas'],kickoff_time:'2026-06-28T22:00:00Z',status:'upcoming'},
    {match_number:55,phase:'group',group_id:g['F'],home_team_id:t['jp'],away_team_id:t['se'],stadium_id:s['Stade de Monterrey'],kickoff_time:'2026-06-28T22:00:00Z',status:'upcoming'},
    // GROUPE G
    {match_number:13,phase:'group',group_id:g['G'],home_team_id:t['be'],away_team_id:t['eg'],stadium_id:s['Stade de Seattle'],kickoff_time:'2026-06-15T15:00:00Z',status:'upcoming'},
    {match_number:14,phase:'group',group_id:g['G'],home_team_id:t['ir'],away_team_id:t['nz'],stadium_id:s['Stade de Los Angeles'],kickoff_time:'2026-06-15T21:00:00Z',status:'upcoming'},
    {match_number:34,phase:'group',group_id:g['G'],home_team_id:t['be'],away_team_id:t['ir'],stadium_id:s['Stade de Seattle'],kickoff_time:'2026-06-24T21:00:00Z',status:'upcoming'},
    {match_number:35,phase:'group',group_id:g['G'],home_team_id:t['nz'],away_team_id:t['eg'],stadium_id:s['Stade de Los Angeles'],kickoff_time:'2026-06-25T03:00:00Z',status:'upcoming'},
    {match_number:56,phase:'group',group_id:g['G'],home_team_id:t['nz'],away_team_id:t['be'],stadium_id:s['Stade de Los Angeles'],kickoff_time:'2026-06-29T05:00:00Z',status:'upcoming'},
    {match_number:57,phase:'group',group_id:g['G'],home_team_id:t['eg'],away_team_id:t['ir'],stadium_id:s['Stade de Seattle'],kickoff_time:'2026-06-29T05:00:00Z',status:'upcoming'},
    // GROUPE H
    {match_number:15,phase:'group',group_id:g['H'],home_team_id:t['es'],away_team_id:t['cv'],stadium_id:s['Stade Atlanta'],kickoff_time:'2026-06-15T12:00:00Z',status:'upcoming'},
    {match_number:16,phase:'group',group_id:g['H'],home_team_id:t['sa'],away_team_id:t['uy'],stadium_id:s['Stade de Miami'],kickoff_time:'2026-06-15T18:00:00Z',status:'upcoming'},
    {match_number:36,phase:'group',group_id:g['H'],home_team_id:t['es'],away_team_id:t['sa'],stadium_id:s['Stade Atlanta'],kickoff_time:'2026-06-25T18:00:00Z',status:'upcoming'},
    {match_number:37,phase:'group',group_id:g['H'],home_team_id:t['uy'],away_team_id:t['cv'],stadium_id:s['Stade de Miami'],kickoff_time:'2026-06-26T00:00:00Z',status:'upcoming'},
    {match_number:58,phase:'group',group_id:g['H'],home_team_id:t['cv'],away_team_id:t['sa'],stadium_id:s['Stade de Miami'],kickoff_time:'2026-06-30T02:00:00Z',status:'upcoming'},
    {match_number:59,phase:'group',group_id:g['H'],home_team_id:t['uy'],away_team_id:t['es'],stadium_id:s['Stade Atlanta'],kickoff_time:'2026-06-30T02:00:00Z',status:'upcoming'},
    // GROUPE I
    {match_number:17,phase:'group',group_id:g['I'],home_team_id:t['fr'],away_team_id:t['sn'],stadium_id:s['Stade de New York'],kickoff_time:'2026-06-16T19:00:00Z',status:'upcoming'},
    {match_number:18,phase:'group',group_id:g['I'],home_team_id:t['no'],away_team_id:t['iq'],stadium_id:s['Stade de Boston'],kickoff_time:'2026-06-16T22:00:00Z',status:'upcoming'},
    {match_number:38,phase:'group',group_id:g['I'],home_team_id:t['fr'],away_team_id:t['iq'],stadium_id:s['Stade de Philadelphie'],kickoff_time:'2026-06-22T23:00:00Z',status:'upcoming'},
    {match_number:39,phase:'group',group_id:g['I'],home_team_id:t['no'],away_team_id:t['sn'],stadium_id:s['Stade de Boston'],kickoff_time:'2026-06-23T02:00:00Z',status:'upcoming'},
    {match_number:60,phase:'group',group_id:g['I'],home_team_id:t['no'],away_team_id:t['fr'],stadium_id:s['Stade de Boston'],kickoff_time:'2026-06-26T21:00:00Z',status:'upcoming'},
    {match_number:61,phase:'group',group_id:g['I'],home_team_id:t['sn'],away_team_id:t['iq'],stadium_id:s['Stade de New York'],kickoff_time:'2026-06-26T21:00:00Z',status:'upcoming'},
    // GROUPE J
    {match_number:19,phase:'group',group_id:g['J'],home_team_id:t['ar'],away_team_id:t['dz'],stadium_id:s['Stade de Kansas City'],kickoff_time:'2026-06-17T21:00:00Z',status:'upcoming'},
    {match_number:20,phase:'group',group_id:g['J'],home_team_id:t['at'],away_team_id:t['jo'],stadium_id:s['Stade de San Francisco'],kickoff_time:'2026-06-18T23:00:00Z',status:'upcoming'},
    {match_number:40,phase:'group',group_id:g['J'],home_team_id:t['ar'],away_team_id:t['at'],stadium_id:s['Stade de Kansas City'],kickoff_time:'2026-06-23T19:00:00Z',status:'upcoming'},
    {match_number:41,phase:'group',group_id:g['J'],home_team_id:t['jo'],away_team_id:t['dz'],stadium_id:s['Stade de San Francisco'],kickoff_time:'2026-06-24T05:00:00Z',status:'upcoming'},
    {match_number:62,phase:'group',group_id:g['J'],home_team_id:t['dz'],away_team_id:t['at'],stadium_id:s['Stade de Kansas City'],kickoff_time:'2026-06-28T21:00:00Z',status:'upcoming'},
    {match_number:63,phase:'group',group_id:g['J'],home_team_id:t['jo'],away_team_id:t['ar'],stadium_id:s['Stade de San Francisco'],kickoff_time:'2026-06-28T21:00:00Z',status:'upcoming'},
    // GROUPE K
    {match_number:21,phase:'group',group_id:g['K'],home_team_id:t['pt'],away_team_id:t['cd'],stadium_id:s['Stade de Los Angeles'],kickoff_time:'2026-06-18T19:00:00Z',status:'upcoming'},
    {match_number:42,phase:'group',group_id:g['K'],home_team_id:t['uz'],away_team_id:t['co'],stadium_id:s['Stade de Seattle'],kickoff_time:'2026-06-24T04:00:00Z',status:'upcoming'},
    {match_number:43,phase:'group',group_id:g['K'],home_team_id:t['pt'],away_team_id:t['uz'],stadium_id:s['Stade de Los Angeles'],kickoff_time:'2026-06-25T00:00:00Z',status:'upcoming'},
    {match_number:64,phase:'group',group_id:g['K'],home_team_id:t['co'],away_team_id:t['cd'],stadium_id:s['Stade de Seattle'],kickoff_time:'2026-06-29T19:00:00Z',status:'upcoming'},
    {match_number:65,phase:'group',group_id:g['K'],home_team_id:t['uz'],away_team_id:t['pt'],stadium_id:s['Stade de Los Angeles'],kickoff_time:'2026-06-29T22:00:00Z',status:'upcoming'},
    {match_number:66,phase:'group',group_id:g['K'],home_team_id:t['cd'],away_team_id:t['co'],stadium_id:s['Stade de Seattle'],kickoff_time:'2026-06-30T01:00:00Z',status:'upcoming'},
    // GROUPE L
    {match_number:67,phase:'group',group_id:g['L'],home_team_id:t['gb-eng'],away_team_id:t['hr'],stadium_id:s['Stade de Philadelphie'],kickoff_time:'2026-06-18T22:00:00Z',status:'upcoming'},
    {match_number:68,phase:'group',group_id:g['L'],home_team_id:t['gh'],away_team_id:t['pa'],stadium_id:s['Stade de Kansas City'],kickoff_time:'2026-06-19T01:00:00Z',status:'upcoming'},
    {match_number:69,phase:'group',group_id:g['L'],home_team_id:t['gb-eng'],away_team_id:t['gh'],stadium_id:s['Stade de Philadelphie'],kickoff_time:'2026-06-25T22:00:00Z',status:'upcoming'},
    {match_number:70,phase:'group',group_id:g['L'],home_team_id:t['hr'],away_team_id:t['pa'],stadium_id:s['Stade de Kansas City'],kickoff_time:'2026-06-26T01:00:00Z',status:'upcoming'},
    {match_number:71,phase:'group',group_id:g['L'],home_team_id:t['pa'],away_team_id:t['gb-eng'],stadium_id:s['Stade de Philadelphie'],kickoff_time:'2026-06-29T23:00:00Z',status:'upcoming'},
    {match_number:72,phase:'group',group_id:g['L'],home_team_id:t['hr'],away_team_id:t['gh'],stadium_id:s['Stade de Kansas City'],kickoff_time:'2026-06-29T23:00:00Z',status:'upcoming'},
  ];

  for (const match of matches) {
    const { error } = await supabase.from('matches').insert(match);
    if (error) {
      console.error(`Erreur match ${match.match_number}:`, error.message);
    } else {
      console.log(`Match ${match.match_number} insere`);
    }
  }
  console.log('Termine !');
}

run().catch(console.error);
