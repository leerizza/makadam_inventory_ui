const formatLedgerDate = (value) => {
  if (!value) return '-';

  // Ambil tanggal saja dari ISO / timestamptz
  const dateOnly = value.slice(0, 10); // 'YYYY-MM-DD'
  const [y, m, d] = dateOnly.split('-');
  return `${d}/${m}/${y}`; // 24/11/2025
};

export default formatLedgerDate;
