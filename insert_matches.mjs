import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nzhuixcithdgmvqwrszh.supabase.co',
  'sb_secret_naHrjkBzpY34TXy8mt2Q1A_kK-KKADK'
);

async function run() {
  // Récupérer les IDs
  const { data: groups } = await supabase.from('groups').select('id, name');
  const { data: teams } = await supabase.from('teams').select('id, country_code');
  const { data: stadiums } = await supabase.from('stadiums').select('id, name');

  const g = Object.fromEntries(groups.map(x => [x.name, x.id]));
  const t = Object.fromEntries(teams.map(x => [x.country_code, x.id]));
  const s = Object.fromEntries(stadiums.map(x => [x.name, x.id]));

  const matches = [
    // Groupe C
    { match_number: 16, phase: 'group', group_id: g['C'], home_team_id: t['es'], away_team_id: t['jp'], stadium_id: s['Stade de Houston'], kickoff_time: '2026-06-17T21:00:00Z', status: 'upcoming' },
    // Groupe E
    { match_number: 17, phase: 'group', group_id: g['E'], home_team_id: t['nl'], away_team_id: t['cr'], stadium_id: s['Stade de Kansas City'], kickoff_time: '2026-06-18T18:00:00Z', status: 'upcoming' },
    // Groupe F
    { match_number: 18, phase: 'group', group_id: g['F'], home_team_id: t['sn'], away_team_id: t['nz'], stadium_id: s['Stade de Dallas'], kickoff_time: '2026-06-18T21:00:00Z', status: 'upcoming' },
    // Groupe G
    { match_number: 19, phase: 'group', group_id: g['G'], home_team_id: t['co'], away_team_id: t['sk'], stadium_id: s['Stade de Los Angeles'], kickoff_time: '2026-06-19T00:00:00Z', status: 'upcoming' },
    // Groupe D
    { match_number: 20, phase: 'group', group_id: g['D'], home_team_id: t['pt'], away_team_id: t['py'], stadium_id: s['Stade de Miami'], kickoff_time: '2026-06-19T18:00:00Z', status: 'upcoming' },
    // Groupe H
    { match_number: 21, phase: 'group', group_id: g['H'], home_team_id: t['it'], away_team_id: t['ec'], stadium_id: s['Stade de Boston'], kickoff_time: '2026-06-19T21:00:00Z', status: 'upcoming' },
    // Groupe A
    { match_number: 22, phase: 'group', group_id: g['A'], home_team_id: t['mx'], away_team_id: t['kr'], stadium_id: s['Stade de Guadalajara'], kickoff_time: '2026-06-20T00:00:00Z', status: 'upcoming' },
    // Groupe J
    { match_number: 23, phase: 'group', group_id: g['J'], home_team_id: t['br'], away_team_id: t['hr'], stadium_id: s['Stade de San Francisco'], kickoff_time: '2026-06-20T18:00:00Z', status: 'upcoming' },
    // Groupe K
    { match_number: 24, phase: 'group', group_id: g['K'], home_team_id: t['ar'], away_team_id: t['ng'], stadium_id: s['Stade Atlanta'], kickoff_time: '2026-06-20T21:00:00Z', status: 'upcoming' },
    // Groupe L
    { match_number: 25, phase: 'group', group_id: g['L'], home_team_id: t['gb-eng'], away_team_id: t['nl2'], stadium_id: s['Stade de Philadelphie'], kickoff_time: '2026-06-21T00:00:00Z', status: 'upcoming' },
    // Groupe I
    { match_number: 26, phase: 'group', group_id: g['I'], home_team_id: t['fr'], away_team_id: t['iq'], stadium_id: s['Stade de New York'], kickoff_time: '2026-06-22T21:00:00Z', status: 'upcoming' },
    { match_number: 27, phase: 'group', group_id: g['I'], home_team_id: t['sn2'], away_team_id: t['no'], stadium_id: s['Stade de Boston'], kickoff_time: '2026-06-22T18:00:00Z', status: 'upcoming' },
    // Groupe J
    { match_number: 28, phase: 'group', group_id: g['J'], home_team_id: t['ma'], away_team_id: t['cl'], stadium_id: s['Stade de Seattle'], kickoff_time: '2026-06-23T18:00:00Z', status: 'upcoming' },
    // Groupe K
    { match_number: 29, phase: 'group', group_id: g['K'], home_team_id: t['au'], away_team_id: t['pl'], stadium_id: s['Stade de Dallas'], kickoff_time: '2026-06-23T21:00:00Z', status: 'upcoming' },
    // Groupe L
    { match_number: 30, phase: 'group', group_id: g['L'], home_team_id: t['gb-eng2'], away_team_id: t['sk2'], stadium_id: s['Stade de Miami'], kickoff_time: '2026-06-24T00:00:00Z', status: 'upcoming' },
    // Groupe I - dernier match
    { match_number: 31, phase: 'group', group_id: g['I'], home_team_id: t['fr'], away_team_id: t['no'], stadium_id: s['Stade de New York'], kickoff_time: '2026-06-26T21:00:00Z', status: 'upcoming' },
    { match_number: 32, phase: 'group', group_id: g['I'], home_team_id: t['sn2'], away_team_id: t['iq'], stadium_id: s['Stade de Boston'], kickoff_time: '2026-06-26T21:00:00Z', status: 'upcoming' },
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
