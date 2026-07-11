exports.handler = async (event, context) => {
  const mockMatches = [
    {
      id: 1,
      teams: { home: 'USA', away: 'Canada' },
      score: { home: 2, away: 1 },
      time: '67\'',
      status: 'live',
      stadium: 'MetLife Stadium'
    },
    {
      id: 2,
      teams: { home: 'Mexico', away: 'Argentina' },
      score: { home: 0, away: 0 },
      time: '23\'',
      status: 'live',
      stadium: 'AT&T Stadium'
    }
  ];

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(mockMatches)
  };
};