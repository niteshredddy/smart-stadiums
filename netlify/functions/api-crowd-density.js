exports.handler = async (event, context) => {
  // Mock data - replace with actual database call
  const mockData = {
    timestamp: new Date().toISOString(),
    sections: [
      { id: 'A1', density: 0.85, capacity: 5000, current: 4250 },
      { id: 'A2', density: 0.72, capacity: 4500, current: 3240 },
      { id: 'B1', density: 0.91, capacity: 6000, current: 5460 },
      { id: 'B2', density: 0.64, capacity: 5500, current: 3520 },
      { id: 'C1', density: 0.78, capacity: 4800, current: 3744 },
      { id: 'C2', density: 0.88, capacity: 5200, current: 4576 },
      { id: 'D1', density: 0.45, capacity: 4000, current: 1800 },
      { id: 'D2', density: 0.92, capacity: 5800, current: 5336 },
    ],
    total: {
      capacity: 40800,
      current: 31926,
      percentage: 78,
    },
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(mockData),
  };
};
