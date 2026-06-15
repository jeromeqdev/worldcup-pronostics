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
    // Groupe A derniers matchs
    { match_number: 33, phase: 'group', group_id: g['A'], home_team_id: t['mx'], away_team_id: t['cz'], stadium_id: s['Stade de Mexico'], kickoff_time: '2026-06-24T21:00:00Z', status: 'upcoming' },
    { match_number: 34, phase: 'group', group_id: g['A'], home_team_id: t['za'], away_team_id: t['kr'], stadium_id: s['Stade de Guadalajara'], kickoff_time: '2026-06-24T21:00:00Z', status: 'upcoming' },
    // Groupe B derniers matchs
    { match_number: 35, phase: 'group', group_id: g['B'], home_team_id: t['ca'], away_team_id: t['qa'], stadium_id: s['Stade de Toronto'], kickoff_time: '2026-06-25T18:00:00Z', status: 'upcoming' },
    { match_number: 36, phase: 'group', group_id: g['B'], home_team_id: t['ba'], away_team_id: t['ch'], stadium_id: s['Stade de San Francisco'], kickoff_time: '2026-06-25T18:00:00Z', status: 'upcoming' },
    // Groupe C derniers matchs
    { match_number: 37, phase: 'group', group_id: g['C'], home_team_id: t['es'], away_team_id: t['de'], stadium_id: s['Stade de Houston'], kickoff_time: '2026-06-25T21:00:00Z', status: 'upcoming' },
    { match_number: 38, phase: 'group', group_id: g['C'], home_team_id: t['cv'], away_team_id: t['jp'], stadium_id: s['Stade de Monterrey'], kickoff_time: '2026-06-25T21:00:00Z', status: 'upcoming' },
    // Groupe D derniers matchs
    { match_number: 39, phase: 'group', group_id: g['D'], home_team_id: t['us'], away_team_id: t['gh'], stadium_id: s['Stade de Los Angeles'], kickoff_time: '2026-06-26T18:00:00Z', status: 'upcoming' },
    { match_number: 40, phase: 'group', group_id: g['D'], home_team_id: t['pt'], away_team_id: t['py'], stadium_id: s['Stade de Kansas City'], kickoff_time: '2026-06-26T18:00:00Z', status: 'upcoming' },
    // Groupe E derniers matchs
    { match_number: 41, phase: 'group', group_id: g['E'], home_team_id: t['se'], away_team_id: t['nl'], stadium_id: s['Stade de Philadelphie'], kickoff_time: '2026-06-27T18:00:00Z', status: 'upcoming' },
    { match_number: 42, phase: 'group', group_id: g['E'], home_team_id: t['tn'], away_team_id: t['cr'], stadium_id: s['Stade de Miami'], kickoff_time: '2026-06-27T18:00:00Z', status: 'upcoming' },
    // Groupe F derniers matchs
    { match_number: 43, phase: 'group', group_id: g['F'], home_team_id: t['gb-eng'], away_team_id: t['sn'], stadium_id: s['Stade de Dallas'], kickoff_time: '2026-06-27T21:00:00Z', status: 'upcoming' },
    { match_number: 44, phase: 'group', group_id: g['F'], home_team_id: t['ir'], away_team_id: t['nz'], stadium_id: s['Stade de Seattle'], kickoff_time: '2026-06-27T21:00:00Z', status: 'upcoming' },
    // Groupe G derniers matchs
    { match_number: 45, phase: 'group', group_id: g['G'], home_team_id: t['sa'], away_team_id: t['co'], stadium_id: s['Stade de Los Angeles'], kickoff_time: '2026-06-28T18:00:00Z', status: 'upcoming' },
    { match_number: 46, phase: 'group', group_id: g['G'], home_team_id: t['uy'], away_team_id: t['sk'], stadium_id: s['Stade de Kansas City'], kickoff_time: '2026-06-28T18:00:00Z', status: 'upcoming' },
    // Groupe H derniers matchs
    { match_number: 47, phase: 'group', group_id: g['H'], home_team_id: t['be'], away_team_id: t['it'], stadium_id: s['Stade Atlanta'], kickoff_time: '2026-06-28T21:00:00Z', status: 'upcoming' },
    { match_number: 48, phase: 'group', group_id: g['H'], home_team_id: t['eg'], away_team_id: t['ec'], stadium_id: s['Stade de Miami'], kickoff_time: '2026-06-28T21:00:00Z', status: 'upcoming' },
    // Groupe J derniers matchs
    { match_number: 49, phase: 'group', group_id: g['J'], home_team_id: t['br'], away_team_id: t['cl'], stadium_id: s['Stade de San Francisco'], kickoff_time: '2026-06-29T18:00:00Z', status: 'upcoming' },
    { match_number: 50, phase: 'group', group_id: g['J'], home_team_id: t['ma'], away_team_id: t['hr'], stadium_id: s['Stade de Seattle'], kickoff_time: '2026-06-29T18:00:00Z', status: 'upcoming' },
    // Groupe K derniers matchs
    { match_number: 51, phase: 'group', group_id: g['K'], home_team_id: t['ar'], away_team_id: t['au'], stadium_id: s['Stade de Houston'], kickoff_time: '2026-06-29T21:00:00Z', status: 'upcoming' },
    { match_number: 52, phase: 'group', group_id: g['K'], home_team_id: t['ng'], away_team_id: t['pl'], stadium_id: s['Stade de Dallas'], kickoff_time: '2026-06-29T21:00:00Z', status: 'upcoming' },
    // Groupe L derniers matchs
    { match_number: 53, phase: 'group', group_id: g['L'], home_team_id: t['gb-eng2'], away_team_id: t['nl2'], stadium_id: s['Stade de Boston'], kickoff_time: '2026-06-30T18:00:00Z', status: 'upcoming' },
    { match_number: 54, phase: 'group', group_id: g['L'], home_team_id: t['sk2'], away_team_id: t['ke'], stadium_id: s['Stade de Philadelphie'], kickoff_time: '2026-06-30T18:00:00Z', status: 'upcoming' },
  ];

  for (const match of matches) {
    const { error } = await supabase.from('matches').insert(match);
    if (error) {
      console.error(`Erreur match ${match.match_number}:`, error.message);
    } else {
      console.log(`✅ Match ${match.match_number} inséré`);
    }
  }
  console.log('Terminé !');
}

run().catch(console.error);
