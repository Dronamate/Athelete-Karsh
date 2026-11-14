export const SEARCH_CATEGORIES = [
  'Cricket (Batting and bowling)',
  'Fitness',
  'Physiotherapy',
  'Dietician',
  'Yoga and Meditation',
];

export const TRAINING_MODES = ['Online', 'Offline'];

export function persistAuthSession({ access, refresh, user }) {
  if (access) sessionStorage.setItem('access_token', access);
  if (refresh) sessionStorage.setItem('refresh_token', refresh);
  sessionStorage.setItem('user_role', user?.role || 'ATHLETE');
  sessionStorage.setItem('user_name', user?.username || user?.name || '');
  if (user?.id) sessionStorage.setItem('user_id', String(user.id));
}

