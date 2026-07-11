exports.handler = async (event, context) => {
  const mockStats = {
    timestamp: new Date().toISOString(),
    total_attendance: 67842,
    peak_density: 0.92,
    avg_wait_time: 4.2,
    alerts: [
      { type: 'warning', section: 'B1', message: 'High density detected' },
      { type: 'info', section: 'D1', message: 'Entry queue forming' }
    ]
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(mockStats)
  };
};